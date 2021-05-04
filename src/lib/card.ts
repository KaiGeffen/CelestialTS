import { cardback,  } from "../catalog/catalog"
import { UserSettings, ColorSettings } from "../settings"
import { keywords, Keyword } from "../catalog/keywords"
import { decodeCard } from "./codec"


interface CardData {
  name: string
  id: number
  cost: number
  text: string
  dynamicText: string
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
    this.name = data.name
    this.id = data.id
    this.cost = data.cost
    this.text = data.text

    this.dynamicText = (data.dynamicText === undefined) ? '' : data.dynamicText
  }

  // Get the text for this card, including formatting
  // If explainKeywords is true, ignore the user setting explainKeywords
  getCardText(explainKeywords: Boolean = false): string {
    if (this === cardback) {
      return '?'
    }
    
    // Set the hover text
    let result = `[u]${this.name}[/u]\n`

    if (this.dynamicText !== '')
    {
      result += this.dynamicText
    }
    else
    {
      result += this.text
    }

    // All reference/reminder text is grey
    result += `[color=${ColorSettings.reminderText}]`

    result = this.replaceReferences(result)
    if (UserSettings._get('explainKeywords') || explainKeywords) {
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

    result += '[/color]'

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
      cardText += `\n[img=${card.name}] ${card.name} - ${card.text}`
    }

    return cardText
  }

  // Add an explanation of each existing keyword in cardText to the end of the text
  private explainKeywords(cardText: string): string {

    // The keywords that are present in this card's text, as well as what value each has (Number, X, or undefined)
    let presentKeywords: [Keyword, string][] = []
    for (const keyword of keywords) {

      let regex: RegExp
      if (!keyword.x) {
        regex = new RegExp(/\b/.source + keyword.key + /\b/.source, "i")
      }
      else {
        regex = new RegExp(/\b/.source + keyword.key + ' ' + /(X|[0-9]*)\b/.source, "i")
      }

      let match = cardText.match(regex)
      if (match !== null) {
        presentKeywords.push([keyword, match[1]])
      }
    }

    // Add each present keyword's text at the end of the cardText
    if (presentKeywords.length > 0) {
      cardText += '\n'
    }
    for (const [keyword, x] of presentKeywords) {
      let txt = `\n${keyword.text}`

      if (x) {
        // NOTE This is replaceAll, but supported on all architectures
        txt = txt.split(/\bX\b/).join(x)
      }

      cardText += txt
    }

    return cardText
  }
}
