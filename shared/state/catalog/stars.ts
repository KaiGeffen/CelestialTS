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

export { stars, cosmos, nightVision, ecology, sun, moon, sunflower }
