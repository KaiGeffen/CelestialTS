import { Card, CardCodec } from '../../../../shared/state/card'
import { Status, Quality } from '../../../../shared/state/effects'
import { Source } from '../Story'
import { Animation } from '../../../../shared/state/animation'

class Dagger extends Card {
  play(player, game, index, bonus) {
    const opp = (player + 1) % 2
    super.play(player, game, index, bonus)
    this.discard(1, game, opp)

    // game.sound_effect = SoundEffect.Cut
  }

  rate_play(world) {
    return this.rate_discard(world)
  }
}
const dagger = new Dagger({ name: 'Dagger', cost: 1, id: 1 })

class Shadow extends Card {
  get_cost(player, game) {
    const opp = (player + 1) % 2
    return game.hand[opp].length
  }

  rate_delay(world) {
    return 10
  }
}
const shadow = new Shadow({ name: 'Shadow', cost: 6, points: 3, id: 19 })

class Imprison extends Card {
  on_round_end(player, game) {
    // If opponent had 3 or fewer points
    if (game.score[player ^ 1] <= 3) {
      // Give them Nourish -1
      game.status[player ^ 1].push(Status.STARVE)
    }
  }
}
const imprison = new Imprison({ name: 'Imprison', cost: 3, points: 3, id: 35 })

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
      return this.points + this.rate_discard(world)
    } else {
      return this.points
    }
  }
}
const boa = new Boa({ name: 'Boa', cost: 6, points: 6, id: 57 })

class HungryGhost extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player)
  }

  rate_delay(world) {
    return 12
  }
}
const hungry_ghost = new HungryGhost({
  name: 'Hungry Ghost',
  cost: 2,
  points: 4,
  id: 31,
})

class Hurricane extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.reset(game)
  }

  rate_play(world) {
    return this.rate_reset(world)
  }
}
const hurricane = new Hurricane({ name: 'Hurricane', cost: 4, id: 13 })

class WingClipping extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    if (game.hand[player ^ 1].length > 0) {
      const card = game.hand[player ^ 1].shift()
      game.deck[player ^ 1].push(card)

      game.animations[player ^ 1].push(
        new Animation('Hand', 'Deck', { card: CardCodec.encode_card(card) })
      )
    }
  }

  rate_play(world) {
    return this.points + this.rate_discard(world)
  }
}
const wing_clipping = new WingClipping({
  name: 'Wing Clipping',
  cost: 5,
  points: 3,
  id: 16,
})

class Sickness extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.starve(4, game, player ^ 1)
    this.create(sickness, game, player ^ 1)
  }
}
const sickness = new Sickness({
  name: 'Sickness',
  cost: 3,
  points: -1,
  qualities: [Quality.FLEETING],
  id: 58,
})
