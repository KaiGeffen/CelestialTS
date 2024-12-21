import { Status, Quality } from '../../shared/state/effects'
import GameModel from '../../shared/state/gameModel'

const TIME_PAUSE = 0

function getPowerset<T>(arr: T[]): T[][] {
  const result: T[][] = [[]]
  for (const value of arr) {
    const length = result.length
    for (let i = 0; i < length; i++) {
      result.push(result[i].concat(value))
    }
  }
  return result
}

function predictPointDifference(model: GameModel): number {
  let ourPoints = 0
  let theirPoints = 0

  let ourNourish =
    model.status[0].filter((s: Status) => s === Status.NOURISH).length -
    model.status[0].filter((s: Status) => s === Status.STARVE).length
  let theirNourish =
    model.status[1].filter((s: Status) => s === Status.NOURISH).length -
    model.status[1].filter((s: Status) => s === Status.STARVE).length

  let theirBreath =
    model.maxBreath[0] +
    model.status[1].filter((s: Status) => s === Status.INSPIRED).length
  let theyPlayedHiddenCards = false

  for (const act of model.story.acts) {
    if (act.owner === 0) {
      ourPoints += ourNourish
      ourNourish = 0
      ourPoints += act.card.points
    } else {
      theirPoints += theirNourish
      theirNourish = 0
      if (act.card.qualities.includes(Quality.VISIBLE)) {
        theirPoints += act.card.points
        theirBreath -= act.card.cost
      } else {
        theyPlayedHiddenCards = true
      }
    }
  }

  if (theyPlayedHiddenCards) {
    theirPoints += theirBreath
  }

  return ourPoints - theirPoints
}

function wantDryRound(model: GameModel): boolean {
  if (model.story.acts.length > 0 || model.passes === 0) {
    return false
  }

  let result = 0
  const weDraw = Math.min(
    2,
    6 - model.hand[0].length,
    model.deck.length + model.pile[0].length,
  )
  result += 2 * weDraw
  const theyDraw = Math.min(
    2,
    6 - model.hand[1].length,
    model.deck[1].length + model.pile[1].length,
  )
  result -= 2 * theyDraw

  result -= model.status[0].filter((s: Status) => s === Status.INSPIRED).length
  result += model.status[1].filter((s: Status) => s === Status.INSPIRED).length

  return result > 0
}

function rateTurn(turn: number[], model: GameModel): number {
  const predictedModel = JSON.parse(JSON.stringify(model))
  let remainingBreath = predictedModel.breath[0]
  let value = 0
  let floatingStarlingBonus = 0

  if (model.story.acts.length > 0) {
    const lastAct = model.story.acts[model.story.acts.length - 1]
    if (lastAct.card.name === 'Starling') {
      floatingStarlingBonus = lastAct.owner === 0 ? 1 : -1
    }
  }

  let finalCardBonus = 0

  for (const cardNum of turn) {
    const card = predictedModel.hand[0][cardNum]
    remainingBreath -= predictedModel.hand[0][cardNum].cost
    if (remainingBreath < 0) {
      return -1
    }

    // TODO You need this for it to be good card.ratePlay(predictedModel)
    value += card.cost
    // TODO predictedModel.story.addAct(card, 0)

    if (card.cost === 1) {
      value += floatingStarlingBonus
    }

    // TODO Don't hard-code these
    if (['Dew', 'Posterity', 'Sun'].includes(card.name)) {
      finalCardBonus = 1
    } else {
      floatingStarlingBonus = 0
      finalCardBonus = 0
    }
  }

  value += finalCardBonus
  return value
}

function getAction(model: GameModel): number {
  setTimeout(() => {}, TIME_PAUSE)

  const pointDifference = predictPointDifference(model)

  if (pointDifference > 0) {
    return 10
  }

  if (
    wantDryRound(model) &&
    (model.maxBreath[0] < 10 || model.story.acts.length > 0)
  ) {
    return 10
  }

  let highScore = 0
  let bestPossible: number[] | null = null
  for (const possibleTurn of getPowerset([
    ...Array(model.hand.length).keys(),
  ])) {
    const score = rateTurn(possibleTurn, model)

    if (score > highScore) {
      highScore = score
      bestPossible = possibleTurn
    }
  }

  if (bestPossible === null || bestPossible.length === 0) {
    return 10
  } else {
    bestPossible.sort(
      (a, b) =>
        model.hand[0][a].rateDelay(model) - model.hand[0][b].rateDelay(model),
    )
    return bestPossible[0]
  }
}

export { getAction }
