import Card from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'
import { Animation } from '../../animation'
import { Zone } from '../zone'
import GameModel from '../gameModel'

class Dagger extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    const opp = (player + 1) % 2
    super.play(player, game, index, bonus)
    game.discard(player)
  }

  ratePlay(world: GameModel): number {
    return this.rateDiscard(world)
  }
}
const dagger = new Dagger({
  name: 'Dagger',
  id: 1,
  cost: 1,
  text: 'Your opponent discards the leftmost card of their hand.',
  story:
    'I have a point now\nI am no longer alone, scattered \nBut trained wholly on the promise\nOf your body, squirming',
})

class Shadow extends Card {
  getCost(player: number, game: GameModel): number {
    const opp = (player + 1) % 2
    return game.hand[opp].length
  }

  rateDelay(world) {
    return 10
  }
}
const shadow = new Shadow({
  name: 'Shadow',
  id: 19,
  cost: 6,
  points: 3,
  text: "Costs X, where X is the number of cards in your opponent's hand.",
  story:
    'Your pain blooms like flowers on a misty day.\nI breathe it in.\nPerhaps I can rest now.',
})

class Imprison extends Card {
  onRoundEndIfThisResolved(player: number, game: GameModel) {
    // If opponent had 3 or fewer points
    if (game.score[player ^ 1] <= 3) {
      // Give them Nourish -1
      game.status[player ^ 1].push(Status.STARVE)
    }
  }
}
const imprison = new Imprison({
  name: 'Imprison',
  id: 35,
  cost: 3,
  points: 3,
  text: 'At the end of this round, if your opponent has 3 or fewer points, give them Nourish -1.',
  story:
    'All tied up\ncan’t even stand\nAm I lethal to you and yours\nMy tight bonds calm me.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: -1 }],
})

class Nightmare extends Card {
  onMorning(player: number, game: GameModel, index: number) {
    if (game.hand[player ^ 1].length < game.hand[player].length) {
      game.create(player, shadow)
      return true
    }
    return false
  }
}
const nightmare = new Nightmare({
  name: 'Nightmare',
  id: 68,
  cost: 2,
  points: 2,
  text: 'Morning: if you have more cards in hand than your opponent, create a Shadow in hand.',
  story:
    'I struggle to find myself\nBetween the claws and biting words\nShearing my mind away',
  keywords: [{ name: Keywords.morning, x: 0, y: 60 }],
  references: [{ card: shadow, x: 0, y: 134 }],
})

class Boa extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    const nourished =
      game.status[player].includes(Status.NOURISH) ||
      game.status[player].includes(Status.STARVE)
    super.play(player, game, index, bonus)
    if (nourished) {
      game.discard(player ^ 1)
    }
  }
}
const boa = new Boa({
  name: 'Boa',
  id: 57,
  cost: 6,
  points: 6,
  text: 'If this is nourished, your opponent discards the leftmost card of their hand.',
  story: 'I reach I win I have it.\nIt is all mine now!\nCan I make it me?',
})

class HungryGhost extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player)
  }

  rateDelay(world) {
    return 12
  }
}
const hungryGhost = new HungryGhost({
  name: 'Hungry Ghost',
  id: 31,
  cost: 2,
  points: 4,
  text: 'Nourish -4.',
  keywords: [{ name: Keywords.nourish, x: 0, y: 130, value: -4 }],
})

class Hurricane extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.reset(game)
  }

  ratePlay(world: GameModel): number {
    return this.rateReset(world)
  }
}
const hurricane = new Hurricane({
  name: 'Hurricane',
  id: 13,
  cost: 4,
  text: "Set both player's points to 0.",
})

class WingClipping extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
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

  ratePlay(world: GameModel): number {
    return this.points + this.rateDiscard(world)
  }
}
const wingClipping = new WingClipping({
  name: 'Wing Clipping',
  id: 16,
  cost: 5,
  points: 3,
  text: 'Your opponent puts the leftmost card of their hand on top of their deck.',
  story:
    'We walked and ran and played then\nYou leave me behind\nI gasp as the space between us grows',
})

class Sickness extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player ^ 1)
    game.create(player ^ 1, sickness)
  }
}
const sickness = new Sickness({
  name: 'Sickness',
  id: 58,
  cost: 3,
  points: -1,
  qualities: [Quality.FLEETING],
  text: 'Fleeting, give your opponent Nourish -4, create a Sickness in their hand.',
  keywords: [
    { name: Keywords.fleeting, x: 0, y: 61 },
    { name: Keywords.nourish, x: -35, y: 111, value: -4 },
  ],
  // references: [{ card: sickness, x: -48, y: 132 }],
})

// BETA
class Victim extends Card {
  onRoundEndIfThisResolved(player: number, game: GameModel) {
    const scoreAboveWinning = game.score[player ^ 1] - game.score[player]
    const amt = Math.max(0, scoreAboveWinning)
    game.status[player ^ 1].push(...Array(amt).fill(Status.STARVE))
  }
}
const victim = new Victim({
  name: 'Victim',
  id: 4001,
  text: 'If you lose this round, Nourish -1 your opponent for each point you lost by.',
  keywords: [{ name: Keywords.nourish, x: -31, y: 112, value: 1 }],
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
  victim,
}
