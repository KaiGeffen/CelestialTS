// TODO ai wrote this and it's wrong

import Card from './card'
import Act from './act'
import GameModel from './gameModel'

export default class Recap {
  // The story which has resolved so far
  story: Array<Act>
  // Each players current points
  sums: [number, number]
  // The number of wins each player has TODO this is a weird way to represent something at most 1
  wins: [number, number]

  stateList: Array<[any, any]>

  constructor(
    story: Array<Act> = [],
    sums: [number, number] = [0, 0],
    wins: [number, number] = [0, 0],
    stateList: Array<[any, any]> = [],
  ) {
    this.story = story
    this.sums = sums
    this.wins = wins
    this.stateList = stateList
  }

  add(card: Card, owner: number): void {
    // TODO Bonus?
    this.story.push(new Act(card, owner, 0))
  }

  addState(statePair: [GameModel, GameModel]): void {
    this.stateList.push(statePair)
  }

  addTotal(sums: [number, number], wins: [number, number]): void {
    this.sums[0] += sums[0]
    this.sums[1] += sums[1]

    this.wins[0] += wins[0]
    this.wins[1] += wins[1]
  }

  reset(): void {
    this.story = []
    this.sums = [0, 0]
    this.wins = [0, 0]
    this.stateList = []
  }

  private getFlipped(): Recap {
    const story = this.story.map(
      (act) => new Act(act.card, (act.owner + 1) % 2, act.bonus),
    )
    const sums: [number, number] = [this.sums[1], this.sums[0]]
    const wins: [number, number] = [this.wins[1], this.wins[0]]
    const stateList: any = this.stateList.map((relativeStates) => [
      relativeStates[1],
      relativeStates[0],
    ])

    return new Recap(story, sums, wins, stateList)
  }

  getStateList(player: number): Array<any> {
    return this.stateList.map((relativeStates) => relativeStates[player])
  }
}
