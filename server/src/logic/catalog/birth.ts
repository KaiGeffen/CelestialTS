import { Card } from '../../../../shared/state/card'
import { child } from './Tokens'
import { Status, Quality } from '../../../../shared/state/effects'
import { Source } from '../Story'
import { Animation } from '../../../../shared/state/animation'

class Nascence extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.build(1, game, player)
  }
}
const nascence = new Nascence('Nascence', 0, 2)

class Birth extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.build(2, game, player)
  }
}
const birth = new Birth('Birth', 2, 8)

class Ancestry extends Card {
  play(player, game, index, bonus) {
    const amt = game.story.getLength()
    super.play(player, game, index, bonus)
    if (amt >= 1) {
      this.build(amt, game, player)
    }
  }
}
const ancestry = new Ancestry('Ancestry', 3, 10)

class TheFuture extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.draw(1, game, player)
  }

  getCost(player, game) {
    let amt = 0
    for (const card of game.hand[player]) {
      if (card.name === child.name) {
        amt += card.points
      }
    }
    return Math.max(this.cost - amt, 0)
  }
}
const theFuture = new TheFuture('The Future', 8, 4, 22)

class Generator extends Card {
  morning(player, game, index) {
    super.build(1, game, player)
    return true
  }
}
const generator = new Generator('Generator', 4, 4, 53)

class Rebirth extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    let idx = 0
    for (const act of game.story.acts) {
      if (act.owner === player) {
        const amt = act.card.cost
        const card = new Card(
          child.name,
          amt,
          [Quality.FLEETING],
          `0:${amt}, Fleeting`,
          child.id
        )
        this.transform(idx, card, game)
      }
      idx += 1
    }
  }
}
const rebirth = new Rebirth('Rebirth', 1, 0, [Quality.FLEETING], 55)

class Cradle extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.build(2, game, player)
  }
}
const cradle = new Cradle('Cradle', 3, 2, 60)

class Uprising extends Card {
  play(player, game, index, bonus) {
    // game.soundEffect = SoundEffect.Crowd;
    super.play(player, game, index, bonus + index)
  }

  ratePlay(world) {
    return world.story.acts.length
  }
}
const uprising = new Uprising('Uprising', 6, 3, 18)

export {
  nascence,
  birth,
  ancestry,
  theFuture,
  generator,
  rebirth,
  cradle,
  uprising,
}
