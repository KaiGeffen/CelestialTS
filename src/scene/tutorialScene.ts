import "phaser"
import GameScene from "./gameScene"
import { StyleSettings, ColorSettings, Space } from "../settings"
import ClientState from "../lib/clientState"
import { setSimplifyCardInfo } from "../lib/cardImage"


export default class TutorialScene extends GameScene {
	txtTutorial: Phaser.GameObjects.Text

	constructor() {
		super({
			key: "TutorialScene"
		})
	}

	create(): void {
		super.create()

		// Hide any container that are hidden in the tutorial
		this.mulliganContainer.setVisible(false)
		this.stackContainer.setVisible(false)

		this.btnRecap.setVisible(false)

		// Simplify all of the card text
		setSimplifyCardInfo(true)

		// Reset each explanations seen parameter
		explanations.forEach(ex => ex.seen = false)

		// Add the tutorial text
		let y = Space.pad*2 // Space.pad*3 + Space.cardSize
		this.txtTutorial = this.add.text(Space.pad, y, '', StyleSettings.tutorial)
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

		// If player has won 2 rounds, cards now have effects and the card info should reflect that
		if (state.wins[0] >= 2) {
			setSimplifyCardInfo(false)
		}
		// If the player has won 4 rounds, display the decks and discard piles
		if (state.wins[0] >= 4) {
			this.stackContainer.setVisible(true)
		}

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

	// Method called before exiting this scene
	beforeExit(): void {
		// Make sure that card text isn't the simplified version elsewhere
		setSimplifyCardInfo(false)
		super.beforeExit()
	}

	exitScene(): void {
  		this.net.closeSocket()
  		this.scene.start("WelcomeScene")
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
	"Click on each card you don't want in your starting hand, then click 'Mulligan' to replace those cards with new ones."
	)

let exPlayOrPass: Explanation = new Explanation(
	function (state) {return state.priority === 0},
	"Click on a card in your hand to play it, or click 'Pass'."
	)
let exRoundStart: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 1},
	"At the start of each round, both players draw 2 cards and gain 1 mana."
	)
let exRoundPriority: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 2},
	"The player who is winning will act first in a round. If it's a tie, priority is decided at random."
	)
let exWinCondition: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 3},
	"A player wins when they've won at least 5 rounds, and lead by at least 2."
	)
// let exStacks: Explanation = new Explanation(
// 	function (state) {return state.priority === 0 && state.maxMana[0] > 4},
// 	"You can mouse over or click on either player's deck or discard pile to see more information."
// 	)

let exRoundEnd: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.story.acts.length >= 1},
	"Once both players have passed in a row, the round ends and points are tallied."
	)
let exOpponentHidden: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.story.acts.length >= 1},
	"Cards your opponent plays are hidden until the round is over."
	)

let exMaxHand: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 3},
	"If you have 6 cards in hand, you can't draw any more."
	)

let exCardEffects: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2},
	"Each card has an effect listed after its point value. Any keywords are explained below that."
	)
let exDash: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2},
	"It's better to play a card like Dash early in a round, so it's worth the most points."
	)

let exStacks: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4},
	"You draw cards from your deck, and after they resolve they go to your discard pile."
	)
let exDiscardShuffle: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4},
	"If you would draw from an empty deck, your discard pile is shuffled into your deck."
	)


let explanations: Explanation[] = [
	exPlayOrPass,
	exRoundEnd,

	exRoundStart,
	exOpponentHidden,

	exCardEffects,
	exDash,

	exStacks,
	exDiscardShuffle,

	exMaxHand
]
// 	[
// 	exMulligan,
// 	exPlayOrPass,
// 	exRoundStart,
// 	exRoundEnd,

// 	exRoundPriority,
// 	exWinCondition,
// 	exStacks,

// 	exOpponentHidden,
// 	exDiscardShuffle,
// 	exMaxHand
// ]
