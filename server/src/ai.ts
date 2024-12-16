import { chain, combinations } from 'itertools'
import { Status, Quality } from '../../shared/state/effects'

function* powerset<T>(arr: T[]): IterableIterator<T[]> {
  for (let r = 0; r <= arr.length; r++) {
    yield* combinations(arr, r)
  }
}

function predictPointDifference(model: any): number {
  let ourPoints = 0
  let theirPoints = 0

  let ourNourish =
    model.status.filter((s: any) => s === Status.NOURISH).length -
    model.status.filter((s: any) => s === Status.STARVE).length
  let theirNourish =
    model.opp_status.filter((s: any) => s === Status.NOURISH).length -
    model.opp_status.filter((s: any) => s === Status.STARVE).length

  let theirMana =
    model.max_mana[0] +
    model.opp_status.filter((s: any) => s === Status.INSPIRED).length
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
        theirMana -= act.card.cost
      } else {
        theyPlayedHiddenCards = true
      }
    }
  }

  if (theyPlayedHiddenCards) {
    theirPoints += theirMana
  }

  return ourPoints - theirPoints
}

function wantDryRound(model: any): boolean {
  if (model.story.acts.length > 0 || model.passes === 0) {
    return false
  }

  let result = 0

  const weDraw = Math.min(
    2,
    6 - model.hand.length,
    model.deck.length + model.pile[0].length
  )
  result += 2 * weDraw
  const theyDraw = Math.min(
    2,
    6 - model.opp_hand.length,
    model.opp_deck + model.pile[1].length
  )
  result -= 2 * theyDraw

  result -= model.status.filter((s: any) => s === Status.INSPIRED).length
  result += model.opp_status.filter((s: any) => s === Status.INSPIRED).length

  return result > 0
}

function rateTurn(turn: number[], model: any): number {
  const predictedModel = JSON.parse(JSON.stringify(model))
  let remainingMana = predictedModel.mana
  let value = 0
  let floatingSwiftBonus = 0

  if (model.story.acts.length > 0) {
    const lastAct = model.story.acts[model.story.acts.length - 1]
    if (lastAct.card.name === 'Swift') {
      floatingSwiftBonus = lastAct.owner === 0 ? 1 : -1
    }
  }

  let finalCardBonus = 0

  for (const cardNum of turn) {
    const card = predictedModel.hand[cardNum]
    remainingMana -= predictedModel.costs[cardNum]
    if (remainingMana < 0) {
      return -1
    }

    value += card.ratePlay(predictedModel)
    predictedModel.story.addAct(card, 0)

    if (card.cost === 1) {
      value += floatingSwiftBonus
    }

    if (['Axolotl', 'Generator', 'Sun', 'Desert'].includes(card.name)) {
      finalCardBonus = 1
    } else {
      floatingSwiftBonus = 0
      finalCardBonus = 0
    }
  }

  value += finalCardBonus
  return value
}

function getAction(model: any): number {
  setTimeout(() => {}, 1600)

  const pointDifference = predictPointDifference(model)

  if (pointDifference > 0) {
    return 10
  }

  if (
    wantDryRound(model) &&
    (model.max_mana[0] < 10 || model.story.acts.length > 0)
  ) {
    return 10
  }

  let highScore = 0
  let bestPossible: number[] | null = null

  for (const possibleTurn of powerset([...Array(model.hand.length).keys()])) {
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
      (a, b) => model.hand[a].rateDelay(model) - model.hand[b].rateDelay(model)
    )
    return bestPossible[0]
  }
}
