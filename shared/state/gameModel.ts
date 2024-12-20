import Card from './card'
import { Story } from './story'
import { Avatar } from './avatar'

import { Animation } from '../animation'
import { Zone } from './zone'
// import { CardCodec } from '../cardCodec'
import { Quality, Status } from './effects'
import {
  DRAW_PER_TURN,
  START_HAND_REAL,
  START_HAND,
  HAND_CAP,
  BREATH_GAIN_PER_TURN,
  START_BREATH,
  BREATH_CAP,
  PASS,
} from '../settings'

export default class GameModel {
  createInStory(player: number, card: Card) {
    throw new Error('Method not implemented.')
  }
  removeAct(index: number): any {
    throw new Error('Method not implemented.')
  }
  // Zones
  hand: Card[][] = [[], []]
  deck: Card[][] = [[], []]
  pile: Card[][] = [[], []]
  expended: Card[][] = [[], []]
  story: Story = new Story()

  // Player qualities
  breath: number[] = [0, 0]
  maxBreath: number[] = [0, 0]
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

  // Effects
  sound: any = null
  animations: Animation[][] = [[], []]

  // Other
  last_shuffle: any[][] = [[], []]
  winner: number = null
  // The points each player got each round
  roundResults: [number[], number[]] = [[], []]

  // Game tracking
  wins: number[] = [0, 0]
  passes: number = 0
  priority: number = 0
  lastPlayerWhoPlayed: number = 0

  // For client side visualization
  cardCosts: number[]

  // Other (For weird cards)
  amtPasses: number[] = [0, 0]
  amtDrawn: number[] = [0, 0]
  avatars: Avatar[] = []

  constructor(
    deck1: Card[],
    deck2: Card[],
    avatar1: Avatar,
    avatar2: Avatar,
    // Shuffle the deck
    shuffle = true,
  ) {
    // TODO Most of this is redundant
    this.versionNo = 0
    this.sound = null
    this.animations = [[], []]
    this.hand = [[], []]
    this.deck = [deck1, deck2]
    this.pile = [[], []]
    if (shuffle) {
      for (let p = 0; p < 2; p++) {
        this.shuffle(p, false)
      }
    }
    this.last_shuffle = [[], []]
    this.expended = [[], []]
    this.score = [0, 0]
    this.wins = [0, 0]
    this.maxBreath = [0, 0]
    this.breath = [0, 0]
    this.status = [[], []]
    this.story = new Story()
    this.passes = 0
    this.priority = 0
    this.vision = [0, 0]
    this.mulligansComplete = [false, false]
    this.amtPasses = [0, 0]
    this.amtDrawn = [0, 0]
    this.avatars = [avatar1, avatar2]
    this.lastPlayerWhoPlayed = 0
  }

  versionIncr() {
    this.versionNo += 1
    this.animations = [[], []]
  }

  draw(player: number, amt = 1) {
    let card = null
    while (amt > 0 && this.hand[player].length < HAND_CAP) {
      if (this.deck[player].length === 0) {
        if (this.pile[player].length === 0) {
          return
        } else {
          this.shuffle(player)
        }
      }
      card = this.deck[player].pop()
      this.hand[player].push(card)
      this.amtDrawn[player] += 1
      amt -= 1
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

  // Discard amt cards from player's hand at given index
  discard(player: number, amt = 1, index = 0) {
    let card = null
    while (amt > 0 && this.hand[player].length > index) {
      card = this.hand[player].splice(index, 1)[0]
      this.pile[player].push(card)
      amt -= 1

      this.animations[player].push(
        new Animation({
          from: Zone.Hand,
          to: Zone.Discard,
          index: index,
          index2: this.pile[player].length - 1,
        }),
      )
    }
    return card
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
    if (this.hand[player].length < HAND_CAP) {
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

  create(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
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

  createInPile(player: number, card: any) {
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

  oust(player: number) {
    let cost = 0
    while (this.hand[player].length > 0) {
      for (let i = 0; i < this.hand[player].length; i++) {
        if (this.hand[player][i].cost === cost) {
          const card = this.hand[player][i]
          this.animations[player].push(
            new Animation({
              from: Zone.Hand,
              to: Zone.Gone,
              card: card,
              index: i,
            }),
          )
          this.expended[player].push(card)
          this.hand[player].splice(i, 1)
          return card
        }
      }
      cost += 1
    }
    return null
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

  mill(player: number) {
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
      return card
    }
    return null
  }

  shuffle(player: number, remember = true, take_pile = true) {
    if (remember) {
      this.last_shuffle[player] = this.pile[player]
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

  createCard(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
      this.hand[player].push(card)
    }
  }

  getHighestCardInHand(player: number) {
    let result = null
    for (const card of this.hand[player]) {
      if (result === null || card.cost > result.cost) {
        result = card
      }
    }
    return result
  }

  switchPriority() {
    this.priority = (this.priority + 1) % 2
  }

  getWinner() {
    if (this.wins[0] >= 5) {
      return 0
    }
    if (this.wins[1] >= 5) {
      return 1
    }
    return null
  }
}
