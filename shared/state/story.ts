import Card from '../../shared/state/card'

import { SoundEffect } from './soundEffect'
// import { Recap } from './Recap'
import { Quality } from './effects'

class Act {
  constructor(
    public card: Card,
    public owner: number,
    public bonus: number = 0,
  ) {}
}

class Story {
  acts: Act[] = []
  // recap: Recap

  constructor() {
    // TODO
    // this.recap = new Recap()
  }

  addAct(card: any, owner: number, i?: number) {
    const act = new Act(card, owner)
    if (i === undefined) {
      this.acts.push(act)
    } else {
      this.acts.splice(i, 0, act)
    }
  }

  run(game: any, isSimplified: boolean = false) {
    // this.recap.reset()

    const stateBeforePlay = ['', '']
    for (let player = 0; player < 2; player++) {
      stateBeforePlay[player] = game.getClientModel(player, true)
    }
    // this.recap.addState(stateBeforePlay)
    game.animations = [[], []]

    let index = 0
    const roundEndEffects: [Function, number][] = []
    while (this.acts.length > 0) {
      const act = this.acts.shift()!

      game.soundEffect = SoundEffect.Resolve

      let result: string
      if (isSimplified) {
        game.score[act.owner] += act.card.points
        result = 'SIMPLIFIED TODO'
      } else {
        act.card.play(act.owner, game, index, act.bonus)
        result = 'TODO NOT SIMPLIFIED'
        roundEndEffects.push([act.card.onRoundEnd, act.owner])
      }

      if (!act.card.qualities.includes(Quality.FLEETING)) {
        game.pile[act.owner].push(act.card)
      } else {
        game.expended[act.owner].push(act.card)
      }

      index++
      // this.recap.add(act.card, act.owner, result)

      const stateAfterPlay = ['', '']
      for (let player = 0; player < 2; player++) {
        stateAfterPlay[player] = game.getClientModel(player, true)
      }
      // this.recap.addState(stateAfterPlay)
      game.animations = [[], []]
    }

    // Do all round end effects
    for (const [callback, player] of roundEndEffects) {
      callback(player, game)
    }
  }

  saveEndState(game: any) {
    // const stateAfterPlay = ['', '']
    // for (let player = 0; player < 2; player++) {
    //   if (this.recap.wins[player] > 0) {
    //     game.soundEffect = SoundEffect.Win
    //   } else if (this.recap.wins[player ^ 1] > 0) {
    //     game.soundEffect = SoundEffect.Lose
    //   } else {
    //     game.soundEffect = SoundEffect.Tie
    //   }
    //   stateAfterPlay[player] = game.getClientModel(player, true)
    // }
    // this.recap.addState(stateAfterPlay)
    // game.animations = [[], []]
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

  removeAct(index: number) {
    if (this.acts.length <= index) {
      throw new Error(
        `Tried to remove act ${index} in a story with only ${this.acts.length} acts.`,
      )
    }
    return this.acts.splice(index, 1)[0]
  }
}

export { Act, Story }
