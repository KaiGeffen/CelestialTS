import Card from '../card'
import { Status, Quality } from '../effects'
import GameModel from '../gameModel'
import { Keywords } from '../keyword'

class Dove extends Card {
  play(player, game, index, bonus) {
    // game.sound_effect = SoundEffect.Bird
    super.play(player, game, index, bonus)
  }
}

const dove = new Dove({
  name: 'Dove',
  id: 4,
  cost: 1,
  points: 1,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
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
  id: 7,
  cost: 2,
  points: 2,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
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
  id: 40,
  cost: 4,
  points: 4,
  qualities: [Quality.VISIBLE],
  text: 'Visible, worth +1 point for each card in your hand that costs 1 or less. Remove those cards from the game.',
  story: 'I will I will I will\nBecome me become me become me\nAt your peril',
  keywords: [{ name: Keywords.visible, x: 0, y: 43 }],
})

class Phoenix extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    // const deck = game.deck[player]
    // const discardPile = game.pile[player]
    // ;[deck, discardPile].forEach((zone) => {
    //   // For each index in the zone
    //   for (let i = 0; i < zone.length; i++) {
    //     let card = zone[i]
    //     if (card.qualities.includes(Quality.FLEETING)) {
    //       // Create a new copy of the card, but with 1 more point
    //       const cardCopy = Object.create(
    //         Object.getPrototypeOf(card),
    //         Object.getOwnPropertyDescriptors(card),
    //       )
    //       cardCopy.points += 1
    //       cardCopy.basePoint = cardCopy.basePoints

    //       // Replace the original card with the new copy
    //       zone[i] = cardCopy
    //     }
    //   }
    // })

    game.create(dove, player)
  }
}

const phoenix = new Phoenix({
  name: 'Phoenix',
  id: 51,
  cost: 5,
  points: 5,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
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
  id: 65,
  cost: 1,
  points: 0,
  qualities: [Quality.VISIBLE],
  text: "Visible, set both player's points to 0.\nCosts 1 more for each card in your discard pile.",
  story:
    'How you see me\nIs of no importance to me\nI am playing with being here, there, every where',
  keywords: [{ name: Keywords.visible, x: 0, y: 60 }],
})

// BETA CONTENT TODO
class Nest extends Card {
  onMorning(player: number, game: GameModel, index: number) {
    game.createInStory(player, dove)
    return true
  }
}

const nest = new Nest({
  name: 'Nest',
  id: 207,
  cost: 1,
  points: 0,
  text: 'Morning: Create a Dove in the story.',
})

export { dove, starling, secretaryBird, phoenix, heron, nest }
