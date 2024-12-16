import { Card, SightCard } from '../card'
import { Status, Quality } from '../effects'

class Fruit extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.nourish(3, game, player)
  }
}
const fruit = new Fruit({ name: 'Fruit', cost: 3, points: 11, id: 1 })

class Oak extends Card {
  onRoundEnd(player, game) {
    const scoreAboveWinning = game.score[player] - game.score[player ^ 1]
    const amt = Math.max(0, scoreAboveWinning)
    game.status[player].push(...Array(amt).fill(Status.NOURISH))
  }
}
const oak = new Oak({ name: 'Oak', cost: 8, points: 8, id: 23 })

class Bounty extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    ;[0, 1].forEach((p) => this.nourish(2, game, p))
  }
}
const bounty = new Bounty({ name: 'Bounty', cost: 3, points: 3, id: 48 })

class Pet extends Card {
  constructor(points) {
    const text = `2:${points}, this card retains all changes to points as it resolves (For example, if this card was nourished by 3, it stays a 2:4 once it is in the discard pile)`
    super({
      name: 'Pet',
      cost: 2,
      points,
      qualities: [Quality.FLEETING],
      text,
      id: 34,
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
const nectar = new Nectar(3, { name: 'Nectar', cost: 1, id: 25 })

class Hollow extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    const amt = Math.max(0, game.score[player])
    game.score[player] = 0
    this.nourish(amt, game, player)
  }
}
const hollow = new Hollow({ name: 'Hollow', cost: 0, points: 0, id: 76 })

class HoldTight extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    if (game.pile[player].length > 0) {
      const card = game.pile[player].pop()
      game.deck[player].push(card)
      // game.animations[player].push(
      //   new Animation('Discard', 'Deck', CardCodec.encodeCard(card)),
      // )
    }
  }
}
const holdTight = new HoldTight({
  name: 'Hold Tight',
  cost: 2,
  points: 2,
  id: 33,
})

export { fruit, oak, bounty, pet, nectar, hollow, holdTight }
