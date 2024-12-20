import Card from './card'

import { dove, starling, secretaryBird, phoenix, heron } from './catalog/birds'
import {
  dash,
  impulse,
  mine,
  arsonist,
  parch,
  veteran,
  cling,
  death,
  fromAshes,
} from './catalog/ashes'
import {
  fruit,
  oak,
  bounty,
  pet,
  nectar,
  hollow,
  holdTight,
} from './catalog/pet'
import {
  dagger,
  shadow,
  imprison,
  nightmare,
  boa,
  hungryGhost,
  hurricane,
  wingClipping,
  sickness,
} from './catalog/shadow'
import {
  nascence,
  birth,
  ancestry,
  theFuture,
  generator,
  rebirth,
  cradle,
  uprising,
} from './catalog/birth'
import {
  dawn,
  clearView,
  awakening,
  enlightenment,
  prey,
  conquer,
} from './catalog/vision'
import {
  stars,
  cosmos,
  nightVision,
  ecology,
  sun,
  moon,
  sunflower,
} from './catalog/stars'
import {
  mercy,
  excess,
  fishingBoat,
  drown,
  iceberg,
  dew,
  gentleRain,
} from './catalog/water'
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
  stars,
  dagger,
  nascence,
  impulse,
  dove,
  drown,
  dash,
  starling,
  birth,
  cosmos,
  ancestry,
  fruit,
  mercy,
  hurricane,
  arsonist,
  mine,
  wingClipping,
  veteran,
  uprising,
  shadow,
  cling,
  death,
  theFuture,
  oak,
  nectar,
  prey,
  clearView,
  nightVision,
  hungryGhost,
  fishingBoat,
  holdTight,
  pet,
  imprison,
  awakening,
  secretaryBird,
  ecology,
  enlightenment,
  excess,
  bounty,
  dawn,
  phoenix,
  generator,
  iceberg,
  rebirth,
  sun,
  boa,
  sickness,
  cradle,
  paramountcy,
  dew,
  parch,
  heron,
  conquer,
  nightmare,
  fromAshes,
  gentleRain,
  sunflower,
  hollow,
  moon,
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
