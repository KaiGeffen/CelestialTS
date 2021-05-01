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

export const starterCards: Card[] = []
let maybes = ['Dove', 'Swift', 'Mine', 'Force']
let starterList = ['Stars', 'Crossed Bones', 'Dash', 'Gift', 'Dinosaur Bones', 'Tumulus', 'Sarcophagus', 'Anubis']
collectibleCards.forEach( (card) => {
	if (starterList.includes(card.name)) {
		starterCards.push(card)
	}
})
