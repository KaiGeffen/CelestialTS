import { SoundEffect } from './SoundEffect'
import { Recap } from '../../../shared/state/recap'
import { Quality } from '../../../shared/state/effects'

enum Source {
  HAND = 0,
  SPRING = 1,
  PILE = 2,
}

class Act {
  card: any
  owner: number
  source: Source
  countered: boolean
  bonus: number

  constructor(card: any, owner: number, source: Source = Source.HAND) {
    this.card = card
    this.owner = owner
    this.source = source
    this.countered = false
    this.bonus = 0
  }
}

class Story {
  acts: Act[]
  recap: Recap

  constructor() {
    this.acts = []
    this.recap = new Recap()
  }

  addAct(card: any, owner: number, source: Source = Source.HAND, i?: number) {
    const act = new Act(card, owner, source)
    if (i === undefined) {
      this.acts.push(act)
    } else {
      this.acts.splice(i, 0, act)
    }
  }

  run(game: any, isSimplified: boolean = false) {
    this.recap.reset()

    const stateBeforePlay = ['', '']
    for (let player = 0; player < 2; player++) {
      stateBeforePlay[player] = game.getClientModel(player, true)
    }
    this.recap.addState(stateBeforePlay)
    game.animations = [[], []]

    let index = 0
    const roundEndEffects: [Function, number][] = []
    while (this.acts.length > 0) {
      const act = this.acts.shift()!

      game.soundEffect = SoundEffect.Resolve

      let result: string
      if (act.countered) {
        result = 'Countered'
      } else {
        if (isSimplified) {
          game.score[act.owner] += act.card.points
          result = 'SIMPLIFIED TODO'
        } else if (act.source === Source.HAND || act.source === Source.PILE) {
          result = act.card.play(act.owner, game, index, act.bonus)
          roundEndEffects.push([act.card.onRoundEnd, act.owner])
        }
      }

      if (!act.card.qualities.includes(Quality.FLEETING)) {
        game.pile[act.owner].push(act.card)
      } else {
        game.expended[act.owner].push(act.card)
      }

      index++
      this.recap.add(act.card, act.owner, result)

      const stateAfterPlay = ['', '']
      for (let player = 0; player < 2; player++) {
        stateAfterPlay[player] = game.getClientModel(player, true)
      }
      this.recap.addState(stateAfterPlay)
      game.animations = [[], []]
    }

    for (const [callback, player] of roundEndEffects) {
      callback(player, game)
    }
  }

  saveEndState(game: any) {
    const stateAfterPlay = ['', '']
    for (let player = 0; player < 2; player++) {
      if (this.recap.wins[player] > 0) {
        game.soundEffect = SoundEffect.Win
      } else if (this.recap.wins[player ^ 1] > 0) {
        game.soundEffect = SoundEffect.Lose
      } else {
        game.soundEffect = SoundEffect.Tie
      }
      stateAfterPlay[player] = game.getClientModel(player, true)
    }
    this.recap.addState(stateAfterPlay)
    game.animations = [[], []]
  }

  clear() {
    this.acts = []
  }

  getLength() {
    return this.acts.length
  }

  isEmpty() {
    return this.acts.length === 0
  }

  counter(func: (act: Act) => boolean) {
    for (const act of this.acts) {
      if (func(act)) {
        act.countered = true
        return act.card
      }
    }
    return null
  }

  moveAct(indexOrigin: number, indexDest: number) {
    const act = this.acts.splice(indexOrigin, 1)[0]
    this.acts.splice(indexDest, 0, act)
    return act
  }

  removeAct(index: number) {
    if (this.acts.length <= index) {
      throw new Error(
        `Tried to remove act ${index} in a story with only ${this.acts.length} acts.`,
      )
    }
    return this.acts.splice(index, 1)[0]
  }

  replaceAct(index: number, replacementAct: Act) {
    if (this.acts.length <= index) {
      throw new Error(
        `Tried to replace act ${index} in a story with only ${this.acts.length} acts.`,
      )
    }
    this.acts[index] = replacementAct
  }
}

export { Story, Act, Source }
