import { ServerModel } from './ServerModel'
import { Catalog } from './Catalog'
import { Status } from './Effects'
import { SoundEffect } from './SoundEffect'
import { Animation } from './Animation'
import { Source } from './Story'
import { CardCodec } from './CardCodec'

const DRAW_PER_TURN = 2
const START_HAND_REAL = 3
const START_HAND = START_HAND_REAL - DRAW_PER_TURN
const HAND_CAP = 6

const MANA_GAIN_PER_TURN = 1
const START_MANA = 1 - MANA_GAIN_PER_TURN
const MANA_CAP = 10

const PASS = 10

export class ServerController {
  model: ServerModel

  constructor(deck1: any, deck2: any, avatar1: any, avatar2: any) {
    this.model = new ServerModel(deck1, deck2, avatar1, avatar2)
  }

  onPlayerInput(player: number, choice: number, version?: number): boolean {
    if (choice === 13) {
      // Autowin, debug
      this.model.wins[0] = 5
      this.model.versionIncr()
      return true
    }

    if (version !== undefined && version !== this.model.versionNo) {
      return false
    }

    if (this.model.getWinner() !== null) {
      return false
    }

    if (player !== this.model.priority) {
      return false
    }

    if (this.model.mulligansComplete.includes(false)) {
      return false
    }

    if (choice === PASS) {
      if (!this.canPass(player)) {
        return false
      } else {
        this.model.passes += 1
        this.model.amtPasses[player] += 1

        this.model.switchPriority()
        this.model.soundEffect = SoundEffect.Pass

        if (this.model.passes === 2) {
          this.model.passes = 0
          this.doTakedown()
          this.model.versionIncr()
          this.doUpkeep()
        } else {
          this.model.versionIncr()
        }

        return true
      }
    } else {
      if (this.attemptPlay(player, choice)) {
        this.model.passes = 0
        this.model.lastPlayerWhoPlayed = player
        this.model.switchPriority()
        this.model.versionIncr()
        return true
      } else {
        return false
      }
    }
  }

  attemptPlay(player: number, cardNum: number): boolean {
    if (this.canPlay(player, cardNum)) {
      this.model.soundEffect = null
      this.play(player, cardNum)
      return true
    } else {
      console.log(`Can't play the ${cardNum}th card`)
      return false
    }
  }

  play(player: number, cardNum: number): void {
    const card = this.model.hand[player].splice(cardNum, 1)[0]
    this.model.mana[player] -= this.getCost(card, player)

    const result = card.onPlay(player, this.model)
    if (result) {
      card = result
    }

    for (const cardInHand of this.model.hand[player]) {
      cardInHand.inHandOnPlay(player, this.model)
    }

    this.model.story.addAct(card, player, Source.HAND)
  }

  doMulligan(player: number, mulligans: boolean[]): void {
    this.model.versionIncr()

    const keptCards: any[] = []
    const thrownCards: any[] = []
    for (
      let i = 0;
      i < Math.min(START_HAND_REAL, this.model.hand[player].length);
      i++
    ) {
      const card = this.model.hand[player].shift()
      if (mulligans[i]) {
        thrownCards.push({ card, index: i })
      } else {
        keptCards.push({ card, index: i })
      }
    }

    for (const { card, indexFrom } of keptCards) {
      const indexTo = this.model.hand[player].length
      this.model.animations[player].push(
        new Animation(
          'Mulligan',
          'Hand',
          CardCodec.encodeCard(card),
          indexFrom,
          indexTo
        )
      )
      this.model.hand[player].push(card)
    }

    this.model.draw(player, mulligans.filter(Boolean).length)

    for (const { card, indexFrom } of thrownCards) {
      this.model.deck[player].push(card)
      this.model.animations[player].push(
        new Animation('Mulligan', 'Deck', CardCodec.encodeCard(card), indexFrom)
      )
    }

    this.model.shuffle(player, false)
    this.model.mulligansComplete[player] = true
  }

  start(): void {
    this.doSetup()
    this.doUpkeep()

    for (const player of [0, 1]) {
      this.model.animations[player] = []

      for (
        let i = 0;
        i < Math.min(START_HAND_REAL, this.model.deck[player].length);
        i++
      ) {
        const card = this.model.hand[player][i]
        const anim = new Animation(
          'Deck',
          'Mulligan',
          CardCodec.encodeCard(card),
          i
        )
        this.model.animations[player].push(anim)
      }
    }
  }

  doSetup(): void {
    for (const player of [0, 1]) {
      this.model.draw(player, START_HAND)
      this.model.maxMana = [START_MANA, START_MANA]
    }
  }

  doUpkeep(): void {
    const newVision0 =
      this.model.vision[0] && this.model.status[0].includes(Status.AWAKENED)
        ? this.model.vision[0]
        : 0
    const newVision1 =
      this.model.vision[1] && this.model.status[1].includes(Status.AWAKENED)
        ? this.model.vision[1]
        : 0
    this.model.vision = [newVision0, newVision1]

    this.model.amtPasses = [0, 0]
    this.model.amtDrawn = [0, 0]

    this.model.priority = this.model.lastPlayerWhoPlayed

    for (const player of [0, 1]) {
      if (this.model.maxMana[player] < MANA_CAP) {
        this.model.maxMana[player] = Math.min(
          this.model.maxMana[player] + MANA_GAIN_PER_TURN,
          MANA_CAP
        )
      }
      this.model.mana[player] = this.model.maxMana[player]

      this.doUpkeepStatuses(player)

      let index = 0
      while (index < this.model.hand[player].length) {
        const card = this.model.hand[player][index]
        const somethingActivated = card.onUpkeep(player, this.model, index)

        if (somethingActivated) {
          this.model.animations[player].push(
            new Animation(
              'Hand',
              'Hand',
              CardCodec.encodeCard(card),
              index,
              index
            )
          )
        }

        index += 1
      }

      if (this.model.pile[player].length > 0) {
        const card = this.model.pile[player][this.model.pile[player].length - 1]
        const somethingActivated = card.morning(
          player,
          this.model,
          this.model.pile[player].length - 1
        )
        if (somethingActivated) {
          this.model.animations[player].push(
            new Animation(
              'Discard',
              'Discard',
              CardCodec.encodeCard(card),
              index,
              index
            )
          )
        }
      }
    }

    for (const player of [0, 1]) {
      this.model.draw(player, DRAW_PER_TURN)
      this.model.mana[player] = Math.max(this.model.mana[player], 0)
    }
  }

  doTakedown(): void {
    this.model.score = [0, 0]
    const wins = [0, 0]

    this.model.recap.reset()
    this.model.story.run(this.model)

    if (this.model.score[0] > this.model.score[1]) {
      wins[0] += 1
    } else if (this.model.score[1] > this.model.score[0]) {
      wins[1] += 1
    }

    this.model.wins[0] += wins[0]
    this.model.wins[1] += wins[1]

    this.model.roundResults[0].push(this.model.score[0])
    this.model.roundResults[1].push(this.model.score[1])

    const safeTotals = [0, 0]
    this.model.recap.addTotal(this.model.score, wins, safeTotals)

    this.model.story.saveEndState(this.model)
    this.model.story.clear()

    this.model.soundEffect = null
  }

  getClientModel(player: number): any {
    const playerCanPlay = (cardNum: number) => this.canPlay(player, cardNum)
    const cardsPlayable = Array.from(
      { length: this.model.hand[player].length },
      (_, i) => playerCanPlay(i)
    )
    const costs = this.model.hand[player].map((card) =>
      this.getCost(card, player)
    )

    return this.model.getClientModel(player, cardsPlayable, costs)
  }

  doUpkeepStatuses(player: number): void {
    const createdStatuses = [Status.INSPIRED]
    this.model.status[player] = this.model.status[player].filter(
      (stat) => !createdStatuses.includes(stat)
    )

    for (const stat of this.model.status[player]) {
      if (stat === Status.INSPIRE) {
        this.model.mana[player] += 1
        this.model.status[player].push(Status.INSPIRED)
      }
    }

    const clearedStatuses = [Status.INSPIRE, Status.UNLOCKED, Status.AWAKENED]
    this.model.status[player] = this.model.status[player].filter(
      (stat) => !clearedStatuses.includes(stat)
    )
  }

  canPlay(player: number, cardNum: number): boolean {
    if (cardNum >= this.model.hand[player].length) {
      return false
    }

    const card = this.model.hand[player][cardNum]
    if (this.getCost(card, player) > this.model.mana[player]) {
      return false
    }

    return true
  }

  canPass(player: number): boolean {
    if (
      this.model.maxMana[player] === MANA_CAP &&
      this.model.story.acts.length === 0
    ) {
      for (let i = 0; i < this.model.hand[player].length; i++) {
        if (this.canPlay(player, i)) {
          return false
        }
      }
    }

    return true
  }

  getCost(card: any, player: number): number {
    if (this.model.status[player].includes(Status.UNLOCKED)) {
      return 0
    } else {
      return card.getCost(player, this.model)
    }
  }
}
