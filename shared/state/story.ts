import Card from '../../shared/state/card'

import { SoundEffect } from './soundEffect'
import { Quality } from './effects'
import GameModel from './gameModel'
import getClientGameModel from './clientGameModel'
import Act from './act'

class Story {
  acts: Act[] = []

  // Add a card to the story with given owner and at given position
  addAct(card: Card, owner: number, i?: number) {
    const act = new Act(card, owner)
    if (i === undefined) {
      this.acts.push(act)
    } else {
      this.acts.splice(i, 0, act)
    }
  }

  // Run the current story
  run(game: GameModel) {
    game.score = [0, 0]
    game.recentModels = [[], []]

    // Add a model at the start
    addRecentModels(game)

    let index = 0
    const roundEndEffects: [Function, number][] = []
    while (this.acts.length > 0) {
      const act = this.acts.shift()!

      game.sound = SoundEffect.Resolve

      act.card.play(act.owner, game, index, act.bonus)
      roundEndEffects.push([act.card.onRoundEnd, act.owner])

      // Put in pile or remove from game if Fleeting
      if (!act.card.qualities.includes(Quality.FLEETING)) {
        game.pile[act.owner].push(act.card)
      } else {
        game.expended[act.owner].push(act.card)
      }

      index++
      addRecentModels(game)
    }

    // Do all round end effects
    for (const [callback, player] of roundEndEffects) {
      callback(player, game)
    }
  }

  saveEndState(game: GameModel) {
    addRecentModels(game)

    game.recentModels[0][game.recentModels[0].length - 1].sound =
      SoundEffect.Win
    // TODO
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

  replaceAct(index: number, arg1: Act) {
    throw new Error('Method not implemented.')
  }

  // Flip such that player 1 is 0 and vice-verca
  flip() {
    for (const act of this.acts) {
      act.owner = act.owner === 1 ? 0 : 1
    }
  }
}

// TODO Unintuitive that this is here instead of in GameModel (Which it can't be in because of circular dependencies)
// Add the current state to list of remembered recent states
function addRecentModels(model): void {
  // Get a recent model for each and add for that player
  const model0 = getClientGameModel(model, 0)
  model0.recentModels = [[], []]
  model.recentModels[0].push(model0)

  const model1 = getClientGameModel(model, 0)
  model1.recentModels = [[], []]
  model.recentModels[1].push(model1)

  // Increment the version
  model.versionIncr()
}

export { Act, Story }
