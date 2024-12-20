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
import Catalog from '../../../../shared/state/catalog'
import BaseScene from '../../scene/baseScene'
import { Keyword, getKeyword } from '../../../../shared/state/keyword'
import BaseHint from './baseHint'
import { ALL } from 'dns'

export default class Hint extends BaseHint {
  showCard(card: Card | string): Hint {
    this.show()

    // Get the card
    if (typeof card === 'string') {
      card = Catalog.getCard(card)
      // card = getCard(card)
    }

    // Get cards referenced by this card
    const refs: Card[] = getReferencedCards(card)

    // Get all keywords present in this or any referenced card
    const keywordTuples: KeywordTuple[] = []
    ;[card, ...refs].forEach((card) => {
      card.keywords.forEach((kt) => {
        // If this keyword hasn't been seen before, add this tuple (Including X value)
        if (!keywordTuples.some((k) => k.name === kt.name)) {
          keywordTuples.push(kt)
        }
      })
    })

    // String for all referenced cards
    const referencedImages = refs.map((card) => ` [img=${card.name}]`).join()
    console.log(referencedImages)
    if (keywordTuples.length === 0) {
      const width =
        referencedImages.length > 0
          ? Space.maxTextWidth + Space.pad
          : Space.cardWidth + Space.pad
      this.txt
        .setText(`[img=${card.name}]`)
        .appendText(`${referencedImages}`)
        .setFixedSize(width, Space.cardHeight + Space.pad)
    } else {
      // The hint relating to keywords
      const keywordsText = getKeywordsText(keywordTuples)

      this.showText(keywordsText)

      // NOTE This is a hack because of a bug where card image renders with a single line's height
      this.txt
        .setText(`[img=${card.name}]`)
        .appendText(`[color=grey]${referencedImages}[/color]`)
        .appendText('\n\n\n\n\n\n\n\n\n\n\n\n')
        .appendText(`\n${keywordsText}`)
        .setFixedSize(0, 0)
    }

    return this
  }

  // // Get the hint text for the card
  // let hintText = getHintText(card)
  // const referencedImages = card
  //   .getReferencedCards()
  //   .map((card) => {
  //     return ` [img=${card.name}]`
  //   })
  //   .join()
  // if (hintText !== '') {
  //   this.showText(hintText)

  //   // NOTE This is a hack because of a bug where card image renders with a single line's height
  //   this.txt
  //     .setText(`[img=${card.name}]`)
  //     .appendText(`[color=grey]${referencedImages}[/color]`)
  //     .appendText('\n\n\n\n\n\n\n\n\n\n\n\n')
  //     .appendText(`\n${hintText}`)
  //     .setFixedSize(0, 0)
  // } else {
  //   const width =
  //     card.getReferencedCards().length > 0
  //       ? Space.maxTextWidth + Space.pad
  //       : Space.cardWidth + Space.pad
  //   this.txt
  //     .setText(`[img=${card.name}]`)
  //     .appendText(`${referencedImages}`)
  //     .setFixedSize(width, Space.cardHeight + Space.pad)
  // }

  // return this

  // TODO Use in more places, instead of forming a string then passing to showText
  showKeyword(name: string): void {
    const keyword = getKeyword(name)
    if (keyword) {
      this.showText(keyword.text.replace(' X', ''))
    }
  }
}

// Get the list of all cards referenced by this card
function getReferencedCards(card: Card): Card[] {
  let result = []
  console.log('getting')

  card.references.forEach((reference) => {
    if (card.name !== reference.name) {
      console.log('getReferencedCards', reference.name)
      result.push(getCard(reference.name))
    }
  })

  return result
}

// For a list of keyword tuples (Which expresses a keyword and its value)
// Get the hint text that should display
function getKeywordsText(keywordTuples: KeywordTuple[]) {
  let result = '\n'

  for (const keywordTuple of keywordTuples) {
    const keyword = getKeyword(`${keywordTuple.name}`)
    let txt = keyword.text

    if (keyword.hasX) {
      // NOTE This is replaceAll, but supported on all architectures
      txt = txt.split(/\bX\b/).join(`${keywordTuple.value}`)

      // NOTE Special case for occurences of +X, where X could be -N, so you want -N instead of +-N
      txt = txt.split(/\+\-/).join('-')
    }

    result += txt
  }

  return result
}
