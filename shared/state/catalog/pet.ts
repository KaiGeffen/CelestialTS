import Card from '../card'
import { SightCard } from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'
import { Animation } from '../../animation'
import { Zone } from '../zone'
import GameModel from '../gameModel'

class Fruit extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.nourish(3, game, player)
  }
}
const fruit = new Fruit({
  name: 'Fruit',
  id: 11,
  cost: 3,
  text: 'Nourish 3.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: 3 }],
})

class Oak extends Card {
  onRoundEnd(player, game) {
    const scoreAboveWinning = game.score[player] - game.score[player ^ 1]
    const amt = Math.max(0, scoreAboveWinning)
    game.status[player].push(...Array(amt).fill(Status.NOURISH))
  }
}
const oak = new Oak({
  name: 'Oak',
  id: 23,
  cost: 8,
  points: 8,
  text: 'If this is win this round, Nourish 1 for each point you won by.',
  keywords: [{ name: Keywords.nourish, x: -31, y: 112, value: 1 }],
})

class Bounty extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    ;[0, 1].forEach((p) => this.nourish(2, game, p))
  }
}
const bounty = new Bounty({
  name: 'Bounty',
  id: 48,
  cost: 3,
  points: 3,
  text: 'Both players Nourish 2.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: 2 }],
})

class Pet extends Card {
  constructor(points: number) {
    const text = `2:${points}. This card retains all changes to points as it resolves.`
    super({
      name: 'Pet',
      id: 34,
      cost: 2,
      points,
      basePoints: 1,
      qualities: [Quality.FLEETING],
      text,
    })
  }

  play(player, game, index, bonus) {
    let points = this.points + bonus
    points += game.status[player].filter(
      (status) => status === Status.NOURISH,
    ).length
    points -= game.status[player].filter(
      (status) => status === Status.STARVE,
    ).length

    const pet = new Pet(points)
    game.pile[player].push(pet)

    super.play(player, game, index, bonus)
    // game.soundEffect = SoundEffect.Meow;
  }
}
const pet = new Pet(1)

class Nectar extends SightCard {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.nourish(1, game, player)
  }
}
const nectar = new Nectar(3, {
  name: 'Nectar',
  id: 25,
  cost: 1,
  text: 'Nourish 1.\nWhen played, gain Sight 3.',
  keywords: [
    { name: Keywords.nourish, x: 0, y: 73, value: 1 },
    { name: Keywords.sight, x: 0, y: 130, value: 3 },
  ],
})

class Hollow extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    const amt = Math.max(0, game.score[player])
    game.score[player] = 0
    this.nourish(amt, game, player)
  }
}
const hollow = new Hollow({
  name: 'Hollow',
  id: 76,
  text: 'Set your points to 0. Gain Nourish 1 for each point you lost this way.',
  keywords: [{ name: Keywords.nourish, x: -31, y: 112, value: 1 }],
})

class HoldTight extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    if (game.pile[player].length > 0) {
      const card = game.pile[player].pop()
      game.deck[player].push(card)
      game.animations[player].push(
        new Animation({
          from: Zone.Discard,
          to: Zone.Deck,
          card: card,
        }),
      )
    }
  }
}
const holdTight = new HoldTight({
  name: 'Hold Tight',
  id: 33,
  cost: 2,
  points: 2,
})

// BETA TODO
class Yearn extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    if (super.exhale(2, game, player)) {
      // If the discard pile has at least one card
      if (game.pile[player].length > 0) {
        // And the top card costs 3 or less
        if (game.pile[player][game.pile[player].length - 1].cost <= 3) {
          const card = game.pile[player].pop()

          // Add the card as a new act
          game.story.addAct(card, player, 0)

          // Animate the movement
          game.animations[player].push(
            new Animation({
              from: Zone.Discard,
              to: Zone.Story,
              index2: 0,
            }),
          )
        }
      }
    }
  }
}
const yearn = new Yearn({
  name: 'Yearn',
  id: 233,
  cost: 1,
  points: 1,
  text: 'Extra 2: Add the top card of your discard pile to the story after this if it has base cost 3 or less.',
})

export { fruit, oak, bounty, pet, nectar, hollow, holdTight, yearn }
