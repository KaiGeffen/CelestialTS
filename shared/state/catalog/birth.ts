import Card from '../card'
import { child } from './tokens'
import { Status, Quality } from '../effects'

class Nascence extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.birth(1, game, player)
  }
}
const nascence = new Nascence({ name: 'Nascence', id: 2 })

class Birth extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.birth(2, game, player)
  }
}
const birth = new Birth({ name: 'Birth', cost: 2, id: 8 })

class Ancestry extends Card {
  play(player, game, index, bonus) {
    const amt = game.story.getLength()
    super.play(player, game, index, bonus)
    if (amt >= 1) {
      this.birth(amt, game, player)
    }
  }
}
const ancestry = new Ancestry({ name: 'Ancestry', cost: 3, id: 10 })

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
const theFuture = new TheFuture({
  name: 'The Future',
  cost: 8,
  points: 4,
  id: 22,
})

class Generator extends Card {
  morning(player, game, index) {
    super.birth(1, game, player)
    return true
  }
}
const generator = new Generator({
  name: 'Generator',
  cost: 4,
  points: 4,
  id: 53,
})

class Rebirth extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)

    let idx = 0
    for (const act of game.story.acts) {
      if (act.owner === player) {
        const amt = act.card.cost
        const card = new Card({
          name: child.name,
          id: child.id,
          points: amt,
          text: `0:${amt}, Fleeting`,
          qualities: [Quality.FLEETING],
        })
        this.transform(idx, card, game)
      }
      idx += 1
    }
  }
}
const rebirth = new Rebirth({
  name: 'Rebirth',
  cost: 1,
  id: 55,
  qualities: [Quality.FLEETING],
})

class Cradle extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.birth(2, game, player)
  }
}
const cradle = new Cradle({ name: 'Cradle', cost: 3, points: 2, id: 60 })

class Uprising extends Card {
  play(player, game, index, bonus) {
    // game.soundEffect = SoundEffect.Crowd;
    super.play(player, game, index, bonus + index)
  }

  ratePlay(world) {
    return world.story.acts.length
  }
}
const uprising = new Uprising({ name: 'Uprising', cost: 6, points: 3, id: 18 })

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
