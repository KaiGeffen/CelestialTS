import Card from './card'
import { Story } from './story'
import { Avatar } from './avatar'

import { Animation } from '../animation'
import { Zone } from './zone'
// import { CardCodec } from '../cardCodec'
import { Quality, Status } from './effects'
import { MechanicsSettings } from '../settings'
import { SoundEffect } from './soundEffect'
export default class GameModel {
  // Zones
  hand: Card[][] = [[], []]
  deck: Card[][]
  pile: Card[][] = [[], []]
  expended: Card[][] = [[], []]
  story: Story = new Story()

  // Player qualities
  breath: number[] = [1, 1]
  maxBreath: number[] = [1, 1]
  status: Status[][] = [[], []]
  vision: number[] = [0, 0]

  // Resolving specific
  // Each player's score
  score: [number, number] = [0, 0]
  // Interstitial models that occured since the last user action (Recap)
  recentModels: GameModel[][] = [[], []]
  isRecap: boolean = false

  // Particular phase / time of game
  versionNo: number = 0
  mulligansComplete: boolean[] = [false, false]
  roundCount: number = 0

  // Effects
  sound: SoundEffect | null = null
  animations: Animation[][] = [[], []]

  // Other
  lastShuffle: Card[][] = [[], []]
  winner: number = null
  // The points each player got each round
  roundResults: [number[], number[]] = [[], []]

  // Game tracking
  wins: number[] = [0, 0]
  passes: number = 0
  priority: number
  lastPlayerWhoPlayed: number = 0

  // For client side visualization
  cardCosts: number[]

  // Other (For weird cards)
  amtPasses: number[] = [0, 0]
  amtDrawn: number[] = [0, 0]
  avatars: Avatar[]

  constructor(
    deck1: Card[],
    deck2: Card[],
    avatar1: Avatar,
    avatar2: Avatar,
    // Shuffle the deck
    shuffle = true,
  ) {
    this.deck = [deck1, deck2]
    if (shuffle) {
      for (let p = 0; p < 2; p++) {
        this.shuffle(p, false)
      }
    }
    this.avatars = [avatar1, avatar2]

    // Starting priority is random
    this.priority = Math.floor(Math.random() * 2)
  }

  versionIncr() {
    this.versionNo++
    this.animations = [[], []]
  }

  switchPriority() {
    this.priority = this.priority ^ 1
  }

  // Get the cost of given player playing the given card
  getCost(card: Card, player: number): number {
    if (this.status[player].includes(Status.UNLOCKED)) {
      return 0
    } else {
      return card.getCost(player, this)
    }
  }

  // Return a full deepcopy of this object
  getDeepCopy(): GameModel {
    const copy = new GameModel([], [], this.avatars[0], this.avatars[1], false)

    copy.hand = this.hand.map((hand) => [...hand])
    copy.deck = this.deck.map((deck) => [...deck])
    copy.pile = this.pile.map((pile) => [...pile])
    copy.expended = this.expended.map((expended) => [...expended])
    copy.story = this.story.getDeepCopy()
    copy.breath = [...this.breath]
    copy.maxBreath = [...this.maxBreath]
    copy.status = this.status.map((status) => [...status])
    copy.vision = [...this.vision]
    copy.score = [...this.score]
    copy.recentModels = this.recentModels.map((models) =>
      models.map((model) => model.getDeepCopy()),
    )
    copy.isRecap = this.isRecap
    copy.versionNo = this.versionNo
    copy.mulligansComplete = [...this.mulligansComplete]
    copy.sound = structuredClone(this.sound)
    copy.animations = this.animations.map((animations) => [...animations])
    copy.lastShuffle = this.lastShuffle.map((shuffle) => [...shuffle])
    copy.winner = this.winner
    copy.roundResults = [[...this.roundResults[0]], [...this.roundResults[1]]]
    copy.wins = [...this.wins]
    copy.passes = this.passes
    copy.priority = this.priority
    copy.lastPlayerWhoPlayed = this.lastPlayerWhoPlayed
    copy.cardCosts = [...this.cardCosts]
    copy.amtPasses = [...this.amtPasses]
    copy.amtDrawn = [...this.amtDrawn]
    copy.avatars = [...this.avatars]
    copy.roundCount = this.roundCount

    return copy
  }

  draw(player: number, amt = 1, isSetup = false) {
    let card: Card = null
    while (amt > 0 && this.hand[player].length < MechanicsSettings.HAND_CAP) {
      // If deck is empty, shuffled discard pile into deck
      if (this.deck[player].length === 0) {
        if (this.pile[player].length === 0) {
          return
        } else {
          this.shuffle(player)
        }
      }

      // Get the top card of deck, add it to hand
      card = this.deck[player].pop()
      this.hand[player].push(card)

      // Increment draw counter
      this.amtDrawn[player] += 1

      // Trigger its on draw effects, except during setup phase
      if (!isSetup) {
        card.onDraw(player, this)
      }

      amt -= 1

      // Animate this draw
      this.animations[player].push(
        new Animation({
          from: Zone.Deck,
          to: Zone.Hand,
          card: card,
          index2: this.hand[player].length - 1,
        }),
      )
    }
    return card
  }

  discard(player: number, amt = 1) {
    for (let i = 0; i < amt; i++) {
      if (this.hand[player].length > 0) {
        const card = this.hand[player].splice(0, 1)[0]
        this.pile[player].push(card)

        const discardPileIndex = this.pile[player].length - 1
        this.animations[player].push(
          new Animation({
            from: Zone.Hand,
            to: Zone.Discard,
            index: i,
            index2: discardPileIndex,
          }),
        )

        // Trigger its on discard effects
        card.onDiscard(player, this, discardPileIndex)
      }
    }
  }

  bottom(player: number, amt = 1, index = 0) {
    let card = null
    while (amt > 0 && this.hand[player].length > index) {
      card = this.hand[player].splice(index, 1)[0]
      this.deck[player].unshift(card)
      amt -= 1
    }
    return card
  }

  tutor(player: number, cost: number) {
    if (this.hand[player].length < MechanicsSettings.HAND_CAP) {
      for (let i = this.deck[player].length - 1; i >= 0; i--) {
        const card = this.deck[player][i]
        if (card.cost === cost) {
          this.hand[player].push(card)
          this.deck[player].splice(i, 1)
          this.amtDrawn[player] += 1
          this.animations[player].push(
            new Animation({
              from: Zone.Deck,
              to: Zone.Hand,
              card: card,
              index2: this.hand[player].length - 1,
            }),
          )
          return card
        }
      }
    }
    return null
  }

  create(player: number, card: Card) {
    if (this.hand[player].length < MechanicsSettings.HAND_CAP) {
      this.hand[player].push(card)
      this.animations[player].push(
        new Animation({
          from: Zone.Gone,
          to: Zone.Hand,
          card: card,
          index2: this.hand[player].length - 1,
        }),
      )
      return card
    }
    return null
  }

  createInPile(player: number, card: Card) {
    this.animations[player].push(
      new Animation({
        from: Zone.Gone,
        to: Zone.Discard,
        card: card,
        index2: this.pile[player].length,
      }),
    )
    this.pile[player].push(card)
  }

  createInDeck(player: number, card: Card) {
    this.animations[player].push(
      new Animation({
        from: Zone.Gone,
        to: Zone.Deck,
        card: card,
        index2: 0,
      }),
    )

    // Add the card at a random position
    this.deck[player].splice(
      Math.floor(Math.random() * this.deck[player].length),
      0,
      card,
    )
  }

  createInStory(player: number, card: Card) {
    this.story.addAct(card, player)
  }

  dig(player: number, amt: number) {
    for (let i = 0; i < amt; i++) {
      if (this.pile[player].length > 0) {
        const card = this.pile[player].pop()
        this.animations[player].push(
          new Animation({
            from: Zone.Discard,
            to: Zone.Gone,
            card: card,
          }),
        )
        this.expended[player].push(card)
      }
    }
  }

  mill(player: number, amt: number) {
    for (let i = 0; i < amt; i++) {
      if (this.deck[player].length > 0) {
        const card = this.deck[player].pop()
        this.pile[player].push(card)
        this.animations[player].push(
          new Animation({
            from: Zone.Deck,
            to: Zone.Discard,
            card: card,
          }),
        )

        // Trigger its on discard effects
        card.onDiscard(player, this, this.pile[player].length - 1)
      }
    }
  }

  shuffle(player: number, remember = true, take_pile = true) {
    if (remember) {
      this.lastShuffle[player] = this.pile[player]
    }
    if (take_pile) {
      this.deck[player] = this.pile[player].concat(this.deck[player])
      this.pile[player] = []
    }
    this.deck[player].sort(() => Math.random() - 0.5)
    if (this.deck[player].length > 0) {
      this.animations[player].push(
        new Animation({
          from: Zone.Shuffle,
        }),
      )
    }
  }

  removeAct(index: number) {
    if (index >= this.story.acts.length) {
      return
    }

    const act = this.story.acts[index]
    this.animations[act.owner].push(
      new Animation({
        from: Zone.Story,
        to: Zone.Discard,
        card: act.card,
        index: index,
      }),
    )

    this.story.removeAct(index)

    // Trigger its on discard effects
    act.card.onDiscard(act.owner, this, index)
  }

  returnActToHand(i: number) {
    const act = this.story.removeAct(i)
    this.create(act.owner, act.card)

    this.animations[act.owner].push(
      new Animation({
        from: Zone.Story,
        to: Zone.Hand,
        card: act.card,
        index: i,
        index2: this.hand[act.owner].length - 1,
      }),
    )
  }
}
