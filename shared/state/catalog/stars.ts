import Card from '../card'
import { SightCard } from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'
import { Animation } from '../../animation'
import { Zone } from '../zone'
import GameModel from '../gameModel'

class Stars extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.inspire(1, game, player)
  }
}
const stars = new Stars({
  name: 'Stars',
  id: 0,
  text: 'Inspire 1.',
  keywords: [{ name: Keywords.inspire, x: 0, y: 131, value: 1 }],
})

class Cosmos extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    let amt = 1
    for (const act of game.story.acts) {
      if (act.owner === player) {
        amt += 1
      }
    }
    super.play(player, game, index, bonus)
    this.inspire(amt, game, player)
  }
}
const cosmos = new Cosmos({
  name: 'Cosmos',
  id: 9,
  cost: 2,
  text: 'Inspire 1 for this and each of your cards later in the story.',
  keywords: [{ name: Keywords.inspire, x: -28, y: 90, value: 1 }],
})

class NightVision extends SightCard {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    game.tutor(player, 2)
  }
}
const nightVision = new NightVision(3, {
  name: 'Night Vision',
  id: 28,
  cost: 1,
  text: 'Draw a card that costs 2.\nWhen played, gain Sight 3.',
  keywords: [{ name: Keywords.sight, x: 0, y: 130, value: 3 }],
})

class Ecology extends Card {
  onPlay(player: number, game: GameModel) {
    game.breath[player] += 10
  }
}
const ecology = new Ecology({
  name: 'Ecology',
  id: 44,
  cost: 7,
  text: 'When played, gain 10 breath this round.',
})

class Sun extends Card {
  onMorning(player: number, game: GameModel, index: number) {
    super.addBreath(2, game, player)
    return true
  }
}
const sun = new Sun({
  name: 'Sun',
  id: 56,
  cost: 8,
  points: 8,
  text: 'Morning: gain 2 extra breath this round.',
  story: 'I raise my head over the horizon\nI begin\nJust like you',
  keywords: [{ name: Keywords.morning, x: 0, y: 82 }],
})

class Moon extends Card {
  onMorning(player: number, game: GameModel, index: number) {
    let count = 0
    for (let i = index - 1; i >= 0; i--) {
      if (count >= 2) break

      const card = game.pile[player][i]
      if (card.onMorning(player, game, i)) {
        game.animations[player].push(
          new Animation({
            from: Zone.Discard,
            to: Zone.Discard,
            card: card,
            index: i,
            index2: i,
          }),
        )
        count += 1
      }
    }
    return true
  }
}
const moon = new Moon({
  name: 'Moon',
  id: 73,
  cost: 5,
  points: 4,
  text: 'Morning: trigger the morning abilities of the top 2 cards below this with morning.',
  keywords: [{ name: Keywords.morning, x: 0, y: 60 }],
})

class Sunflower extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    let points = this.points + bonus
    points += game.status[player].filter(
      (status) => status === Status.NOURISH,
    ).length
    points -= game.status[player].filter(
      (status) => status === Status.STARVE,
    ).length

    super.play(player, game, index, bonus)
    this.inspire(points, game, player)
  }
}
const sunflower = new Sunflower({
  name: 'Sunflower',
  id: 69,
  cost: 2,
  points: 1,
  text: 'Inspire 1 for each point this is worth.',
  keywords: [{ name: Keywords.inspire, x: -36, y: 111, value: 1 }],
})

// Beta
class Aspirant extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    if (super.exhale(3, game, player)) {
      bonus += 3
    }
    super.play(player, game, index, bonus)
  }
}
const aspirant = new Aspirant({
  name: 'Aspirant',
  id: 360,
  cost: 2,
  points: 2,
  text: 'Exhale 3: Worth +3.',
  beta: true,
})
class Fates extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    // Atropos the inevitable
    if (super.exhale(6, game, player)) {
      super.reset(game)
    }

    // Lachesis the allotter
    if (super.exhale(3, game, player)) {
      super.nourish(2, game, player)
    }

    // Clotho the spinner
    if (super.exhale(1, game, player)) {
      super.birth(1, game, player)
    }
  }
}
const fates = new Fates({
  name: 'Fates',
  id: 369,
  text: 'Exhale 6: Reset.\nExhale 3: Nourish 2.\nExhale 1: Birth 1.',
  beta: true,
})

class Wish extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    // Inspire 1
    super.inspire(1, game, player)

    // Find the highest cost in the deck
    const highestCost = game.deck[player].reduce((max, card) => {
      return card.cost > max.cost ? card : max
    }, game.deck[player][0]).cost

    if (highestCost !== undefined) {
      game.tutor(player, highestCost)
    }
  }
}
const wish = new Wish({
  name: 'Wish',
  id: 828,
  cost: 2,
  text: 'Inspire 1.\nDraw the highest base cost card from your deck.',
  beta: true,
})

class Possibility extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    game.maxBreath[player] += 1
  }
}
const possibility = new Possibility({
  name: 'Possibility',
  id: 8828,
  cost: 4,
  qualities: [Quality.FLEETING],
  text: 'Fleeting.\nIncrease your max breath by 1 permanently.',
  beta: true,
})

class Neptune extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    game.breath[player] += 3
  }

  onMorning(player: number, game: GameModel, index: number) {
    const endOfLastRound =
      game.recentModels[player][game.recentModels[player].length - 1]
    const lastRoundsBreath = endOfLastRound.breath[player]
    super.addBreath(lastRoundsBreath, game, player)

    return true
  }
}
const neptune = new Neptune({
  name: 'Neptune',
  id: 8056,
  cost: 3,
  text: 'Gain 3 breath.\nMorning: Gain 1 breath for each breath you ended the last round with.',
  beta: true,
})

export {
  stars,
  cosmos,
  nightVision,
  ecology,
  sun,
  moon,
  sunflower,
  // BETA
  aspirant,
  fates,
  wish,
  possibility,
  neptune,
}
