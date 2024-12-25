import { Status, Quality } from './effects'
import { Act } from './story'
import GameModel from './gameModel'
import { Animation } from '../animation'
import { Zone } from './zone'
import { Keyword } from './keyword'

interface CardData {
  name?: string
  id?: number
  cost?: number
  points?: number
  // Some cards include this, otherwise defaults to points
  basePoints?: number
  qualities?: Quality[]

  // Just used by client
  text?: string
  story?: string
  keywords?: KeywordPosition[]
  references?: ReferencePosition[]
}

export default class Card {
  name: string
  id: number
  cost: number
  points: number
  basePoints: number
  qualities: Quality[]

  // Only used client-side
  text: string
  story: string = ''
  keywords: KeywordPosition[] = []
  references: ReferencePosition[] = []

  constructor({
    name = '',
    id = 0,
    cost = 0,
    points = 0,
    basePoints = points,
    qualities = [],

    text = '',
    story = '',
    keywords = [],
    references = [],
  }: CardData) {
    this.name = name
    this.id = id
    this.cost = cost
    this.points = points
    this.basePoints = basePoints
    this.qualities = qualities

    this.text = text
    this.story = story
    this.keywords = keywords
    this.references = references
  }

  // Play this card to the story
  play(player: number, game: GameModel, index: number, bonus: number): void {
    let result = this.points + bonus

    // Increase points by the amount of nourish, consuming it
    result += game.status[player].filter(
      (status: Status) => status === Status.NOURISH,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.NOURISH,
    )

    // Decrease points by the amount of starve, consuming it
    result -= game.status[player].filter(
      (status: Status) => status === Status.STARVE,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.STARVE,
    )

    // Add this card's points to the player's score
    game.score[player] += result
  }

  // Get this card's current cost (Which may differ from its base cost)
  getCost(player: number, game: GameModel): number {
    return this.cost
  }

  /* Triggers */
  // When this card is played
  onPlay(player: number, game: GameModel): void {}

  // When this has its morning ability triggered
  onMorning(player: number, game: GameModel, index: number): boolean {
    return false
  }

  // When this is in player's hand at the start of their upkeep
  onUpkeepInHand(player: number, game: GameModel, index: number): boolean {
    return false
  }

  // When this resolves in a round and the round ends
  onRoundEndIfThisResolved(player: number, game: GameModel): void {}

  // When this is drawn
  onDraw(player: number, game: GameModel): void {}

  /* Utility methods */
  reset(game: GameModel): void {
    game.score = [0, 0]
  }

  addBreath(amt: number, game: GameModel, player: number): void {
    game.breath[player] += amt
    for (let i = 0; i < amt; i++) {
      game.status[player].push(Status.INSPIRED)
    }
  }

  // Spend the given amount of breath, return whether successful
  exhale(player: number, game: GameModel, amt: number): boolean {
    if (game.breath[player] >= amt) {
      game.breath[player] -= amt
      return true
    } else {
      return false
    }
  }

  addStatus(amt: number, game: GameModel, player: number, stat: Status): void {
    for (let i = 0; i < amt; i++) {
      if (
        stat === Status.NOURISH &&
        game.status[player].includes(Status.STARVE)
      ) {
        game.status[player] = game.status[player].filter(
          (status: Status) => status !== Status.STARVE,
        )
      } else if (
        stat === Status.STARVE &&
        game.status[player].includes(Status.NOURISH)
      ) {
        game.status[player] = game.status[player].filter(
          (status: Status) => status !== Status.NOURISH,
        )
      } else {
        game.status[player].push(stat)
      }
    }
  }

  inspire(amt: number, game: GameModel, player: number): void {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 0,
      }),
    )
    this.addStatus(amt, game, player, Status.INSPIRE)
  }

  nourish(amt: number, game: GameModel, player: number): void {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 2,
      }),
    )
    this.addStatus(amt, game, player, Status.NOURISH)
  }

  starve(amt: number, game: GameModel, player: number): void {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 3,
      }),
    )
    this.addStatus(amt, game, player, Status.STARVE)
  }

  birth(amt: number, game: GameModel, player: number): void {
    for (const card of game.hand[player]) {
      if (card.name === 'Child') {
        card.points += amt
      }
    }
    const card = new Card({
      name: 'Child',
      id: 1003,
      points: amt,
      basePoints: 0,
      qualities: [Quality.FLEETING],
    })
    game.create(player, card)
  }

  // Transform the card in the story at given index into the given card
  transform(index: number, card: Card, game: GameModel): void {
    if (index + 1 <= game.story.acts.length) {
      const act = game.story.acts[index]
      const oldCard = act.card
      game.story.replaceAct(index, new Act(card, act.owner))

      game.animations[act.owner].push(
        new Animation({
          from: Zone.Transform,
          to: Zone.Story,
          card: oldCard,
          index2: index,
        }),
      )
    }
  }

  // TODO remove this, make model do the milling and take an amt
  mill(amt: number, game: GameModel, player: number): string {
    let recap = '\nMill:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.mill(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  /* AI Heuristics */
  ratePlay(world: GameModel): number {
    return Math.max(1, this.cost)
  }

  rateDelay(world: GameModel): number {
    return 0
  }

  rateReset(world: GameModel): number {
    let knownValue = 0
    let theirUnknownCards = 0
    let theirBreath =
      world.maxBreath[1] +
      world.status[1].filter((status: Status) => status === Status.INSPIRED)
        .length

    for (const act of world.story.acts) {
      const card = act.card
      if (act.owner === 0) {
        knownValue -= card.cost
      } else if (card.qualities.includes(Quality.VISIBLE)) {
        knownValue += card.cost
        theirBreath -= card.cost
      } else {
        theirUnknownCards++
      }
    }

    let value = knownValue
    for (let i = 0; i < theirUnknownCards; i++) {
      const guessedValue = Math.floor(theirBreath / 2)
      value += guessedValue
      theirBreath -= guessedValue
    }

    return value
  }

  rateDiscard(world: GameModel): number {
    let extraCards = 0
    for (const act of world.story.acts) {
      if (['Gift', 'Mercy'].includes(act.card.name)) {
        extraCards++
      } else if (['Dagger', 'Bone Knife', 'Chimney'].includes(act.card.name)) {
        extraCards--
      }
    }

    const cardsInHandToValue = [0, 0.6, 0.8, 1, 1, 0.2, 0.1]
    const handCount = Math.max(
      0,
      Math.min(6, world.hand[1].length + extraCards),
    )

    return cardsInHandToValue[handCount]
  }

  // TODO These are just in the mobile focus menu
  getHintText(): string {
    return ''
  }

  getReferencedCards(): Card[] {
    return []
  }
}

export interface KeywordPosition {
  name: Keyword
  x: number
  y: number
  value?: number
}

export interface ReferencePosition {
  card: Card
  x: number
  y: number
}

export class SightCard extends Card {
  constructor(
    public amt: number,
    data: CardData,
  ) {
    super(data)
  }

  onPlay(player: number, game: GameModel): void {
    game.vision[player] += this.amt
  }
}
