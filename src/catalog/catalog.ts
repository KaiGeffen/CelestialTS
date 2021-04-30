import data from "./catalog.json"
import expansionData from "./catalogExpansion.json"
import tokenData from "./tokens.json"


export const baseCards: Card[] = data
export const collectibleCards: Card[] = data.concat(expansionData)

export const tokenCards: Card[] = tokenData
export const allCards: Card[] = collectibleCards.concat(tokenCards)
export const cardback: Card = tokenCards[0]

export const starterCards: Card[] = []
let maybes = ['Dove', 'Swift', 'Mine', 'Force']
let starterList = ['Stars', 'Crossed Bones', 'Dash', 'Gift', 'Dinosaur Bones', 'Tumulus', 'Sarcophagus', 'Anubis']
collectibleCards.forEach( (card) => {
	if (starterList.includes(card.name)) {
		starterCards.push(card)
	}
})

function sortByCost(card1: Card, card2): number {
	if (card1.cost < card2.cost)
  {
    return -1
  }
  else if (card1.cost > card2.cost)
  {
    return 1
  }
  else
  {
    return 0
  }
}

export interface Card {
  name: string;
  id: number;
  cost: number;
  text: string;
}
