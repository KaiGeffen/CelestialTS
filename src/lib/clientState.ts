import { decodeDeck, decodeStory, decodeStatuses, decodeRecap } from "./codec"
import Card from "./card"
import Story from "./story"
import Recap from "./recap"


export default class ClientState {
	hand: Card[]
	opponentHandSize: number
	deck: Card[]
	opponentDeckSize: number
	discard: Card[][]
	lastShuffle: Card[][]
	wins: number[]
	maxMana: number[]
	mana: number
	status: string
	opponentStatus: string
	story: Story
	priority: number
	passes: number
	recap: Recap
	mulligansComplete: boolean[]
	versionNumber: number
	cardsPlayable: boolean[]
	vision: number
	winner: number

	// Score is only for viewing the recap of states between each act in story
	score: [number, number]

	// The new thing that happened in this state. For instance a card was played
	soundEffect: string

	constructor(state) {
		this.hand = decodeDeck(state.hand)
		this.opponentHandSize = state.opp_hand
		this.deck = decodeDeck(state.deck)
		this.opponentDeckSize = state.opp_deck
		this.discard = state.pile.map(pile => decodeDeck(pile))
		this.lastShuffle = state.last_shuffle.map(pile => decodeDeck(pile))
		this.wins = state.wins
		this.maxMana = state.max_mana
		this.mana = state.mana
		this.status = decodeStatuses(state.status)
		this.opponentStatus = decodeStatuses(state.opp_status)
		this.story = decodeStory(state.story)
		this.priority = state.priority
		this.passes = state.passes
		this.recap = decodeRecap(state.recap)
		this.mulligansComplete = state.mulligans_complete
		this.versionNumber = state.version_number
		this.cardsPlayable = state.cards_playable
		this.vision = state.vision
		this.winner = state.winner
		this.score = state.score
		this.soundEffect = state.sound_effect
	}
}