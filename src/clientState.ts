import { Card } from "./catalog/catalog";
import { decodeDeck, decodeStory } from "./catalog/codec"
import Story from "./story"


export default class ClientState {
	hand: Card[]
	opponentHand: number
	deck: Card[]
	opponentDeck: number
	pile: Card[][]
	wins: number[]
	maxMana: number[]
	mana: number[]
	// status: string[]
	// opponentStatus: string[]
	story: Story
	priority: number
	passes: number
	// recap: Recap TODO
	MulligansComplete: boolean[]
	// versionNumber: number

	constructor(state) {
		this.hand = decodeDeck(state.hand)
		this.opponentHand = state.opp_hand
		this.deck = decodeDeck(state.deck)
		this.opponentDeck = state.opp_deck
		this.pile = state.pile.map(pile => decodeDeck(pile))
		this.wins = state.wins
		this.maxMana = state.maxMana
		this.mana = state.mana
		// this.status = state.status
		// this.opponentStatus = 
		this.story = decodeStory(state.story)
		this.priority = state.priotity
		this.passes = state.passes
		this.MulligansComplete = state.MulligansComplete
		// this.versionNumber
	}
}