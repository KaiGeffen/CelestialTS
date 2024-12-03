import { Card, SightCard, CardCodec } from '../Card'
import { Status, Quality } from '../Effects'
import { Source } from '../Story'
import { Animation } from '../../Animation'

class Fruit extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.nourish(3, game, player)
  }
}
const fruit = new Fruit('Fruit', 3, 11)

class Oak extends Card {
  onRoundEnd(player, game) {
    const scoreAboveWinning = game.score[player] - game.score[player ^ 1]
    const amt = Math.max(0, scoreAboveWinning)
    game.status[player].push(...Array(amt).fill(Status.NOURISH))
  }
}
const oak = new Oak('Oak', 8, 8, 23)

class Bounty extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    ;[0, 1].forEach((p) => this.nourish(2, game, p))
  }
}
const bounty = new Bounty('Bounty', 3, 3, 48)

class Pet extends Card {
  constructor(points) {
    const text = `2:${points}, this card retains all changes to points as it resolves (For example, if this card was nourished by 3, it stays a 2:4 once it is in the discard pile)`
    super('Pet', 2, points, [Quality.FLEETING], text, text, 34)
  }

  play(player, game, index, bonus) {
    let points = this.points + bonus
    points += game.status[player].filter(
      (status) => status === Status.NOURISH
    ).length
    points -= game.status[player].filter(
      (status) => status === Status.STARVE
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
const nectar = new Nectar('Nectar', 3, 1, 25)

class Hollow extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    const amt = Math.max(0, game.score[player])
    game.score[player] = 0
    this.nourish(amt, game, player)
  }
}
const hollow = new Hollow('Hollow', 0, 0, 76)

class HoldTight extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    if (game.pile[player].length > 0) {
      const card = game.pile[player].pop()
      game.deck[player].push(card)
      game.animations[player].push(
        new Animation('Discard', 'Deck', CardCodec.encodeCard(card))
      )
    }
  }
}
const holdTight = new HoldTight('Hold Tight', 2, 2, 33)
