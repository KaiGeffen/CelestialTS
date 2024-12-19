import { Status, Quality } from './effects'
import { Anim } from './animation'
import { Act } from './story'
import GameModel from './gameModel'
import { Animation } from '../animation'
import { Zone } from './zone'

interface KeywordTuple {
  name: string
  x: number
  y: number
  value: number
}

interface ReferenceTuple {
  name: string
  x: number
  y: number
}

interface CardData {
  name?: string
  id?: number
  cost?: number
  points?: number

  text?: string
  qualities?: Quality[]
  dynamicText?: string

  story?: string
  keywords?: KeywordTuple[]
  references?: ReferenceTuple[]
}

export default class Card {
  name: string
  id: number
  cost: number
  points: number
  text: string
  qualities: Quality[]
  dynamicText: string
  story: string = ''
  keywords: KeywordTuple[] = []
  references: ReferenceTuple[] = []

  fleeting = false
  catalogText = ''

  constructor({
    name = '',
    id = 0,
    cost = 0,
    points = 0,
    text = '',
    qualities = [],
    dynamicText = '',
    // story = '',
    // keywords = [],
    // references = [],
  }: CardData) {
    this.name = name
    this.id = id
    this.cost = cost
    this.points = points
    this.text = text
    this.qualities = qualities
    this.dynamicText = dynamicText
    // this.story = story
    // this.keywords = keywords
    // this.references = references
  }

  play(player: number, game: GameModel, index: number, bonus: number): void {
    let result = this.points + bonus

    result += game.status[player].filter(
      (status: Status) => status === Status.NOURISH,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.NOURISH,
    )
    result -= game.status[player].filter(
      (status: Status) => status === Status.STARVE,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.STARVE,
    )

    game.score[player] += result

    result > 0 ? `+${result}` : `${result}`
  }

  ratePlay(world: any): number {
    return Math.max(1, this.cost)
  }

  rateDelay(world: any): number {
    return 0
  }

  getCost(player: number, game: GameModel): number {
    return this.cost
  }

  onUpkeep(player: number, game: GameModel, index: number): boolean {
    return false
  }

  inHandOnPlay(player: number, game: GameModel): boolean {
    return false
  }

  morning(player: number, game: GameModel, index: number): boolean {
    return false
  }

  onPlay(player: number, game: GameModel): void {}

  onRoundEnd(player: number, game: GameModel): void {}

  reset(game: GameModel): string {
    game.score = [0, 0]
    return '\nReset'
  }

  addBreath(amt: number, game: GameModel, player: number): string {
    game.breath[player] += amt
    for (let i = 0; i < amt; i++) {
      game.status[player].push(Status.INSPIRED)
    }
    return amt > 0 ? `\n+${amt} breath` : ''
  }

  addStatus(
    amt: number,
    game: GameModel,
    player: number,
    stat: Status,
  ): string {
    let recap = `\n${stat} ${amt}`
    if (amt <= 0) recap = ''

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
    return recap
  }

  removeStatus(game: GameModel, player: number, removedStatus: Status): void {
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== removedStatus,
    )
  }

  inspire(amt: number, game: GameModel, player: number): string {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 0,
      }),
    )
    return this.addStatus(amt, game, player, Status.INSPIRE)
  }

  nourish(amt: number, game: GameModel, player: number): string {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 2,
      }),
    )
    return this.addStatus(amt, game, player, Status.NOURISH)
  }

  starve(amt: number, game: GameModel, player: number): string {
    game.animations[player].push(
      new Animation({
        from: Zone.Status,
        status: 3,
      }),
    )
    return this.addStatus(amt, game, player, Status.STARVE)
  }

  draw(amt: number, game: GameModel, player: number): string {
    let recap = ''
    let numDrawn = 0
    for (let i = 0; i < amt; i++) {
      const card = game.draw(player)
      if (card) numDrawn++
    }
    if (numDrawn > 0) recap = `\nDraw ${numDrawn}`
    return recap
  }

  create(card: Card, game: GameModel, player: number): void {
    game.create(player, card)
  }

  createInPile(card: Card, game: GameModel, player: number): string {
    game.createInPile(player, card)
    return `\n${card.name}`
  }

  createInStory(card: Card, game: GameModel, player: number): void {
    game.createInStory(player, card)
  }

  tutor(cost: number, game: GameModel, player: number): string {
    const card = game.tutor(player, cost)
    return card ? `\nTutor ${cost}` : ''
  }

  discard(
    amt: number,
    game: GameModel,
    player: number,
    index: number = 0,
  ): string {
    let recap = '\nDiscard:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.discard(player, amt, index)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  bottom(amt: number, game: GameModel, player: number): string {
    let recap = '\nBottom'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.bottom(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  oust(amt: number, game: GameModel, player: number): string {
    let recap = '\nOust:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.oust(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

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

  dig(amt: number, game: GameModel, player: number): void {
    game.dig(player, amt)
  }

  build(amt: number, game: GameModel, player: number): string {
    for (const card of game.hand[player]) {
      if (card.name === 'Child') {
        card.points += amt
        card.dynamicText = `0:${card.points}, Fleeting`
        return `\nBuild +${amt}`
      }
    }
    const card = new Card({
      name: 'Child',
      id: 1003,
      cost: 0,
      points: amt,
      qualities: [Quality.FLEETING],
      text: `0:${amt}, fleeting`,
    })
    if (game.create(player, card)) {
      return `\nBuild ${amt}`
    } else {
      return ''
    }
  }

  transform(index: number, card: Card, game: GameModel): void {
    if (index + 1 <= game.story.acts.length) {
      const act = game.story.acts[index]
      const oldCard = act.card
      game.story.replaceAct(index, new Act(card, act.owner))
      // TODO Implement
      // game.animations[act.owner].push(
      //   new Anim('Transform', 'Story', CardCodec.encodeCard(oldCard), index),
      // )
    }
  }

  removeAct(index: number, game: GameModel): any {
    return game.removeAct(index)
  }

  yourFinal(game: GameModel, player: number): boolean {
    return !game.story.acts.some((act: Act) => act.owner === player)
  }

  rateReset(world: any): number {
    let knownValue = 0
    let theirUnknownCards = 0
    let theirBreath =
      world.maxBreath[1] +
      world.oppStatus.filter((status: Status) => status === Status.INSPIRED)
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

  rateDiscard(world: any): number {
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
      Math.min(6, world.oppHand.length + extraCards),
    )

    return cardsInHandToValue[handCount]
  }

  // TODO This is just client
  getHintText(): string {
    return ''
  }

  getReferencedCards(): Card[] {
    return []
  }

  // Get the text for this card, including formatting
  getCardText(): string {
    return ''
  }
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
