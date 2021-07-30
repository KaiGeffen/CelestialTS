import "phaser"
import GameScene from "./gameScene"
import { StyleSettings, ColorSettings, Space, UserSettings, TutorialBBConfig } from "../settings"
import ClientState from "../lib/clientState"
import { setSimplifyCardInfo } from "../lib/card"
import Button from "../lib/button"


class TutorialScene extends GameScene {
	txtTutorial:  any //Phaser.GameObjects.Text Is a rexUI TextBox
	explanations: Explanation[]

	init(params: any): void {
		super.init(params)
		this.explanations = params['explanations']
	}

	create(): void {
		super.create()

		// Reset each explanations seen parameter
		this.explanations.forEach(ex => ex.seen = false)

		// Add the tutorial text
		this.txtTutorial = this['rexUI'].add['textBox']({
			x: Space.pad,
			y: Space.pad * 2,
			text: this.add['rexBBCodeText'](0, 0, '', TutorialBBConfig)
		}).setOrigin(0)
		
			// Space.windowWidth/2, Space.windowHeight/2, 800, 200, 30, ColorSettings.menuBackground).setAlpha(0.95)
	}

	displayState(state: ClientState, recap: Boolean = false): boolean {
		let isDisplayed = super.displayState(state, recap)

		// If this state isn't displayed, do nothing
		if (!isDisplayed) return false

		// If it's a recap, don't show an explanation
		if (recap) return true

		// Consider each explanation, display the first valid one, let it alter the game scene
		let exFound = false
		this.explanations.forEach(ex => {
			if (!exFound && ex.isApplicable(state)) {
				exFound = true

				ex.alterScene(this)

				let s = ex.explain()
				this.txtTutorial.start('[stroke=black]' + s + '[/stroke]', 15)
			}
		})

		return true
	}
}


// The first tutorial has cards with simplified text/rules, and hides stacks until the player has nearly won
export class TutorialScene1 extends TutorialScene {
	constructor() {
		super({
			key: "TutorialScene1"
		})
	}

	init(params: any): void {
		params['explanations'] = explanations1
		super.init(params)
	}

	create(): void {
		super.create()

		// Hide any container that are hidden in the tutorial
		this.mulliganContainer.setVisible(false)
		this.stackContainer.setVisible(false)

		this.btnRecap.setVisible(false)
	}

	// Method called before exiting this scene
	beforeExit(): void {
		// Make sure that card text isn't the simplified version elsewhere
		setSimplifyCardInfo(false)
		super.beforeExit()
	}

	// Display what the user sees when they win or lose
	displayWinLose(state: ClientState): void {
		if (state.winner === 0) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You won!\n\nClick here to continue...", this.onWin).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)
			
			this.storyContainer.add(btnResult)
		}
		else if (state.winner === 1) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You lost!\n\nClick here to retry...", this.onRetry).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)

			this.storyContainer.add(btnResult)
		}
	}

	onWin(): void {
  		this.net.closeSocket()
  		
  		// Add this tutorial (Basics) to the list of completed tutorials
  		UserSettings._push('completedTutorials', 'Basics')

  		this.scene.start("AnubisCatalogScene")  		
  	}

  	private onRetry(): void {
  		this.net.closeSocket()
    	this.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})
  	}

  	// NOTE This is called by btnCancel in GameScene
	exitScene(): void {
  		this.net.closeSocket()
  		this.scene.start("WelcomeScene")
  	}
}


// These tutorials are matchs against ai, with additional explanations
export class TutorialScene2 extends TutorialScene {
	tutorialName: string

	constructor() {
		super({
			key: "TutorialScene2"
		})
	}

	init(params: any): void {
		console.log(params)
		params['explanations'] = explanations2
		this.tutorialName = params['tutorialName']
		super.init(params)
	}

	// Display what the user sees when they win or lose
	displayWinLose(state: ClientState): void {
		if (state.winner === 0) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You won!\n\nClick here to continue...", this.onWin).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)
			
			this.storyContainer.add(btnResult)
		}
		else if (state.winner === 1) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You lost!\n\nClick here to retry...", this.onRetry).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)

			this.storyContainer.add(btnResult)
		}
	}

	private onWin(): void {
  		this.net.closeSocket()

  		// Only show tutorial complete message the first time player beats Anubis
  		let showTutorialCompleteMsg = this.tutorialName === 'Anubis' && !UserSettings._get('completedTutorials').includes('Anubis')

  		// Add this tutorial to the list of completed tutorials
  		UserSettings._push('completedTutorials', this.tutorialName)

  		
  		this.scene.start("WelcomeScene", {tutorialComplete: showTutorialCompleteMsg})
  	}

  	private onRetry(): void {
  		this.net.closeSocket()
  		this.scene.start("BuilderScene", {isTutorial: true})
  	}
}






// An explanation of a mechanic in the game
class Explanation {
	// Condition under which this explanation should be visible
	condition: (state: ClientState) => boolean
	// Whether this explanation has been seen already
	seen: boolean = false
	text: string

	// How the scene is affected after this explanation has been seen
	effect: (scene: TutorialScene) => void
	
	constructor(condition: (_: ClientState) => boolean,
		text: string,
		effect: (scene: TutorialScene) => void = function() {})
	{
		this.condition = condition
		this.text = text

		this.effect = effect
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

	// Change the game scene to reflect something that is being explained
	alterScene(that: TutorialScene): void {
		this.effect(that)
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







let exPlay: Explanation = new Explanation(
	function (state) {return state.priority === 0},
	"Click on a card in your hand to play it.\nYou must also spend mana equal to its mana cost.",
	function (scene) {
		scene.txtMana.setX((Space.pad + Space.cardSize) * 3)

		// Make it so that user can't pass yet
		scene.btnPass.setVisible(false)

		// Simplify all of the card text
		setSimplifyCardInfo(true)
	}
	)
let exPass: Explanation = new Explanation(
	function (state) {return state.priority === 0},
	"Click 'Pass' once you're done playing cards.\
	Once both players have passed in a row, the round ends and points are tallied.",
	function (scene) {
		// Mana text moves to its normal position
		scene.tweens.add({
			targets: scene.txtMana,
          	x: Space.windowWidth - Space.pad,
          	duration: 2000,
          ease: "Sine.easeInOut",
        })

        scene.btnPass.setVisible(true)
        // state.btnPass.setX((Space.pad + Space.cardSize) * 3)
	}
	)




let exRoundStart: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 1},
	"At the start of each round, each player draws 2 cards, their maximum mana goes up by 1, and their mana refills."
	)



let exWin: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] > 0},
	"If you score more points than your opponent in a round, you win that round."
	)
let exWinCondition: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] > 0},
	"Once you've won 5 rounds, you win the match. However, you must also be at least 2 wins ahead of your opponent."
	)
	



let exRoundPriority: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 2},
	"The player who is winning will act first in a round. If it's a tie, priority is decided at random."
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
let exGift: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 3},
	"Try not to play cards like Gift when your hand is nearly full."
	)



let exCardEffects: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2},
	"Each card has an effect listed after its point value. Any keywords are explained below that.",
	function(scene) {setSimplifyCardInfo(false)}
	)
let exDash: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2},
	"It's better to play a card like Dash early in a round, so it's worth the most points."
	)

let exStacks: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4},
	"You draw cards from your deck, and after they resolve they go to your discard pile.",
	function (scene) {scene.stackContainer.setVisible(true)}
	)

let exDiscardShuffle: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4},
	"If you would draw from an empty deck, your discard pile is shuffled into your deck."
	)





let explanations1: Explanation[] = [
	exPlay,
	exPass,

	exRoundStart,
	exOpponentHidden,

	exWin,
	exWinCondition,

	exCardEffects,
	exDash,

	exMaxHand,
	exGift,

	exStacks,
	exDiscardShuffle

	
]



let explanations2: Explanation[] = [
	exMulligan,

	exPlayOrPass,
	exRoundEnd,

	exRoundStart,
	exOpponentHidden,

	exRoundPriority,
	exWinCondition,

	exMaxHand,

	exDiscardShuffle
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
