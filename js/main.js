import { ajaxGet } from './ajax.js'
/* Console log*/
let log = console.log

/* Variables */
/* En local finalUrlSite va permettre d'avoir les données JSON à enlever par la suite et mettre la bonne url */
let urlSite = document.location.href
let newUrlSite = urlSite.split("1:")
let finalUrlSite = newUrlSite[1].substr(0, 5)
let total = []

/* Selecteurs */ 
let itemsWrapper = document.getElementById('itemsWrapper')
let popularWrapper = document.getElementById('popularWrapper')

/* Les déclencheurs */
document.addEventListener('DOMContentLoaded', affichageMenu)
document.addEventListener('DOMContentLoaded', affichagePopular)
itemsWrapper.addEventListener('click', affichageChoixMenu)
popularWrapper.addEventListener('click', affichageChoixMenu)

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
  cote.innerHTML = ""
  let final = total.reduce((a, b) => a + b, 0)
  let result = Math.round(final * 100) / 100
  
  cote.innerText = result + " €"
}

function affichageCommande (itemId) {
  log(itemId.id)
  let orderList = document.getElementById("orderList")
  let blockItem = document.createElement("div")
  let imageItem = document.createElement("img")
  let infoItem =  document.createElement("p")

  blockItem.className = "itemOrder"
  imageItem.src = '../icons/'+ itemId.icon
  infoItem.innerHTML = itemId.name + '<br><span class="itemOrderPrice">' + itemId.price + " €</span>"

  blockItem.appendChild(imageItem)
  blockItem.appendChild(infoItem)
  orderList.appendChild(blockItem)
}


