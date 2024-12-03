import { Card, FireCard } from '../Card'
import { ashes } from '../catalog/Tokens'
import { Status, Quality } from '../Effects'
import { Animation } from '../../Animation'

const dash = new FireCard('Dash', 2, 3, 6)

class Impulse extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 2; i++) {
      this.createInPile(ashes, game, player)
    }
  }
}
const impulse = new Impulse('Impulse', 1, 1, [Quality.FLEETING], 3)

class Mine extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    this.dig(4, game, player)
  }
}
const mine = new Mine('Mine', 4, 4, 15)

class Arsonist extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 3; i++) {
      this.createInPile(ashes, game, player)
    }
  }
}
const arsonist = new Arsonist('Arsonist', 4, 4, [Quality.FLEETING], 14)

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
const parch = new Parch('Parch', 3, 2, 64)

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
const veteran = new Veteran('Veteran', 5, 4, 17)

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
        new Animation('Discard', 'Deck', { card: card.encode() })
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
const cling = new Cling('Cling', 6, 20)

class Death extends Card {
  getCost(player, game) {
    return game.pile[player].length >= 12 ? 0 : this.cost
  }
}
const death = new Death('Death', 7, 7, 21)

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
const fromAshes = new FromAshes('From Ashes', 2, 1, 74)
