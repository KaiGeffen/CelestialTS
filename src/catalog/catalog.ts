import data from "./catalog.json"
import expansionData from "./catalogExpansion.json"
import tokenData from "./tokens.json"
// import developmentData from "./catalogDevelopment.json"

import Card from "../lib/card"


function dataToCards(_data: any[]): Card[] {
  return _data.map(card => new Card(card))
}

export const baseCards: Card[] = dataToCards(data)

let availableCards
if (location.port === '4949') {
  // availableCards = baseCards.concat(dataToCards(expansionData)).concat(dataToCards(developmentData))
  availableCards = baseCards.concat(dataToCards(expansionData))
} else {
  availableCards = baseCards.concat(dataToCards(expansionData))
}


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
export function getCard(id: number): Card {

  for(let i = 0; i < collectibleCards.length; i++) {
    let card = collectibleCards[i]
    if (card.id === id) {
      return card
    }
  }

  return undefined
}
