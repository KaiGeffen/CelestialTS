import { cardback,  } from "../catalog/catalog"
import { UserSettings } from "../settings"
import { keywords, Keyword } from "../catalog/keywords"
import { decodeCard } from "./codec"


interface CardData {
  name: string
  id: number
  cost: number
  text: string
}

// For the tutorial, the card info shown will only be the mana/points
var simplifyCardInfo: Boolean = false
export function setSimplifyCardInfo(simplify: Boolean): void {
  simplifyCardInfo = simplify
}

export default class Card {
  name: string
  id: number
  cost: number
  text: string
  dynamicText: string

  constructor(data: CardData) {
    // name, id, cost, text, dynamicText='') {
    this.name = data.name
    this.id = data.id
    this.cost = data.cost
    this.text = data.text

    this.dynamicText = '' //dynamicText
  }

  getCardText(): string {
    if (this === cardback) {
      return '?'
    }
    
    // Set the hover text
    let result = this.name + '\n'

    if (this['dynamicText'] !== '')
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
