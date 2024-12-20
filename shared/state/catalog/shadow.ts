import Card from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'
import { Animation } from '../../animation'
import { Zone } from '../zone'

class Dagger extends Card {
  play(player, game, index, bonus) {
    const opp = (player + 1) % 2
    super.play(player, game, index, bonus)
    this.discard(1, game, opp)

    // game.sound_effect = SoundEffect.Cut
  }

  rate_play(world) {
    return this.rateDiscard(world)
  }
}
const dagger = new Dagger({
  name: 'Dagger',
  cost: 1,
  id: 1,
  text: 'Your opponent discards the leftmost card of their hand.',
  story:
    'I have a point now\nI am no longer alone, scattered \nBut trained wholly on the promise\nOf your body, squirming',
})

class Shadow extends Card {
  get_cost(player, game) {
    const opp = (player + 1) % 2
    return game.hand[opp].length
  }

  rateDelay(world) {
    return 10
  }
}
const shadow = new Shadow({
  name: 'Shadow',
  cost: 6,
  points: 3,
  id: 19,
  text: "Costs X, where X is the number of cards in your opponent's hand.",
  story:
    'Your pain blooms like flowers on a misty day.\nI breathe it in.\nPerhaps I can rest now.',
})

class Imprison extends Card {
  on_round_end(player, game) {
    // If opponent had 3 or fewer points
    if (game.score[player ^ 1] <= 3) {
      // Give them Nourish -1
      game.status[player ^ 1].push(Status.STARVE)
    }
  }
}
const imprison = new Imprison({
  name: 'Imprison',
  cost: 3,
  points: 3,
  id: 35,
  text: 'At the end of this round, if your opponent has 3 or fewer points, give them Nourish -1.',
  story:
    'All tied up\ncan’t even stand\nAm I lethal to you and yours\nMy tight bonds calm me.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: -1 }],
})

class Nightmare extends Card {
  morning(player, game, index) {
    if (game.hand[player ^ 1].length < game.hand[player].length) {
      super.create(shadow, game, player)
      return true
    }
    return false
  }
}
const nightmare = new Nightmare({
  name: 'Nightmare',
  cost: 2,
  points: 2,
  id: 68,
  text: 'Morning: if you have more cards in hand than your opponent, create a Shadow in hand.',
  story:
    'I struggle to find myself\nBetween the claws and biting words\nShearing my mind away',
  keywords: [{ name: Keywords.morning, x: 0, y: 60 }],
  references: [{ card: shadow, x: 0, y: 134 }],
})

class Boa extends Card {
  play(player, game, index, bonus) {
    const nourished =
      game.status[player].includes(Status.NOURISH) ||
      game.status[player].includes(Status.STARVE)
    super.play(player, game, index, bonus)
    if (nourished) {
      super.discard(1, game, player ^ 1)
    }
  }

  rate_play(world) {
    const nourished =
      world.status.includes(Status.NOURISH) ||
      world.status.includes(Status.STARVE)
    if (nourished) {
      return this.points + this.rateDiscard(world)
    } else {
      return this.points
    }
  }
}
const boa = new Boa({
  name: 'Boa',
  cost: 6,
  points: 6,
  id: 57,
  text: 'If this is nourished, your opponent discards the leftmost card of their hand.',
  story: 'I reach I win I have it.\nIt is all mine now!\nCan I make it me?',
})

class HungryGhost extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player)
  }

  rateDelay(world) {
    return 12
  }
}
const hungryGhost = new HungryGhost({
  name: 'Hungry Ghost',
  cost: 2,
  points: 4,
  id: 31,
  text: 'Nourish -4.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: -4 }],
})

class Hurricane extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.reset(game)
  }

  rate_play(world) {
    return this.rateReset(world)
  }
}
const hurricane = new Hurricane({
  name: 'Hurricane',
  cost: 4,
  id: 13,
  text: "Set both player's points to 0.",
})

class WingClipping extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    if (game.hand[player ^ 1].length > 0) {
      const card = game.hand[player ^ 1].shift()
      game.deck[player ^ 1].push(card)

      game.animations[player ^ 1].push(
        new Animation({
          from: Zone.Hand,
          to: Zone.Deck,
          card: card,
        }),
      )
    }
  }

  rate_play(world) {
    return this.points + this.rateDiscard(world)
  }
}
const wingClipping = new WingClipping({
  name: 'Wing Clipping',
  cost: 5,
  points: 3,
  id: 16,
  text: 'Your opponent puts the leftmost card of their hand on top of their deck.',
  story:
    'We walked and ran and played then\nYou leave me behind\nI gasp as the space between us grows',
})

class Sickness extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player ^ 1)
    this.create(sickness, game, player ^ 1)
  }
}
let sickness = null
sickness = new Sickness({
  name: 'Sickness',
  cost: 3,
  points: -1,
  qualities: [Quality.FLEETING],
  id: 58,
  text: 'Fleeting, give your opponent Nourish -4, create a Sickness in their hand.',
  keywords: [
    { name: Keywords.fleeting, x: 0, y: 61 },
    { name: Keywords.nourish, x: -35, y: 111, value: -4 },
  ],
  references: [{ card: sickness, x: -48, y: 132 }],
})

export {
  dagger,
  shadow,
  imprison,
  nightmare,
  boa,
  hungryGhost,
  hurricane,
  wingClipping,
  sickness,
}
