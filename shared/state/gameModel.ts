import Card from './card'
import { Story } from './story'
import { Avatar } from './avatar'

import { Anim } from './animation'
// import { CardCodec } from '../cardCodec'
// import { hidden_card } from './logic/Catalog'
import { Quality, Status } from './effects'
// import { Recap } from './logic/Recap'
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

class GameModel {
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

  // Recap
  // recap: Recap = new Recap()
  score: number[] = [0, 0]
  roundResults: any[][] = [[], []]

  // Particular phase / time of game
  versionNo: number = 0
  mulligansComplete: boolean[] = [false, false]

  // Effects
  sound: any = null
  // animations: any[][] = [[], []]

  // Other
  last_shuffle: any[][] = [[], []]

  // Game tracking
  wins: number[] = [0, 0]
  passes: number = 0
  priority: number = 0
  lastPlayerWhoPlayed: number = 0

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
    // this.animations = [[], []]
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
    // this.recap = this.story.recap
    this.mulligansComplete = [false, false]
    this.amtPasses = [0, 0]
    this.amtDrawn = [0, 0]
    this.avatars = [avatar1, avatar2]
    this.roundResults = [[], []]
    this.lastPlayerWhoPlayed = 0
  }

  versionIncr() {
    this.versionNo += 1
    // this.animations = [[], []]
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
      // this.animations[player].push(
      //   new Anim(
      //     'Deck',
      //     'Hand',
      //     CardCodec.encode_card(card),
      //     this.hand[player].length - 1,
      //   ),
      // )
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
      // this.animations[player].push(
      //   new Anim(
      //     'Hand',
      //     'Discard',
      //     CardCodec.encode_card(card),
      //     index,
      //     this.pile[player].length - 1,
      //   ),
      // )
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
          // this.animations[player].push(
          //   new Anim(
          //     'Deck',
          //     'Hand',
          //     CardCodec.encode_card(card),
          //     this.hand[player].length - 1,
          //   ),
          // )
          return card
        }
      }
    }
    return null
  }

  create(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
      this.hand[player].push(card)
      // this.animations[player].push(
      //   new Anim(
      //     'Gone',
      //     'Hand',
      //     CardCodec.encode_card(card),
      //     this.hand[player].length - 1,
      //   ),
      // )
      return card
    }
    return null
  }

  create_in_pile(player: number, card: any) {
    // this.animations[player].push(
    //   new Anim(
    //     'Gone',
    //     'Discard',
    //     CardCodec.encode_card(card),
    //     this.pile[player].length,
    //   ),
    // )
    this.pile[player].push(card)
  }

  oust(player: number) {
    let cost = 0
    while (this.hand[player].length > 0) {
      for (let i = 0; i < this.hand[player].length; i++) {
        if (this.hand[player][i].cost === cost) {
          const card = this.hand[player][i]
          // this.animations[player].push(
          //   new Anim('Hand', 'Gone', CardCodec.encode_card(card), i),
          // )
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
        // this.animations[player].push(
        //   new Anim('Discard', 'Gone', CardCodec.encode_card(card)),
        // )
        this.expended[player].push(card)
      }
    }
  }

  mill(player: number) {
    if (this.deck[player].length > 0) {
      const card = this.deck[player].pop()
      this.pile[player].push(card)
      // this.animations[player].push(
      //   new Anim('Deck', 'Discard', CardCodec.encode_card(card)),
      // )
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
      // this.animations[player].push(new Anim('Shuffle'))
    }
  }

  create_card(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
      this.hand[player].push(card)
    }
  }

  get_highest_card_in_hand(player: number) {
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

  // TODO Get a model that doesn't show unknown information
  /*
  get_client_model(
    player: number,
    cards_playable = Array(6).fill(false),
    costs = Array(6).fill(null),
    is_recap = false,
  ) {
    const deck_sort = (card: any) => {
      const rand_from_name = (parseInt(card.name, 36) % 1000) / 1000
      return card.cost + rand_from_name
    }

    const slice_step = player === 0 ? 1 : -1
    const relative_recap = player === 0 ? this.recap : this.recap.get_flipped()

    return {
      hand: CardCodec.encode_deck(this.hand[player]),
      opp_hand: CardCodec.encode_deck(this.hand[player ^ 1]),
      deck: CardCodec.encode_deck(this.deck[player].sort(deck_sort)),
      opp_deck: this.deck[player ^ 1].length,
      pile: this.pile.slice().reverse().map(CardCodec.encode_deck),
      last_shuffle: CardCodec.encode_deck(
        this.last_shuffle[player ^ 1].sort(deck_sort),
      ),
      expended: this.expended.slice().reverse().map(CardCodec.encode_deck),
      wins: this.wins.slice().reverse(),
      maxBreath: this.maxBreath.slice().reverse(),
      breath: this.breath[player],
      status: CardCodec.encode_statuses(this.status[player]),
      opp_status: CardCodec.encode_statuses(this.status[player ^ 1]),
      story: this.get_relative_story(player, is_recap),
      priority: this.priority ^ player,
      passes: this.passes,
      recap: CardCodec.encode_recap(relative_recap, is_recap),
      mulligansComplete: this.mulligansComplete.slice().reverse(),
      version_number: this.versionNo,
      cards_playable: cards_playable,
      vision: this.vision[player],
      winner: this.getWinner() === null ? null : this.getWinner() ^ player,
      score: this.score.slice().reverse(),
      sound_effect: this.sound,
      animations: this.hide_opp_animations(this.animations.slice().reverse()),
      costs: costs,
      avatars: this.avatars.slice().reverse(),
      round_results: this.roundResults.slice().reverse(),
    }
  }

  hide_opp_animations(animations: any[][]) {
    const opp_animations = animations[1]
    if (this.versionNo <= 2) {
      return [animations[0], []]
    }
    const obfuscated = opp_animations.map((anim: any) => {
      if (anim.zone_to === 'Hand' && anim.zone_from !== 'Hand') {
        return new Anim(
          anim.zone_to,
          anim.zone_from,
          undefined,
          anim.index,
          anim.index2,
        )
      } else {
        return anim
      }
    })
    return [animations[0], obfuscated]
  }

  get_relative_story(player: number, total_vision: boolean) {
    const hide_opponents_cards = (live_card: [any, number]) => {
      const [card, owner] = live_card
      if (
        !total_vision &&
        owner !== player &&
        !card.qualities.includes(Quality.VISIBLE)
      ) {
        return [hidden_card, owner]
      } else {
        return live_card
      }
    }

    const switch_owners = (live_card: [any, number]) => {
      const [card, owner] = live_card
      return [card, owner ^ 1]
    }

    let result = this.story.acts.map((act: any) => [act.card, act.owner])
    const visible_result = result.slice(0, this.vision[player])
    const invisible_result = result
      .slice(this.vision[player])
      .map(hide_opponents_cards)
    result = visible_result.concat(invisible_result)

    if (player === 1) {
      result = result.map(switch_owners)
    }

    return CardCodec.encode_story(result)
  }
  */
}

export { GameModel }
