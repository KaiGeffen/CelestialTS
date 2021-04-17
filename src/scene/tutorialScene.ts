import "phaser"
import GameScene from "./gameScene"
import { StyleSettings, ColorSettings, Space } from "../settings"
import ClientState from "../lib/clientState"


// TODO When the game is over, will it return to the tutorial deck builder?

export default class TutorialScene extends GameScene {
	txtTutorial: Phaser.GameObjects.Text

	constructor() {
		super({
			key: "TutorialScene"
		})
	}

	create(): void {
		super.create()

		// Reset each explanations seen parameter
		explanations.forEach(ex => ex.seen = false)

		// Add the tutorial text
		this.txtTutorial = this.add.text(Space.pad, Space.pad*3 + Space.cardSize, '', StyleSettings.tutorial)
		this.txtTutorial.setVisible(false)
		this.txtTutorial.setInteractive()
		this.txtTutorial.on('pointerdown', function() {
			this.txtTutorial.setVisible(false)
		}, this)
	}

	displayState(state: ClientState, recap: Boolean = false): boolean {
		let isDisplayed = super.displayState(state, recap)

		// If this state isn't displayed, do nothing
		if (!isDisplayed) return false

		this.txtTutorial.setVisible(false)

		// If it's a recap, don't show an explanation
		if (recap) return true

		// Consider each explanation, display the first valid one
		let exFound = false
		explanations.forEach(ex => {
			if (!exFound && ex.isApplicable(state)) {
				exFound = true

				let s = ex.explain()
				this.txtTutorial.setText(s)
				this.txtTutorial.setVisible(true)
			}
		})

		return true
	}
}


// An explanation of a mechanic in the game
class Explanation {
	// Condition under which this explanation should be visible
	condition: (state: ClientState) => boolean
	// Whether this explanation has been seen already
	seen: boolean = false
	text: string
	
	constructor(condition: (_: ClientState) => boolean, text: string) {
		this.condition = condition
		this.text = text
	}

	// Return true if the given state should be explained and this explanation hasn't yet been seen
	isApplicable(state: ClientState): boolean {
		if (this.seen) {
			return false
		}

		return this.condition(state)
	}

	// Return this explanation's text, and set this as seen
	explain(): string {
		this.seen = true

		return this.text
	}
}

let exMulligan: Explanation = new Explanation(
	function (state) {return !state.mulligansComplete[0]},
	"Click each card you want to redraw, then click 'Mulligan'."
	)

let exPlayOrPass: Explanation = new Explanation(
	function (state) {return state.priority === 0},
	"Click a card to play it, or click 'Pass'."
	)
let exRoundStart: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 1},
	"At the start of each round, both players draw 2 cards and gain 1 mana."
	)
let exRoundPriority: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 2},
	"The player who is winning will act first in a round. If it's a tie, priority is decided randomly."
	)
let exWinCondition: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 3},
	"A player wins when they've won at least 5 rounds, and lead by at least 2."
	)
let exStacks: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 4},
	"You can mouse over or click on either player's deck or discard pile to see more information."
	)

let exRoundEnd: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.story.acts.length >= 1},
	"Once both players have passed in a row, the round ends and points are tallied."
	)
let exOpponentHidden: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.story.acts.length >= 1},
	"Unless your opponent plays a Visible card, you won't be able to see what they've played."
	)
let exDiscardShuffle: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.deck.length <= 4},
	"After your deck runs out of cards, your discard pile becomes your deck."
	)
let exMaxHand: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.hand.length === 6},
	"If you have 6 cards in hand, you can't draw any more."
	)

let explanations: Explanation[] = [
	exMulligan,
	exPlayOrPass,
	exRoundStart,
	exRoundEnd,

	exRoundPriority,
	exWinCondition,
	exStacks,

	exOpponentHidden,
	exDiscardShuffle,
	exMaxHand





]
