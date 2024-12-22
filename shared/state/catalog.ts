import Card from './card'

import * as birdsCatalog from './catalog/birds'
import * as ashesCatalog from './catalog/ashes'
import * as petCatalog from './catalog/pet'
import * as shadowCatalog from './catalog/shadow'
import * as birthCatalog from './catalog/birth'
import * as visionCatalog from './catalog/vision'
import * as starsCatalog from './catalog/stars'
import * as waterCatalog from './catalog/water'
import { child, seen, ashes, predator } from './catalog/tokens'
import { Animation } from '../animation'
import { Zone } from './zone'

class Paramountcy extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    const space = 99 - (index + 1 + game.story.acts.length)
    for (let i = 0; i < Math.min(space, 5); i++) {
      if (game.pile[player].length > 0) {
        const card = game.pile[player].pop()
        game.story.addAct(card, player, i)
        game.animations[player].push(
          new Animation({
            from: Zone.Discard,
            to: Zone.Story,
            index2: i,
          }),
        )
      }
    }
  }
}
const paramountcy = new Paramountcy({
  name: 'Paramountcy',
  cost: 9,
  points: 0,
  id: 62,
})

const fullCatalog = [
  ...Object.values(waterCatalog),
  ...Object.values(birdsCatalog),
  ...Object.values(ashesCatalog),
  ...Object.values(petCatalog),
  ...Object.values(shadowCatalog),
  ...Object.values(birthCatalog),
  ...Object.values(visionCatalog),
  ...Object.values(starsCatalog),
  paramountcy,
]
const nonCollectibles = [seen, ashes, child, predator]
const allCards = [...fullCatalog, ...nonCollectibles]

function getComputerDeck(i = null) {
  const possibleDecks = [
    [
      impulse,
      impulse,
      impulse,
      drown,
      drown,
      starling,
      starling,
      dash,
      mercy,
      fruit,
      arsonist,
      arsonist,
      veteran,
      veteran,
      death,
    ],
    [
      stars,
      stars,
      impulse,
      impulse,
      drown,
      drown,
      drown,
      arsonist,
      arsonist,
      arsonist,
      arsonist,
      veteran,
      cling,
      death,
      death,
    ],
    [
      stars,
      impulse,
      impulse,
      impulse,
      impulse,
      impulse,
      dash,
      dash,
      starling,
      starling,
      mercy,
      mercy,
      mine,
      mine,
      death,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      dove,
      dove,
      cosmos,
      starling,
      mercy,
      mercy,
      fruit,
      fruit,
      arsonist,
      death,
      oak,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      drown,
      drown,
      cosmos,
      birth,
      mercy,
      fruit,
      shadow,
      uprising,
      cling,
      cling,
      oak,
    ],
    [
      nascence,
      nascence,
      dove,
      dove,
      impulse,
      birth,
      birth,
      birth,
      starling,
      dash,
      mercy,
      mercy,
      mercy,
      uprising,
      uprising,
    ],
    [
      nascence,
      nascence,
      nascence,
      dove,
      dove,
      dove,
      impulse,
      cosmos,
      starling,
      dash,
      ancestry,
      mercy,
      mercy,
      uprising,
      shadow,
    ],
    [
      stars,
      dove,
      impulse,
      impulse,
      impulse,
      impulse,
      birth,
      starling,
      starling,
      dash,
      dash,
      mercy,
      mercy,
      mercy,
      mine,
    ],
    [
      stars,
      stars,
      dove,
      dove,
      dove,
      starling,
      starling,
      fruit,
      fruit,
      wingClipping,
      wingClipping,
      wingClipping,
      shadow,
      shadow,
      cling,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      dove,
      dove,
      cosmos,
      fruit,
      fruit,
      wingClipping,
      wingClipping,
      wingClipping,
      shadow,
      shadow,
      cling,
      oak,
    ],
    [
      dove,
      dove,
      dove,
      dove,
      dove,
      dove,
      dash,
      dash,
      mercy,
      mercy,
      mercy,
      arsonist,
      arsonist,
      oak,
      oak,
    ],
  ]

  if (i !== null) {
    if (i >= 0 && i < possibleDecks.length) {
      return possibleDecks[i]
    } else {
      console.error('Invalid AI deck index:', i)
    }
  } else {
    // Return a random deck
    return possibleDecks[Math.floor(Math.random() * possibleDecks.length)]
  }
}

export default class Catalog {
  static allCards = allCards
  static collectibleCards = fullCatalog
  static cardback = new Card({ name: 'Cardback', id: 1000 })

  static getCard(s: string): Card {
    return allCards.find((c) => c.name === s)
  }
  static getCardById(id: number): Card {
    return allCards.find((c) => c.id === id)
  }
}
