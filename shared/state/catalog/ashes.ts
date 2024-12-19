import Card from '../card'
import { ashes } from './tokens'
import { Status, Quality } from '../effects'
import { Animation } from '../../animation'
import { Zone } from '../zone'

class Dash extends Card {
  play(player: number, game: any, index: number, bonus: number): void {
    bonus -= index
    super.play(player, game, index, bonus)
  }

  ratePlay(world: any): number {
    return this.points - world.story.acts.length
  }
}
const dash = new Dash({ name: 'Dash', cost: 2, points: 3, id: 6 })

class Impulse extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 2; i++) {
      this.createInPile(ashes, game, player)
    }
  }
}
const impulse = new Impulse({
  name: 'Impulse',
  cost: 1,
  points: 1,
  qualities: [Quality.FLEETING],
  id: 3,
})

class Mine extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    this.dig(4, game, player)
  }
}
const mine = new Mine({ name: 'Mine', cost: 4, points: 4, id: 15 })

class Arsonist extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 3; i++) {
      this.createInPile(ashes, game, player)
    }
  }
}
const arsonist = new Arsonist({
  name: 'Arsonist',
  cost: 4,
  points: 4,
  qualities: [Quality.FLEETING],
  id: 14,
})

class Parch extends Card {
  play(player, game, index, bonus) {
    for (const act of game.story.acts) {
      if (act.owner === player) {
        bonus += 1
      }
    }

    super.play(player, game, index, bonus)

    let i = 0
    while (i < game.story.acts.length) {
      const act = game.story.acts[i]
      if (act.owner === player) {
        this.removeAct(i, game)
      } else {
        i++
      }
    }
  }

  onPlay(player, game) {
    game.status[player].push(Status.UNLOCKED)
  }
}
const parch = new Parch({ name: 'Parch', cost: 3, points: 2, id: 64 })

class Veteran extends Card {
  play(player, game, index, bonus) {
    if (game.pile[player].length >= 8) {
      bonus += 2
    }

    super.play(player, game, index, bonus)
  }

  ratePlay(world) {
    const pileHas8 = world.pile[0].length >= 8
    return 4 + (pileHas8 ? 2 : 0)
  }
}
const veteran = new Veteran({ name: 'Veteran', cost: 5, points: 4, id: 17 })

class Cling extends Card {
  play(player, game, index, bonus) {
    let highestCost = -1
    let highestIndex = null

    for (let pileIndex = 0; pileIndex < game.pile[player].length; pileIndex++) {
      const card = game.pile[player][pileIndex]

      if (card.cost > highestCost) {
        highestCost = card.cost
        highestIndex = pileIndex
      }
    }

    if (highestIndex !== null) {
      const card = game.pile[player].splice(highestIndex, 1)[0]
      game.deck[player].push(card)

      bonus += highestCost

      game.animations[player].push(
        new Animation({
          from: Zone.Discard,
          to: Zone.Deck,
          card: card,
        }),
      )

      super.play(player, game, index, bonus)
    } else {
      super.play(player, game, index, bonus)
    }
  }

  ratePlay(world) {
    let highestCost = 0
    for (const card of world.pile[0]) {
      highestCost = Math.max(highestCost, card.cost)
    }

    for (const act of world.story.acts) {
      if (act.owner === 0) {
        highestCost = Math.max(highestCost, act.card.cost)
      }
    }

    if (highestCost <= 3) {
      return highestCost - 1
    } else if (highestCost <= 5) {
      return highestCost
    } else {
      return highestCost + 1
    }
  }
}
const cling = new Cling({ name: 'Cling', cost: 6, id: 20 })

class Death extends Card {
  getCost(player, game) {
    return game.pile[player].length >= 12 ? 0 : this.cost
  }
}
const death = new Death({ name: 'Death', cost: 7, points: 7, id: 21 })

class FromAshes extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    const amt = game.pile[player]
      .slice(-3)
      .filter((card) => card.qualities.includes(Quality.FLEETING)).length

    this.dig(3, game, player)
    this.nourish(amt, game, player)
  }
}
const fromAshes = new FromAshes({
  name: 'From Ashes',
  cost: 2,
  points: 1,
  id: 74,
})

export {
  dash,
  impulse,
  mine,
  arsonist,
  parch,
  veteran,
  cling,
  death,
  fromAshes,
}
