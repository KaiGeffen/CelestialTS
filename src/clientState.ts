import { Card } from "./catalog/catalog";
import { decodeDeck, decodeStory, decodeStatuses } from "./catalog/codec"
import Story from "./story"


export default class ClientState {
	hand: Card[]
	opponentHandSize: number
	deck: Card[]
	opponentDeckSize: number
	discard: Card[][]
	wins: number[]
	maxMana: number[]
	mana: number
	status: string
	opponentStatus: string
	story: Story
	priority: number
	passes: number
	// recap: Recap TODO
	mulligansComplete: boolean[]
	// versionNumber: number

	constructor(state) {
		this.hand = decodeDeck(state.hand)
		this.opponentHandSize = state.opp_hand
		this.deck = decodeDeck(state.deck)
		this.opponentDeckSize = state.opp_deck
		this.discard = state.pile.map(pile => decodeDeck(pile))
		this.wins = state.wins
		this.maxMana = state.max_mana
		this.mana = state.mana
		this.status = decodeStatuses(state.status)
		this.opponentStatus = decodeStatuses(state.opp_status)
		this.story = decodeStory(state.story)
		this.priority = state.priority
		this.passes = state.passes
		this.mulligansComplete = state.mulligans_complete
		// this.version_number
	}
}