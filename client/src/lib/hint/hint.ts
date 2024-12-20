import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'

import {
  Style,
  BBStyle,
  Color,
  Time,
  UserSettings,
  Space,
} from '../../settings/settings'
import Card, { KeywordTuple } from '../../../../shared/state/card'
import BaseScene from '../../scene/baseScene'
import { allCards, getCard } from '../../catalog/catalog'
import { Keyword, ALL_KEYWORDS } from '../../catalog/keywords'
import BaseHint from './baseHint'
import { ALL } from 'dns'

export default class Hint extends BaseHint {
  showCard(card: Card | string): Hint {
    this.show()

    // Get the card
    if (typeof card === 'string') {
      card = allCards.filter((c) => c.name === card)[0]
      // card = getCard(card)
    }

    // Get cards referenced by this card
    const refs: Card[] = getReferencedCards(card)
      // .map((card) => {
      //   return ` [img=${card.name}]`
      // })
      // .join()

    // Get all keywords present in this or any referenced card
    let keywords: KeywordTuple[]  = []
    ;[card, ...refs].forEach((card) => {
      keywords.push(...card.keywords)
    })

    // 
    for (const keyword of ALL_KEYWORDS) {
      if (keyword.key === )
      for ()
    }

    // Get the hint text for the card
    let hintText = getHintText(card)
    const referencedImages = card
      .getReferencedCards()
      .map((card) => {
        return ` [img=${card.name}]`
      })
      .join()
    if (hintText !== '') {
      this.showText(hintText)

      // NOTE This is a hack because of a bug where card image renders with a single line's height
      this.txt
        .setText(`[img=${card.name}]`)
        .appendText(`[color=grey]${referencedImages}[/color]`)
        .appendText('\n\n\n\n\n\n\n\n\n\n\n\n')
        .appendText(`\n${hintText}`)
        .setFixedSize(0, 0)
    } else {
      const width =
        card.getReferencedCards().length > 0
          ? Space.maxTextWidth + Space.pad
          : Space.cardWidth + Space.pad
      this.txt
        .setText(`[img=${card.name}]`)
        .appendText(`${referencedImages}`)
        .setFixedSize(width, Space.cardHeight + Space.pad)
    }

    return this
  }

  // TODO Use in more places, instead of forming a string then passing to showText
  showKeyword(name: string): void {
    ALL_KEYWORDS.forEach((keyword) => {
      if (keyword.key === name) {
        let s = keyword.text

        if (keyword.x) {
          s = s.replace(' X', '')
        }

        this.showText(s)
        return
      }
    })
  }
}

// Get the list of all cards referenced by this card
function getReferencedCards(card: Card): Card[] {
  let result = []

  this.references.forEach((reference) => {
    if (this.name !== reference.name) {
      result.push(getCard(reference.name))
    }
  })

  return result
}

function getHintText(card: Card): string {
  let result = ''

  // The keywords that are present in this card's text, as well as what value each has (Number, X, or undefined)
  let presentKeywords: [Keyword, string][] = []
  for (const keyword of ALL_KEYWORDS) {
    let regex: RegExp

    // If this keyword doesn't have an X
    // TODO Rename the field to 'hasX'
    if (!keyword.x) {
      // Search for just the keyword
      regex = new RegExp(/\b/.source + keyword.key + /\b/.source, 'i')
    } else {
      // Search for the keyword and a number
      regex = new RegExp(
        /\b/.source + keyword.key + ' ' + /(X|-?[0-9]*)\b/.source,
        'i',
      )
    }

    let match = card.text.match(regex)
    if (match !== null) {
      presentKeywords.push([keyword, match[1]])
    }
  }

  // Add each present keyword's text at the end of the cardText
  if (presentKeywords.length > 0) {
    result += '\n'
  }
  for (const [keyword, x] of presentKeywords) {
    let txt = `${keyword.text}`

    if (x) {
      // NOTE This is replaceAll, but supported on all architectures
      txt = txt.split(/\bX\b/).join(x)

      // NOTE Special case for occurences of +X, where X could be -N, so you want -N instead of +-N
      txt = txt.split(/\+\-/).join('-')
    }

    result += txt
  }

  return result
}
