import data from "./catalog.json"
import tokenData from "./tokens.json"


export const collectibleCards: Card[] = data
export const tokenCards: Card[] = tokenData
export const allCards: Card[] = collectibleCards.concat(tokenCards)
export const cardback: Card = tokenCards[0]

export const starterCards: Card[] = []
let maybes = ['Dove', 'Swift', 'Mine']
let starterList = ['Stars', 'Crossed Bones', 'Dash', 'Gift', 'Dinosaur Bones', 'Force', 'Sarcophagus', 'Anubis']
collectibleCards.forEach( (card) => {
	if (starterList.includes(card.name)) {
		starterCards.push(card)
	}
})

export interface Card {
  name: string;
  id: number;
  cost: number;
  text: string;
}
