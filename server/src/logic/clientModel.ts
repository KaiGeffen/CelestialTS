import { CardCodec } from './CardCodec'

const PASS = 10

interface State {
  hand: any[]
  opp_hand: any[]
  deck: any[]
  opp_deck: any[]
  pile: any[]
  expended: any[]
  wins: number
  max_mana: number
  mana: number
  status: any[]
  opp_status: any[]
  story: any
  priority: number
  passes: number
  recap: any
  mulligans_complete: boolean
  version_number: number
  costs: any[]
}

class ClientModel {
  hand: any[]
  opp_hand: any[]
  deck: any[]
  opp_deck: any[]
  pile: any[]
  expended: any[]
  wins: number
  max_mana: number
  mana: number
  status: any[]
  opp_status: any[]
  story: any
  priority: number
  passes: number
  recap: any
  mulligans_complete: boolean
  version_num: number
  costs: any[]

  constructor(state: State) {
    this.hand = CardCodec.decodeDeck(state.hand)
    this.opp_hand = CardCodec.decodeDeck(state.opp_hand)
    this.deck = CardCodec.decodeDeck(state.deck)
    this.opp_deck = state.opp_deck
    this.pile = state.pile.map(CardCodec.decodeDeck)
    this.expended = state.expended.map(CardCodec.decodeDeck)
    this.wins = state.wins
    this.max_mana = state.max_mana
    this.mana = state.mana
    this.status = CardCodec.decodeStatuses(state.status)
    this.opp_status = CardCodec.decodeStatuses(state.opp_status)
    this.story = CardCodec.decodeStory(state.story)
    this.priority = state.priority
    this.passes = state.passes
    this.recap = CardCodec.decodeRecap(state.recap)
    this.mulligans_complete = state.mulligans_complete
    this.version_num = state.version_number
    this.costs = state.costs
  }

  // Return if the player can play the card
  canPlay(cardNum: number): boolean {
    if (this.priority !== 0) {
      return false
    }

    // Choice isn't in hand
    if (cardNum >= this.hand.length) {
      return false
    }

    const card = this.hand[cardNum]

    // Player doesn't have enough mana
    if (card.cost > this.mana) {
      return false
    }

    return true
  }
}

export { ClientModel, State }
