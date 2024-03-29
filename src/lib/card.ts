import { cardback, getCard } from "../catalog/catalog"
import { Color } from "../settings/settings"
import { keywords, Keyword } from "../catalog/keywords"
import { decodeCard } from "./codec"
import { Rarity } from "./rarity"

interface KeywordTuple {
  name: string
  x: number
  y: number
  value: number
}

interface ReferenceTuple {
  name: string
  x: number
  y: number
}

interface CardData {
  name: string
  id: number
  cost: number
  points: number
  text: string
  dynamicText: string
  story: string
  keywords: KeywordTuple[]
  references: ReferenceTuple[]
}

// For the tutorial, the card info shown will only be the mana/points
var simplifyCardInfo: boolean = false
export function setSimplifyCardInfo(simplify: boolean): void {
  simplifyCardInfo = simplify
}
export function getSimplifyCardInfo(): boolean {
  return simplifyCardInfo
}

export default class Card {
  name: string
  id: number
  cost: number
  points: number
  text: string
  rarity: Rarity
  story: string
  keywords: KeywordTuple[]
  references: ReferenceTuple[]
  
  dynamicText: string
  catalogText: string
  fleeting: boolean

  constructor(data: CardData) {
    this.name = data.name
    this.id = data.id
    this.cost = data.cost
    this.points = data.points
    this.text = data.text

    this.dynamicText = (data.dynamicText === undefined) ? '' : data.dynamicText

    this.keywords = data.keywords === undefined ? [] : data.keywords
    this.references = data.references === undefined ? [] : data.references

    // TODO Don't rely on card text like this
    this.fleeting = this.text.includes("Fleeting")

    // TODO Take out the check once all cards have story text
    this.story = (data.story === undefined) ? '' : data.story
  }

  getHintText(): string {
    let fullText = this.explainKeywords(this.text)

    let hintText = fullText.slice(`${this.text}\n\n`.length)

    return hintText
  }

  getReferencedCards(): Card[] {
    let result = []
    
    this.references.forEach(reference => {
      if (this.name !== reference.name) {
        result.push(getCard(reference.name))
      }
    })

    return result
  }

  // Get the text for this card, including formatting
  getCardText(): string {
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

    result = this.replaceReferences(result)
    result = this.explainKeywords(result)

    if (simplifyCardInfo) {
      result = result.split(',')[0]
      result = result.replace(':', ' mana:')
      
      if (result.endsWith('1')) {
        result += " point"
      } else {
        result += " points"
      }
    }

    // Add any hidden text that the search will find but won't be displayed
    result += '[size=0]'
    
    const rarityText = ['Common', 'Uncommon', 'Rare', 'Legend']
    result += `${rarityText[this.rarity]} `

    result += '[/size]'

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
        regex = new RegExp(/\b/.source + keyword.key + ' ' + /(X|-?[0-9]*)\b/.source, "i")
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

        // NOTE Special case for occurences of +X, where X could be -N, so you want -N instead of +-N
        txt = txt.split(/\+\-/).join('-')
      }

      cardText += txt
    }

    return cardText
  }
}
