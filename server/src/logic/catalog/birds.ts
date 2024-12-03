import { Card } from '../logic/Card'
import { Status, Quality } from '../logic/Effects'
import { Source } from '../logic/Story'
import { Animation } from '../Animation'

class Dove extends Card {
  play(player, game, index, bonus) {
    // game.sound_effect = SoundEffect.Bird
    super.play(player, game, index, bonus)
  }
}

const dove = new Dove('Dove', 1, 1, [Quality.VISIBLE, Quality.FLEETING], 4)

class Swift extends Card {
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

const swift = new Swift('Swift', 2, 2, [Quality.VISIBLE, Quality.FLEETING], 7)

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

const secretaryBird = new SecretaryBird(
  'Secretary Bird',
  4,
  4,
  [Quality.VISIBLE],
  40
)

class Phoenix extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.create(dove, game, player)
  }
}

const phoenix = new Phoenix(
  'Phoenix',
  5,
  5,
  [Quality.VISIBLE, Quality.FLEETING],
  51
)

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

const heron = new Heron('Heron', 1, 0, [Quality.VISIBLE], 65)

export { Dove, Swift, SecretaryBird, Phoenix, Heron }
