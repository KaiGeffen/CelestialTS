import data from "./catalog.json"
import expansionData from "./catalogExpansion.json"
import tokenData from "./tokens.json"

import { keywords, Keyword } from "./keywords"
import { ColorSettings, StyleSettings, UserSettings } from "../settings"
import { decodeCard } from "../lib/codec"
import Card from "../lib/card"


function dataToCards(_data: any[]): Card[] {
  return _data.map(card => new Card(card))
}

export const baseCards: Card[] = dataToCards(data)
export const collectibleCards: Card[] = baseCards.concat(dataToCards(expansionData))

export const tokenCards: Card[] = dataToCards(tokenData)
export const allCards: Card[] = collectibleCards.concat(tokenCards)
export const cardback: Card = tokenCards[0]

// Add each of the starter lists
function populateStarterList(cardList: Card[], cardNames: string[]): void {
	collectibleCards.forEach( (card) => {
		if (cardNames.includes(card.name)) {
			cardList.push(card)
		}
	})
}

export const starterAnubis: Card[] = []
let anubisCardNames = ['Stars', 'Crossed Bones', 'Dash', 'Gift', 'Dinosaur Bones', 'Tumulus', 'Sarcophagus', 'Anubis']
populateStarterList(starterAnubis, anubisCardNames)

export const starterRobot: Card[] = []
let robotCardNames = ['Stars', 'Cog', 'Crossed Bones', 'Gears', 'Gift', 'Factory', 'Mine', 'AI']
populateStarterList(starterRobot, robotCardNames)
