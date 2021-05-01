import data from "./catalog.json"
import expansionData from "./catalogExpansion.json"
import tokenData from "./tokens.json"

import { keywords, Keyword } from "./keywords"
import { ColorSettings, StyleSettings, UserSettings } from "../settings"
import { decodeCard } from "../lib/codec"



// Reorganize files
export class Card {
  name: string
  id: number
  cost: number
  text: string
  dynamicText: string

  Card(name, id, cost, text, dynamicText='') {
    this.name = name
    this.id = id
    this.cost = cost
    this.text = text

    this.dynamicText = dynamicText
  }

  getCardText(): string {
    if (this === cardback) {
      return '?'
    }
    
    // Set the hover text
    let result = this.name + '\n'

    if (this['dynamicText'] !== undefined)
    {
      result += this['dynamicText']
    }
    else
    {
      result += this.text
    }

    result = this.replaceReferences(result)
    if (UserSettings._get('explainKeywords')) {
      result = this.explainKeywords(result)
    }

    if (simplifyCardInfo) {
      result = result.split(',')[0]
      result = result.replace(':', ' mana:')
      
      if (result.endsWith('1')) {
        result += " point"
      } else {
        result += " points"
      }
    }

    return result
  }

  // Replace all refences to other cards in this cardText with those card's name + text
  private replaceReferences(cardText: string): string {
    // Find each id reference and add the refenced card's text at the end
    let expr = /\${(\d+)}/
    
    // Replace all id references with the name of the card they reference
    let referencedCards: Card[] = []
    function replaceName(match: string, cardId: string, ...args): string
    {
      let card = decodeCard(cardId)

      // Add to a list of refenced cards
      if (!referencedCards.includes(card)) {
        referencedCards.push(card)
      }

      return `${card.name}`
    }

    // Replace each reference with that card's name
    cardText = cardText.replace(expr, replaceName)

    // Add a full explanation of the card at the end
    if (referencedCards.length > 0) {
      cardText += '\n'
    }
    for (const card of referencedCards) {
      cardText += `\n${card.name} - ${card.text}`
    }

    return cardText
  }

  // Add an explanation of each existing keyword in cardText to the end of the text
  private explainKeywords(cardText: string): string {

    // Find which keywords are present
    let presentKeywords: Keyword[] = []
    for (const keyword of keywords) {

      let regex = new RegExp(/\b/.source + keyword.key + /\b/.source, "i")
      
      if (regex.test(cardText)) {
        presentKeywords.push(keyword)
      }
    }

    // Add each present keyword's text at the end of the cardText
    if (presentKeywords.length > 0) {
      cardText += '\n'
    }
    for (const keyword of presentKeywords) {
      cardText += `\n${keyword.text}`
    }

    return cardText
  }
}






export const baseCards: Card[] = new Card(data)
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

interface CardData {
  name: string
  id: number
  cost: number
  text: string
}


