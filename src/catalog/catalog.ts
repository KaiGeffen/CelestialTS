import data from "./catalog.json"
import tokenData from "./tokens.json"
import devData from "./devCatalog.json"

import Card from "../lib/card"


function dataToCards(_data: any[]): Card[] {
  return _data.map(card => new Card(card))
}

export const baseCards: Card[] = dataToCards(data)

const devMode = new URLSearchParams(window.location.search).has('dev') || location.port === '4949'
const devCards = [] // devMode ? dataToCards(devData) : []

let availableCards = [...baseCards, ...devCards]


// Collectible cards are sorted by cost
export const collectibleCards = availableCards
  .sort(function(a: Card, b: Card): number {
  if (a.cost > b.cost) {
    return 1
  } else if (a.cost < b.cost) {
    return -1
  } else {
    return 0
  }
})

export const tokenCards: Card[] = dataToCards(tokenData)

export const cardback: Card = tokenCards[0]

export const allCards: Card[] = collectibleCards.concat(tokenCards)

// Return the card with the given id, or undefined if none exists
export function getCard(target: number | string): Card {

  for(let i = 0; i < allCards.length; i++) {
    let card = allCards[i]
    if (card.id === target || card.name === target) {
      return card
    }
  }

  return undefined
}
