import "phaser"
import GameScene from "./gameScene"
import { Style, BBStyle, Color, Space, UserSettings, Time } from "../settings/settings"
import ClientState from "../lib/clientState"
import { setSimplifyCardInfo, getSimplifyCardInfo } from "../lib/card"
import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"
import MessageManager from "../lib/message"
import { cardback } from "../catalog/catalog"


// TODO The text speed setting doesn't get used here

class TutorialScene extends GameScene {
	txtTutorial:  any // Is a rexUI TextBox
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
			y: Space.pad,
			text: this.add['rexBBCodeText'](0, 0, '', BBStyle.tutorial)
		}).setOrigin(0)
		.setVisible(false)
		.setInteractive()
		.on('pointerdown', this.doClickTutorialText, this)
	}

	displayState(state: ClientState, recap: boolean = false): boolean {
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

				let s = ex.explain()
				this.txtTutorial.start('[stroke=black]' + s + '[/stroke]', Time.textSpeed())
				this.txtTutorial.setVisible(true)

				ex.alterScene(this)
			}
		})

		return true
	}

	// Display what the user sees when they win or lose
	displayWinLose(state: ClientState): void {
		let menu
		if (state.winner !== null) {
			menu = new Menu(
		      this,
		      Space.maxHeight,
		      Space.maxHeight,
		      true,
		      25)

			// Replace the pass button with an exit button
			this.btnPass.setVisible(false)
			this.btnExit.setVisible(true)

			// Remove the ordinary exit events
			this.btnExit.removeAllListeners('pointerdown')
		}

		let width = Space.maxHeight - 250
		if (state.winner === 0) {
			// Do anything that happens when you win
			this.onWin()

			this.btnExit.setOnClick(this.onWinExit())

			let txtTitle = this.add.text(0, -(width/2 + 50), 'Victory!', Style.announcement).setOrigin(0.5, 1)
			menu.add(txtTitle)

			let bgDefeat = this.add.image(0, -50, 'bg-Victory')
			menu.add(bgDefeat)

			let y = width/2 + 50
			new Icon(this, menu, -Space.iconSeparation, y, 'Exit', this.onWinExit())
			new Icon(this, menu, 0, y, 'Retry', this.onRetry())
			new Icon(this, menu, Space.iconSeparation, y, 'Review', () => menu.close())
		}
		else if (state.winner === 1) {
			this.btnExit.setOnClick(this.onRetry())

			let txtTitle = this.add.text(0, -(width/2 + 50), 'Defeat!', Style.announcement).setOrigin(0.5, 1)
			menu.add(txtTitle)

			let bgDefeat = this.add.image(0, -50, 'bg-Defeat')
			menu.add(bgDefeat)

			let y = width/2 + 50
			new Icon(this, menu, -Space.iconSeparation, y, 'Exit', this.exitScene())
			new Icon(this, menu, 0, y, 'Retry', this.onRetry())
			new Icon(this, menu, Space.iconSeparation, y, 'Review', () => menu.close())
		}
	}

	// Implemented in specific tutorials below
	onWin(): void {}
	onWinExit(): () => void {return function() {}}
	onRetry(): () => void {return function() {}}
	exitScene(): () => void {return function() {}}

	// Called when the tutorial text is clicked on
	// Skips it to the end if it's animating, or makes it invisible if not
	private doClickTutorialText(): void {
		let txt = this.txtTutorial

		if (txt.isTyping) {
			txt.stop(true)

		} else {
			txt.setVisible(false)
		}
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

	queueState(state: ClientState): void {
		// While cards are simplified, don't display any visible cards the opponent plays to story
		if (getSimplifyCardInfo()) {
			state.story.acts.forEach((act) => {
				if (act.owner === 1) {
					act.card = cardback
				}
			})
		}


		super.queueState(state)
	}

	create(): void {
		super.create()

		// Hide any container that are hidden in the tutorial
		this.mulliganContainer.setVisible(false)
		this.stackContainer.setVisible(false)

		this.btnRecap.setAlpha(0)
		this.btnSkip.setAlpha(0)
	}

	// Method called before exiting this scene
	beforeExit(): void {
		// Make sure that card text isn't the simplified version elsewhere
		setSimplifyCardInfo(false)
		super.beforeExit()
	}

	onWin(): void {
		this.net.closeSocket()
  		
  		// If user just completed the Basics tutorial for the first time, signal that more tutorial content is now available
  		if (!UserSettings._get('completedTutorials').includes('Basics')) {
  			UserSettings._set('newTutorial', true)
  		}

  		// Add this tutorial (Basics) to the list of completed tutorials
  		UserSettings._push('completedTutorials', 'Basics')
  	}

  	onWinExit(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()
	  		that.scene.start('AnubisCatalogScene')
  		}
  	}

  	onRetry(): () => void {
  		let that = this

  		return function() {
  			that.net.closeSocket()
    		that.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})
  		}
  	}

  	// NOTE This is called by btnCancel in GameScene
	exitScene(): () => void {
		let that = this

		return function() {
			that.beforeExit()
  			that.scene.start("WelcomeScene")
		}
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
		params['explanations'] = explanations2
		this.tutorialName = params['tutorialName']
		super.init(params)
	}

  	onWin(): void {
  		this.net.closeSocket()

		MessageManager.addUnreadMessage('tutorialComplete')

  		// Add this tutorial to the list of completed tutorials
  		UserSettings._push('completedTutorials', this.tutorialName)

  		// If all the core challenges have been completed, expansion is unlocked
		let completed = UserSettings._get('completedTutorials')
		let expansionUnlocked = completed.includes('Anubis') && completed.includes('Robots') && completed.includes('Stalker')
		if (expansionUnlocked) {
			MessageManager.addUnreadMessage('coreChallengesComplete')
		}
  	}

  	onWinExit(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()
	  		that.scene.start("WelcomeScene")
  		}
  	}

  	onRetry(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()
  			that.scene.start("TutorialBuilderScene")
  		}
  	}

  	// NOTE This is called by btnCancel in GameScene
	exitScene(): () => void {
		let that = this

		return function() {
			that.beforeExit()
  			that.scene.start("WelcomeScene")
		}
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
	`Click on each card you don't want in your starting hand, then click [color=${Color.buttonReference}]Mulligan[/color] to replace those cards with new ones.`
	)

// TODO This is kinda hacky, don't keep long-term
let exMulliganOver: Explanation = new Explanation(
	function (state) {return state.mulligansComplete[0]},
	"",
	function (scene: TutorialScene) {scene.txtTutorial.setAlpha(0)}
	)

let exPlayOrPass: Explanation = new Explanation(
	function (state) {return state.priority === 0},
	`Click on a card in your hand to play it, or click [color=${Color.buttonReference}]Pass[/color].`
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
`Click [color=${Color.buttonReference}]Pass[/color] once you're done playing cards.
Once both players have passed in a row, the round ends and points are tallied.`,
	function (scene) {
		// Mana text moves to its normal position
		scene.tweens.add({
			targets: scene.txtMana,
          	x: Space.windowWidth - Space.pad,
          	duration: 1200,
          	ease: "Sine.easeInOut",
          	onComplete: function () {
          		let btn = scene.btnPass

          		btn.setVisible(true)
          		btn.glowUntilClicked()
          	}
        })

        // scene.btnPass.setVisible(true)
        // state.btnPass.setX((Space.pad + Space.cardSize) * 3)
	}
	)




let exRoundStart: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.maxMana[0] > 1},
	"At the start of each round, each player draws 2 cards, their maximum mana goes up by 1, and their mana refills.",
	function(scene) {
		// Make the Recap/Skip button visible
		scene.btnRecap.setAlpha(1)
		scene.btnSkip.setAlpha(1)

		let width = 800
		let height = 450
		let menu = new Menu(scene, width, height, true, 10)

		// Pause the tutorial text until the menu is closed
		scene.txtTutorial.setVisible(false).pause()
		menu.setOnClose(() => {scene.txtTutorial.setVisible(true).resume()})

		let s = 
`[stroke=black]When a round ends, the story resolves
from left to right. Each player gains
points from the cards they played.

That round was tied at 1 point each,
so neither player earned a win.

To see what happened again, click the
[color=${Color.buttonReference}]Recap[/color] button above [color=${Color.buttonReference}]Pass[/color].[/stroke]`
		let txt = scene.add['rexBBCodeText'](0, 0, s, Style.basic).setOrigin(0.5)
		menu.add(txt)
	}
	)



let exWin: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] > 0},
	"If you score more points than your opponent in a round, you win that round."
	)
let exWinCondition: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] > 0 && state.story.acts.length >= 2},
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
	function (state) {return state.priority === 0 && state.story.acts.length >= 1 && state.story.acts.length >= 2},
	"Cards your opponent plays are hidden until the round is over."
	)

let exMaxHand: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 3},
	"If you have 6 cards in hand, you can't draw any more."
	)
let exGift: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 3 && state.story.acts.length >= 2},
	`Try not to play cards like [color=${Color.cardReference}]Gift[/color] when your hand is nearly full.`
	)



let exCardEffects: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2},
	"Each card has an effect listed after its point value. Any keywords are explained below that.",
	function(scene) {
		setSimplifyCardInfo(false)

		let width = 800
		let height = 400
		let menu = new Menu(scene, width, height, true, 10)

		// Pause the tutorial text until the menu is closed
		scene.txtTutorial.setVisible(false).pause()
		menu.setOnClose(() => {scene.txtTutorial.setVisible(true).resume()})

		let s = 
`[stroke=black]Wait! In addition to a cost and point value,
each card has an additional effect.

[color=${Color.cardReference}]Doves[/color] are visible to your opponent while
in the story, and disappear once played.

[color=${Color.cardReference}]Dash[/color] is worth 1 point less for every card
played before it in the story.[/stroke]`
		let txt = scene.add['rexBBCodeText'](0, 0, s, Style.basic).setOrigin(0.5)
		menu.add(txt)
	}
	)
let exDash: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 2 && state.story.acts.length >= 2},
	`It's better to play a card like [color=${Color.cardReference}]Dash[/color] early in a round, so that it's worth the most points.`
	)

let exStacks: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4},
	"You draw cards from your deck, and after they resolve they go to your discard pile.",
	function (scene) {scene.stackContainer.setVisible(true)}
	)

let exDiscardShuffle: Explanation = new Explanation(
	function (state) {return state.priority === 0 && state.wins[0] >= 4 && state.story.acts.length >= 2},
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
	exMulliganOver

	// exPlayOrPass,
	// exRoundEnd,

	// exRoundStart,
	// exOpponentHidden,

	// exRoundPriority,
	// exWinCondition,

	// exMaxHand,

	// exDiscardShuffle
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
