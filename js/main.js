import { ajaxGet } from './ajax.js'
/* Console log*/
let log = console.log

/* Variables */
/* En local finalUrlSite va permettre d'avoir les données JSON à enlever par la suite et mettre la bonne url */
let urlSite = document.location.href
let newUrlSite = urlSite.split("1:")
let finalUrlSite = newUrlSite[1].substr(0, 5)
let total = [] /* On créer le tableau du total */
let itemOrdered = [] /* On vérifie si on a déjà commandé cet article avec l'id du produit */

/* Selecteurs */ 
let itemsWrapper = document.getElementById('itemsWrapper')
let popularWrapper = document.getElementById('popularWrapper')
let orderList = document.getElementById("orderList")
let minus = orderList.children

/* Les déclencheurs */
document.addEventListener('DOMContentLoaded', affichageMenu)
document.addEventListener('DOMContentLoaded', affichagePopular)
itemsWrapper.addEventListener('click', affichageChoixMenu)
popularWrapper.addEventListener('click', affichageChoixMenu)
orderList.addEventListener('click', addItem)


/* Functions */
function affichageMenu () { 
  ajaxGet("http://127.0.0.1:" + finalUrlSite + "/menu.json", (reponse) => {
    let dataItems = JSON.parse(reponse)
    for (let item of dataItems) {
      if (item.id < 7) {
        let blockItem = document.createElement("div")
        blockItem.className = "item"
        blockItem.dataset.id = item.id
        if (item.promo !== null) {
          blockItem.classList.add('promo')
        }
        let image = document.createElement("img")
        image.src = '../icons/'+item.icon
        let infos = document.createElement('p')
        let promo = item.promo !== null ? '<span class="promoTxt">'+ item.promo + '</span>' : ''
        infos.innerHTML = item.name + "<br>" + promo
        blockItem.appendChild(image)        
        blockItem.appendChild(infos)
        itemsWrapper.appendChild(blockItem)        
      }
    }
  })
}

function affichagePopular () {
  ajaxGet("http://127.0.0.1:" + finalUrlSite + "/menu.json", (reponse) => {
    let popularItems = JSON.parse(reponse)
    for (let popularItem of popularItems) {
      if (popularItem.id > 6) {
        let blockPopular = document.createElement('div')
        blockPopular.className = "popularItem"
        blockPopular.dataset.id = popularItem.id
        let image = document.createElement("img")
        image.src = '../icons/'+ popularItem.icon
        let infos = document.createElement('p')
        infos.innerHTML = popularItem.name + '<br><span class="price">' + popularItem.price + ' €</span>'
        blockPopular.appendChild(image)
        blockPopular.appendChild(infos)
        popularWrapper.appendChild(blockPopular)
      }
    }
  })
}

function affichageChoixMenu (e) {
  let itemTarget = Number(e.target.dataset.id)
  if (itemTarget !== undefined) {
    ajaxGet("http://127.0.0.1:" + finalUrlSite + "/menu.json", (reponse) => {
      let dataItems = JSON.parse(reponse)
      for (let item of dataItems) {
        if (item.id === itemTarget) {
          if (item.promo !== null) {
            let promo = item.promo.split('%')
            let promoPrice = (item.price * Number(promo[0])) / 100
            let discountPrice = item.price - promoPrice
            
            total.push(discountPrice)
          } else {
            total.push(item.price)          
          }
          affichageCommande(item) 
        }
      }
      commandeSommeTotal()
    })
  }
}

function commandeSommeTotal (e) {  
  /* Affichage du total de la commande */ 
  let cote = document.querySelector(".globalOrder")
  let final = total.reduce((a, b) => a + b, 0)
  let result = Math.round(final * 100) / 100
  
  cote.innerHTML = ""
  if (result.toString().indexOf(".") !== -1 ){
    cote.innerText = result + "0 €"
  } else {
    cote.innerText = result + ".00 €"
  }
}

function affichageCommande (itemId) {
  let blockItem = document.createElement("div")
  let imageItem = document.createElement("img")
  let infoItem =  document.createElement("p")
  let buttonItem = document.createElement('div')
  let datasetOrder = orderList.childNodes

  if (datasetOrder.length < 1 ) {    
    blockItem.className = "itemOrder"
    blockItem.dataset.id_order = itemId.id
    imageItem.src = '../icons/'+ itemId.icon
    infoItem.innerHTML = itemId.name + '<br><span class="itemOrderPrice">' + itemId.price + " €</span>"
    buttonItem.innerHTML = '<button class="minus">-</button><span class="countItem"> 1 </span><button class="plus">+</button>'
    
    blockItem.appendChild(imageItem)
    blockItem.appendChild(infoItem)
    blockItem.appendChild(buttonItem)
    orderList.appendChild(blockItem)
  }

  if(itemOrdered.includes(itemId.id)) {
    for (let itemDiv of orderList.childNodes) {
      let datasetItem = Number(itemDiv.dataset.id_order)
      if (datasetItem === itemId.id) {                  
        itemDiv.childNodes[2].innerHTML ='<button class="minus">-</button><span class="countItem"> 1 </span><button class="plus">+</button>'
      }
    }
  } else {
    itemOrdered.push(itemId.id)
    buttonItem.innerHTML = ""
    blockItem.className = "itemOrder"
    blockItem.dataset.id_order = itemId.id
    imageItem.src = '../icons/'+ itemId.icon
    infoItem.innerHTML = itemId.name + '<br><span class="itemOrderPrice">' + itemId.price + " €</span>"
    buttonItem.innerHTML = '<button class="minus">-</button><span class="countItem"> 1 </span><button class="plus">+</button>'
    
    blockItem.appendChild(imageItem)
    blockItem.appendChild(infoItem)
    blockItem.appendChild(buttonItem)
    orderList.appendChild(blockItem)
  }
}

function addItem (e){
  let blockItemOrder = e.target.parentNode.parentNode
  let datasetItem = blockItemOrder.dataset.id_order
  let currentCount = Number(e.target.parentNode.childNodes[1].innerText)
  let countText = e.target.parentNode.childNodes[1]
  log(blockItemOrder)

  let count = Number(e.currentTarget.querySelector('.countItem' ).innerText)
  
  if (minus !== undefined){
    if (e.target.className === "plus") {
      countText.innerText = currentCount + 1
    }
    if (e.target.className === "minus") {
      log(currentCount)
      if ((currentCount -1) < 1) {
        blockItemOrder.remove()
      }
      countText.innerText = Number(currentCount) - 1
    }
  } 
}

