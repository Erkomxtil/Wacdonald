/* Import de la fonction ajax */
import { ajaxGet } from './ajax.js'

/* Console log pour faciliter la recherche d'erreurs */
let log = console.log

/* Variables ----------------------------------------------------------------------*/
/* En local finalUrlSite va permettre d'avoir les données JSON à enlever par la suite et mettre la bonne url  
let urlSite = document.location.href
let newUrlSite = urlSite.split("1:")
let finalUrlSite = newUrlSite[1].substr(0, 5)
A utiliser de la manière suivante
ajaxGet("adresseLocalHost" + finalUrlSite + "/menu.json", (reponse) => {
  let dataItems = JSON.parse(reponse) // la réponse JSon que l'on exploite
})
*/

let total = [] /* On créer le tableau du total */
let itemOrdered = [] /* On vérifie si on a déjà commandé cet article avec l'id du produit */

/* Selecteurs ---------------------------------------------------------------------*/ 
let itemsWrapper = document.getElementById('itemsWrapper')
let popularWrapper = document.getElementById('popularWrapper')
let orderList = document.getElementById("orderList")
let minus = orderList.children
let globalOrderPrice = document.querySelector(".globalOrder")
let finCommandeBtn = document.querySelector(".btnDone")

/* Les déclencheurs  --------------------------------------------------------------*/
document.addEventListener('DOMContentLoaded', affichageMenu)
document.addEventListener('DOMContentLoaded', affichagePopular)
itemsWrapper.addEventListener('click', affichageChoixMenu)
popularWrapper.addEventListener('click', affichageChoixMenu)
finCommandeBtn.addEventListener('click', finCommande)


/* Ajouter ou retirer un article à droite */
orderList.addEventListener('click', addItem)
orderList.addEventListener('click', removeItem)

/* Functions ---------------------------------------------------------------------*/
function affichageMenu () { 
  ajaxGet("https://erkomxtil.github.io/Wacdonald/menu.json", (reponse) => {
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
        image.src = '/icons/'+item.icon
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
  ajaxGet("https://erkomxtil.github.io/Wacdonald/menu.json", (reponse) => {
    let popularItems = JSON.parse(reponse)
    for (let popularItem of popularItems) {
      if (popularItem.id > 6) {
        let blockPopular = document.createElement('div')
        blockPopular.className = "popularItem"
        blockPopular.dataset.id = popularItem.id
        let image = document.createElement("img")
        image.src = '/icons/'+ popularItem.icon
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
    ajaxGet("https://erkomxtil.github.io/Wacdonald/menu.json", (reponse) => {
      let dataItems = JSON.parse(reponse)
      for (let item of dataItems) {
        if (item.id === itemTarget) {
          affichageCommande(item) 
        }
      }
    })
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
    imageItem.src = '/icons/'+ itemId.icon
    infoItem.innerHTML = itemId.name + '<br><span class="itemOrderPrice">' + itemId.price + " €</span>"
    buttonItem.innerHTML = '<button class="minus">-</button><span class="countItem"> 1 </span><button class="plus">+</button>'
    
    blockItem.appendChild(imageItem)
    blockItem.appendChild(infoItem)
    blockItem.appendChild(buttonItem)
    orderList.appendChild(blockItem)
  }

  if(!itemOrdered.includes(itemId.id)) {
    itemOrdered.push(itemId.id)
    buttonItem.innerHTML = ""
    blockItem.className = "itemOrder"
    blockItem.dataset.id_order = itemId.id
    imageItem.src = '/icons/'+ itemId.icon
    infoItem.innerHTML = itemId.name + '<br><span class="itemOrderPrice">' + itemId.price + " €</span>"
    buttonItem.innerHTML = '<button class="minus">-</button><span class="countItem"> 1 </span><button class="plus">+</button>'
    
    blockItem.appendChild(imageItem)
    blockItem.appendChild(infoItem)
    blockItem.appendChild(buttonItem)
    orderList.appendChild(blockItem)
  }

  affichageTotalDocument()
}

function commandeSommeTotal (tableau) {  
  // Affichage du total de la commande 
  let cote = document.querySelector(".globalOrder")
  let final = tableau.reduce((a, b) => a + b, 0)
  let result = Math.round(final * 100) / 100
  
  cote.innerHTML = ""
  if (result.toString().indexOf(".") !== -1 ){
    cote.innerText = result + "0 €"
  } else {
    cote.innerText = result + ".00 €"
  } 
}

function addItem (e) {
  if(e.target.classList.contains("plus")) {
    let plusOne = e.target.parentNode.querySelector(".countItem")
    let countText = Number(e.target.parentNode.querySelector(".countItem").innerText)
    plusOne.innerText = countText + 1
  }

  affichageTotalPlusMoins ()
}

function removeItem (e) {
  if(e.target.classList.contains("minus")) {
    let idOfItemRemoved = Number(e.target.parentNode.parentNode.dataset.id_order)
    let minusOne = e.target.parentNode.querySelector(".countItem")
    let countText = Number(e.target.parentNode.querySelector(".countItem").innerText)
    if (countText - 1 === 0){
      e.target.parentNode.parentNode.remove() /* J'enlève le produit qui a été commandé */
      let indexOfId = itemOrdered.indexOf(idOfItemRemoved) /* Je prend l'index du produit pour l'enlever du tableau itemOrdered */
      if(indexOfId > -1) {
        itemOrdered.splice(indexOfId, 1)
      }
    } else {
      minusOne.innerText = countText - 1
    }
  }

  affichageTotalPlusMoins()
}

function affichageTotalDocument () {
  let orderLength = orderList.childNodes.length
  if (orderLength === 1){
    ajaxGet("https://erkomxtil.github.io/Wacdonald/menu.json", (reponse) => {
      let dataItems = JSON.parse(reponse)
      let idMenu = orderList.childNodes[0].dataset.id_order
      for (let item of dataItems) {
        if(item.id === Number(idMenu)) {
          total.push
          globalOrderPrice.innerText = item.price + " €"
        }
      }
    })
  } else {
    total = []
    let allItemsOrdered = orderList.childNodes
    for (let item of allItemsOrdered) {
      let rawPrice = item.querySelector(".itemOrderPrice").innerText
      let splitPrice = rawPrice.split(" ")
      let price = Number(splitPrice[0])
      let countItem = Number(item.querySelector(".countItem").innerText)
      let result = price * countItem
      total.push(result)
      globalOrderPrice.innerText = result + " €"
    }
    commandeSommeTotal(total)
  } 
}

function   affichageTotalPlusMoins () {
  total = []
  let allItemsOrdered = orderList.childNodes
  for (let item of allItemsOrdered) {
    let rawPrice = item.querySelector(".itemOrderPrice").innerText
    let splitPrice = rawPrice.split(" ")
    let price = Number(splitPrice[0])
    let countItem = Number(item.querySelector(".countItem").innerText)
    let result = price * countItem
    total.push(result)
    globalOrderPrice.innerText = result + " €"
  }
  commandeSommeTotal(total)
}

function finCommande () {
  let sommeTotal = document.querySelector(".globalOrder").innerText
  alert("Le montant de votre commande est de "+ sommeTotal +" .\nMerci et à bientôt chez WacDonald ! ")
  document.location.reload(true)
}
