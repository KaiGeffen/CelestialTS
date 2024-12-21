import Card from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'

class Dove extends Card {
  play(player, game, index, bonus) {
    // game.sound_effect = SoundEffect.Bird
    super.play(player, game, index, bonus)
  }
}

const dove = new Dove({
  name: 'Dove',
  cost: 1,
  points: 1,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 4,
  text: 'Visible, Fleeting.',
  story: 'Look at my eyes.\nSurrender\nTo the one thing you want',
  keywords: [
    { name: Keywords.visible, x: 0, y: 100 },
    { name: Keywords.fleeting, x: 0, y: 130 },
  ],
})

class Starling extends Card {
  play(player, game, index, bonus) {
    if (!game.story.isEmpty()) {
      if (game.story.acts[0].card.cost === 1) {
        bonus += 1
      }
    }
    super.play(player, game, index, bonus)
  }

  ratePlay(world) {
    let value = 2
    // TODO
    return value
  }
}

const starling = new Starling({
  name: 'Starling',
  cost: 2,
  points: 2,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 7,
  text: 'Visible, Fleeting, worth +1 point if the next card in the story costs 1.',
  story: 'Making headway\nDefying the headwind\nHeading out and through',
  keywords: [
    { name: Keywords.visible, x: 0, y: 52 },
    { name: Keywords.fleeting, x: 0, y: 82 },
  ],
})

class SecretaryBird extends Card {
  play(player, game, index, bonus) {
    let amt = 0
    for (let card of game.hand[player]) {
      if (card.cost <= 1) {
        amt += 1
      }
    }
    super.play(player, game, index, bonus + amt)
    this.oust(amt, game, player)
  }
}

const secretaryBird = new SecretaryBird({
  name: 'Secretary Bird',
  cost: 4,
  points: 4,
  qualities: [Quality.VISIBLE],
  id: 40,
  text: 'Visible, worth +1 point for each card in your hand that costs 1 or less. Remove those cards from the game.',
  story: 'I will I will I will\nBecome me become me become me\nAt your peril',
  keywords: [{ name: Keywords.visible, x: 0, y: 43 }],
})

class Phoenix extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    // for (let i = 0; i < game.pile[player].length; i++) {
    //   let card = game.pile[player][i]
    //   if (card.qualities.includes(Quality.FLEETING)) {
    //     const cardCopy = Object.create(
    //       Object.getPrototypeOf(card),
    //       Object.getOwnPropertyDescriptors(card),
    //     )
    //     cardCopy.points += 1
    //     cardCopy.basePoint = cardCopy.basePoints
    //     game.pile[player][i] = cardCopy
    //   }
    // }

    this.create(dove, game, player)
  }
}

const phoenix = new Phoenix({
  name: 'Phoenix',
  cost: 5,
  points: 5,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 51,
  text: 'Visible, Fleeting, create a Dove in your hand.',
  story:
    'Cracks in the shell\nShell falls away\nI stretch into wide possibilities',
  keywords: [
    { name: Keywords.visible, x: 0, y: 52 },
    { name: Keywords.fleeting, x: 0, y: 82 },
  ],
  references: [{ card: dove, x: 6, y: 112 }],
})

class Heron extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.reset(game)
  }

  getCost(player, game) {
    return this.cost + game.pile[player].length
  }

  ratePlay(world) {
    return this.rateReset(world)
  }
}

const heron = new Heron({
  name: 'Heron',
  cost: 1,
  points: 0,
  qualities: [Quality.VISIBLE],
  id: 65,
  text: "Visible, set both player's points to 0.\nCosts 1 more for each card in your discard pile.",
  story:
    'How you see me\nIs of no importance to me\nI am playing with being here, there, every where',
  keywords: [{ name: Keywords.visible, x: 0, y: 60 }],
})

export { dove, starling, secretaryBird, phoenix, heron }
