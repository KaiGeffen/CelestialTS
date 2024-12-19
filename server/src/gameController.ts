import GameModel from '../../shared/state/gameModel'
import Card from '../../shared/state/card'

import { Status } from '../../shared/state/effects'
import { SoundEffect } from '../../shared/state/soundEffect'
import { Animation } from '../../shared/animation'
import {
  DRAW_PER_TURN,
  START_HAND_REAL,
  START_HAND,
  HAND_CAP,
  BREATH_GAIN_PER_TURN,
  START_BREATH,
  BREATH_CAP,
  PASS,
  Mulligan,
} from '../../shared/settings'
import getClientGameModel from '../../shared/state/clientGameModel'
import { Zone } from '../../shared/state/zone'

class ServerController {
  model: GameModel

  constructor(deck1: Card[], deck2: Card[], avatar1: number, avatar2: number) {
    this.model = new GameModel(deck1, deck2, avatar1, avatar2)
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
        this.model.animations[player].push(
          new Animation({
            from: Zone.Deck,
            to: Zone.Mulligan,
            card: card,
            index: i,
          }),
        )
      }
    }
  }

  doSetup(): void {
    for (const player of [0, 1]) {
      this.model.draw(player, START_HAND)
      this.model.maxBreath = [START_BREATH, START_BREATH]
    }
  }

  onPlayerInput(player: number, choice: number, version?: number): boolean {
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
        this.model.sound = SoundEffect.Pass

        if (this.model.passes === 2) {
          this.model.passes = 0
          this.doResolvePhase()
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
      this.model.sound = null
      this.play(player, cardNum)
      return true
    } else {
      console.log(`Can't play the ${cardNum}th card`)
      return false
    }
  }

  play(player: number, cardNum: number): void {
    const card = this.model.hand[player].splice(cardNum, 1)[0]
    this.model.breath[player] -= this.getCost(card, player)

    // TODO Is this outdated
    // const result =
    card.onPlay(player, this.model)
    // if (result) {
    //   card = result
    // }

    for (const cardInHand of this.model.hand[player]) {
      cardInHand.inHandOnPlay(player, this.model)
    }

    this.model.story.addAct(card, player)
  }

  doMulligan(player: number, mulligans: Mulligan): void {
    this.model.versionIncr()

    // Determine which cards are being kept or thrown back
    const keptCards: [Card, number][] = []
    const thrownCards: [Card, number][] = []
    const handSize = this.model.hand[player].length
    for (let i = 0; i < handSize; i++) {
      const card = this.model.hand[player].shift()
      if (mulligans[i]) {
        thrownCards.push([card, i])
      } else {
        keptCards.push([card, i])
      }
    }

    for (const [card, indexFrom] of keptCards) {
      const indexTo = this.model.hand[player].length
      this.model.animations[player].push(
        new Animation({
          from: Zone.Mulligan,
          to: Zone.Hand,
          card: card,
          index: indexFrom,
          index2: indexTo,
        }),
      )
      this.model.hand[player].push(card)
    }

    this.model.draw(player, mulligans.filter(Boolean).length)

    for (const [card, indexFrom] of thrownCards) {
      this.model.deck[player].push(card)
      this.model.animations[player].push(
        new Animation({
          from: Zone.Mulligan,
          to: Zone.Deck,
          card: card,
          index: indexFrom,
        }),
      )
    }

    this.model.shuffle(player, false)
    this.model.mulligansComplete[player] = true
  }

  doUpkeep(): void {
    // Reset vision
    const newVision0 = this.model.status[0].includes(Status.AWAKENED)
      ? this.model.vision[0]
      : 0
    const newVision1 = this.model.status[1].includes(Status.AWAKENED)
      ? this.model.vision[1]
      : 0
    this.model.vision = [newVision0, newVision1]

    // Reset round counters
    this.model.passes = 0
    this.model.amtDrawn = [0, 0]

    // Set priority
    this.model.priority = this.model.lastPlayerWhoPlayed

    // Increase max breath by 1, up to a cap
    for (const player of [0, 1]) {
      if (this.model.maxBreath[player] < BREATH_CAP) {
        this.model.maxBreath[player] = Math.min(
          this.model.maxBreath[player] + BREATH_GAIN_PER_TURN,
          BREATH_CAP,
        )
      }
      this.model.breath[player] = this.model.maxBreath[player]

      // Do any upkeep status effect
      this.doUpkeepStatuses(player)

      // Do any effects that activate in hand
      let index = 0
      while (index < this.model.hand[player].length) {
        const card = this.model.hand[player][index]
        const somethingActivated = card.onUpkeep(player, this.model, index)

        if (somethingActivated) {
          this.model.animations[player].push(
            new Animation({
              from: Zone.Hand,
              to: Zone.Hand,
              card: card,
              index: index,
              index2: index,
            }),
          )
        }

        index += 1
      }

      // Do any activated in discard pile effects
      if (this.model.pile[player].length > 0) {
        const card = this.model.pile[player][this.model.pile[player].length - 1]
        const somethingActivated = card.morning(
          player,
          this.model,
          this.model.pile[player].length - 1,
        )
        if (somethingActivated) {
          this.model.animations[player].push(
            new Animation({
              from: Zone.Discard,
              to: Zone.Discard,
              card: card,
              index: index,
              index2: index,
            }),
          )
        }
      }
    }

    // Draw cards for the turn, set breath to max
    for (const player of [0, 1]) {
      this.model.draw(player, DRAW_PER_TURN)
      this.model.breath[player] = Math.max(this.model.breath[player], 0)
    }
  }

  // The resolution phase, after both players have passed. Points and effects happen as cards resolve
  doResolvePhase(): void {
    this.model.score = [0, 0]
    const wins: [number, number] = [0, 0]

    // this.model.recap.reset()
    this.model.story.run(this.model)

    // If a player has more points, they win the round
    if (this.model.score[0] > this.model.score[1]) {
      wins[0] += 1
    } else if (this.model.score[1] > this.model.score[0]) {
      wins[1] += 1
    }

    this.model.wins[0] += wins[0]
    this.model.wins[1] += wins[1]

    // Add each players points as the final moment after the story resolves
    this.model.roundResults[0].push(this.model.score[0])
    this.model.roundResults[1].push(this.model.score[1])

    // this.model.recap.addTotal(this.model.score, wins)

    this.model.story.saveEndState(this.model)
    this.model.story.clear()

    this.model.sound = null
  }

  // Get the model of the game that given player sees
  getClientModel(player: number): GameModel {
    return getClientGameModel(this.model, player)
  }

  doUpkeepStatuses(player: number): void {
    // Clear inspired from last round
    const createdStatuses = [Status.INSPIRED]
    this.model.status[player] = this.model.status[player].filter(
      (stat) => !createdStatuses.includes(stat),
    )

    // Add inspired equal to the amount of inspire
    for (const stat of this.model.status[player]) {
      if (stat === Status.INSPIRE) {
        this.model.breath[player] += 1
        this.model.status[player].push(Status.INSPIRED)
      }
    }

    // Clear all statuses besides those just added
    const clearedStatuses = [Status.INSPIRE, Status.UNLOCKED, Status.AWAKENED]
    this.model.status[player] = this.model.status[player].filter(
      (stat) => !clearedStatuses.includes(stat),
    )
  }

  canPlay(player: number, cardNum: number): boolean {
    if (cardNum >= this.model.hand[player].length) {
      return false
    }

    const card = this.model.hand[player][cardNum]
    if (this.getCost(card, player) > this.model.breath[player]) {
      return false
    }

    return true
  }

  canPass(player: number): boolean {
    return true
    // if (
    //   this.model.maxBreath[player] === BREATH_CAP &&
    //   this.model.story.acts.length === 0
    // ) {
    //   for (let i = 0; i < this.model.hand[player].length; i++) {
    //     if (this.canPlay(player, i)) {
    //       return false
    //     }
    //   }
    // }

    // return true
  }

  getCost(card: Card, player: number): number {
    if (this.model.status[player].includes(Status.UNLOCKED)) {
      return 0
    } else {
      return card.getCost(player, this.model)
    }
  }
}

export { ServerController }
