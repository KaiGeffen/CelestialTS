import "phaser";
import ClientState from "../lib/clientState";
import { Network, versionNumber } from "../net";
// Import Settings itself 
import { UserSettings } from "../settings/settings";
import BaseScene from "./baseScene";
import Region from './matchRegions/baseRegion';
// TODO Remove unused
import Regions from "./matchRegions/matchRegions"

import Animator from './matchRegions/animator'



var storyHiddenLock: boolean = false

// TODO Remove status bar file
// TODO Rename to Match
class GameScene extends BaseScene {
	params: any

	view: View
	net: Network

	// The states which are queued up and have not yet been seen, with key being their version number
	queuedStates: { [key: number]: ClientState}

	// Recap handling
	queuedRecap: ClientState[] = []
	recapPlaying: boolean // TODO Redundant with above?
	lastRecap: ClientState[]
	currentState: ClientState

	init (params: any) {
		this.params = params
		// Reset variables
		this.queuedStates = {}
		this.queuedRecap = []
		this.recapPlaying = false
		this.lastRecap = []
		this.currentState = undefined

		// TODO Clean this up when a pass is done
		let mmCode = ''
		if (params.mmCode !== undefined) {
			mmCode = params.mmCode
		}

		// Connect with the server
		this.net = new Network(params.deck, this, mmCode, params.avatar)

		// Create the view
		this.view = new View(this, this.params.avatar || 0)

		this.setCallbacks(this.view, this.net)
	}

	beforeExit() {
		this.net.exitMatch()
	}

	// Listens for websocket updates
	// Manages user decisions (What card to play, when to pass)

	// Methods called by the websocket

	// Queue up the given state, to be displayed when correct to do so
	queueState(state: ClientState): void {
		// If a state with this version isn't in the queued states, add it
		if (!(state.versionNumber in this.queuedStates)) {
			this.queuedStates[state.versionNumber] = state
		}
	}

	// Queue up the given recap, which is each state seen as the story resolves
	private queueRecap(stateList: ClientState[]): void {
		this.recapPlaying = true
		this.queuedRecap = stateList
		this.lastRecap = [...stateList]
	}

	signalDC(): void {
		this.scene.launch('MenuScene', {
			menu: 'disconnect',
			activeScene: this,
		})
	}

	// Set all of the callback functions for the regions in the view
	private setCallbacks(view, net: Network): void {
		let that = this

		// Hand region
		view.ourHand.setCallback((i: number) => {
			net.playCard(i)
		})
		view.ourHand.setDisplayCostCallback((cost: number) => {
			that.view.ourScore.displayCost(cost)
		})

		// TODO This all has a bad smell
		view.ourHand.btnDeck.setOnClick(() => {
			that.hint.hide()
			that.view.ourDeckOverlay.show()
		})
		view.ourHand.btnDiscard.setOnClick(() => {
			that.hint.hide()
			that.view.ourDiscardOverlay.show()
		})

		view.theirHand.btnDeck.setOnClick(() => {
			that.hint.hide()
			that.view.theirDeckOverlay.show()
		})
		view.theirHand.btnDiscard.setOnClick(() => {
			that.hint.hide()
			that.view.theirDiscardOverlay.show()
		})

		// Buttons TODO Rework these
		// view.ourButtons.setRecapCallback(() => {
		// 	that.recapPlaying = true
		// 	that.queuedRecap = [...that.lastRecap]
		// 	that.queueState(that.currentState)
		// })

		// view.ourButtons.setPassCallback(() => {
		// 	net.playCard(10)
		// })

		// view.ourButtons.setSkipCallback(() => {
		// 	that.tweens.getAllTweens().forEach((tween) => {
		// 		tween.complete()
		// 	})

		// 	// Set variables to a state where a recap isn't playing
		// 	that.queuedRecap = []
		// 	that.recapPlaying = false
		// 	that.view.paused = false
		// })
		// view.ourButtons.setPlayCallback(() => {that.view.paused = false})
		// view.ourButtons.setPauseCallback(() => {that.view.paused = true})

		// Story
		view.story.setCallback((i: number) => {
			return function() {
				// Get the series of states for this recap starting from the given index
				let recap = that.lastRecap.slice(i + 1)

				// Set that a recap is playing, queue the correct recap
				that.recapPlaying = true
				that.queuedRecap = recap

				// To correctly display point changes, set the current scores to the last recaps totals
				// that.lastScore = that.lastRecap[i].score TODO

				// Skip all tweens playing currently
				// TODO Some text stays enlarged if it doesn't finish
				that.tweens.getAllTweens().forEach((tween) => {
					tween.complete()
				})
			}
		})

		// Pass button
		view.pass.setCallback(() => {
			net.playCard(10)
		})
		view.pass.setShowResultsCallback(() => {
			that.view.results.show()
		})
		view.pass.recapCallback = () => {
			that.recapPlaying = true
			that.queuedRecap = [...that.lastRecap]
			that.queueState(that.currentState)
		}

		// Piles (Show overlay when clicked)
		view.decks.setCallback(() => {
			that.view.ourDeckOverlay.show()
		},
		() => {
			that.view.theirDeckOverlay.show()
		})
		
		view.discardPiles.setCallback(() => {
			that.view.ourDiscardOverlay.show()
		}, 
		() => {
			that.view.theirDiscardOverlay.show()
		}
		)

		// Mulligan
		view.mulligan.setCallback(() => {
			let s = ''
			view.mulligan.mulliganChoices.forEach(choice => {
				s += choice ? '1' : '0'
			})

			net.doMulligan(s)
		})

		// Results
		// TODO
	}

	// Try to display the next queued state TODO Recovery if we've been waiting too long
	update(time, delta): void {
		// Play the recap if one is queued
		if (this.queuedRecap.length > 0) {
			if (this.displayState(this.queuedRecap[0], true)) {
				this.queuedRecap.shift()

				if (this.queuedRecap.length === 0) {
					this.recapPlaying = false
				}
			}

			return
		}

		// Otherwise, show a non-recap state, as determined by its version number
		let nextVersionNumber = versionNumber + 1

		// When a recap replay finishes, return to the current state
		if (this.currentState !== undefined) {
			nextVersionNumber = Math.max(this.currentState.versionNumber, nextVersionNumber)
		}

		if (nextVersionNumber in this.queuedStates) {
			let isDisplayed = this.displayState(this.queuedStates[nextVersionNumber], false)

			// If the state was just shown, delete it
			if (isDisplayed) {
				this.currentState = this.queuedStates[nextVersionNumber]
				delete this.queuedStates[nextVersionNumber]
			}
		}
	}

	// Display the given game state, returns false if the state isn't shown immediately
	protected displayState(state: ClientState, isRecap: boolean): boolean {
		// If there is a new recap, queue that instead and don't show this state yet
		if (this.queueNewRecap(state)) {
			return false
		}

		// If any tweens are playing, don't display yet
		let anyTweenPlaying = this.tweens.getAllTweens().length > 0
		if (anyTweenPlaying) {
			return false
		}

		if (this.view.paused) {
			// return false
			// TODO Decide if this feature will be supported
		}

		// Remember what version of the game state this is, for use when communicating with server
		this.net.setVersionNumber(state.versionNumber)

		this.view.displayState(state, isRecap)

		// Autopass
		if (this.shouldPass(state, isRecap)) {
			this.net.passTurn()
		}

		// State was displayed
		return true
	}

	// Return if the user should pass automatically, based on the game state and their settings
	private shouldPass(state: ClientState, isRecap: boolean): boolean {
		// Don't pass if mulligans aren't complete
		if (state.mulligansComplete.includes(false)) {
			return false
		}

		// Don't pass during a recap
		if (isRecap) {
			return false
		}

		// Don't pass when we don't have priority
		if (state.priority !== 0) {
			return false
		}

		// Pass if we have no cards to play
		let haveNoCards = state.hand.length === 0
		if (haveNoCards) {
			return true
		}

		// If autopass is off, don't pass
		if (!UserSettings._get('autopass')) {
			return false
		}
		// Otherwise, pass only if we have no playable cards
		else {
			let havePlayableCards = state.cardsPlayable.includes(true)
			return !havePlayableCards
		}
	}

	// Queue up this scene's yet-unseen recap, return false if there is none
	private queueNewRecap(state: ClientState): boolean {
		// If a round just ended, we might have a recap to queue up
		const isRoundStart = state.story.acts.length === 0 && state.passes === 0
		const numberStates = state.recap.stateList.length
		if (isRoundStart && numberStates > 0) {
			// Queue the recap to play
			this.queueRecap(state.recap.stateList)

			// Remove the recap from this state (So it won't be added again)
			state.recap.stateList = []

			// Add this state to the queue
			this.queueState(state)

			// Return true, that a recap was queued
			return true
		}

		return false
	}

	// Display a given breath cost
}


// The View of MVC - What is presented to the user
export class View {
	scene: BaseScene

	// Whether the recap is playing or is paused
	paused: boolean

	searching: Region

	ourHand: Region
	// ourButtons: Region
	theirHand: Region
	story: Region
	ourScore
	theirScore: Region
	decks: Region
	discardPiles: Region
	pass: Region
	scores: Region

	ourDeckOverlay: Region
	theirDeckOverlay: Region
	ourDiscardOverlay: Region
	theirDiscardOverlay: Region

	// Region shown during mulligan phase
	mulligan: Region

	// Region shown when the game has been won / lost
	results: Region

	// Class that animates everything that is animated
	animator: Animator

	constructor (scene: BaseScene, avatarId: number) {
		this.scene = scene

		let background = scene.add.image(0, 0, 'bg-Match').setOrigin(0).setDepth(-1)

		this.searching = new Regions.Searching().create(scene, avatarId)

		// Create each of the regions
		// this.createOurHand()
		// new HandRegion()//.create(scene)
		this.ourHand = new Regions.OurHand().create(scene, avatarId)
		this.theirHand = new Regions.TheirHand().create(scene)

		this.story = new Regions.Story().create(scene)
		this.ourScore = new Regions.OurScore().create(scene)
		this.theirScore = new Regions.TheirScore().create(scene)
		// this.ourButtons = new Regions.OurButtons().create(scene)

		this.decks = new Regions.Decks().create(scene)
		this.discardPiles = new Regions.DiscardPiles().create(scene)
		this.pass = new Regions.Pass().create(scene)
		this.scores = new Regions.Scores().create(scene)

		this.ourDeckOverlay = new Regions.OurDeck().create(scene)
		this.theirDeckOverlay = new Regions.TheirDeck().create(scene)
		this.ourDiscardOverlay = new Regions.OurDiscard().create(scene)
		this.theirDiscardOverlay = new Regions.TheirDiscard().create(scene)

		// These regions are only visible during certain times
		this.mulligan = new Regions.Mulligan().create(scene)

		// Results are visible after the game is over
		this.results = new Regions.Results().create(scene)
		this.results.hide()

		this.animator = new Animator(scene, this)
	}

	displayState(state: ClientState, isRecap: boolean) {
		this.searching.hide()

		this.mulligan.displayState(state, isRecap)
		
		this.ourHand.displayState(state, isRecap)
		this.theirHand.displayState(state, isRecap)
		this.story.displayState(state, isRecap)
		this.ourScore.displayState(state, isRecap)
		this.theirScore.displayState(state, isRecap)
		// this.ourButtons.displayState(state, isRecap)
		this.decks.displayState(state, isRecap)
		this.discardPiles.displayState(state, isRecap)
		this.pass.displayState(state, isRecap)
		this.scores.displayState(state, isRecap)

		this.ourDeckOverlay.displayState(state, isRecap)
		this.theirDeckOverlay.displayState(state, isRecap)
		this.ourDiscardOverlay.displayState(state, isRecap)
		this.theirDiscardOverlay.displayState(state, isRecap)

		this.results.displayState(state, isRecap)

		// Animate the state
		this.animator.animate(state, isRecap)

		// Play whatever sound this new state brings
		if (state.soundEffect !== null) {
			this.scene.sound.play(state.soundEffect)
		}
	}
}

export class StandardGameScene extends GameScene {
	constructor (args = {key: 'StandardGameScene', lastScene: 'BuilderScene'}) {
		super(args)
	}
}

export class AdventureGameScene extends GameScene {
	winSeen: boolean

	constructor (args = {key: 'AdventureGameScene', lastScene: 'AdventureScene'}) {
		super(args)
	}

	create() {
		super.create()
		
		// Must be reset each time it this scene is run
		this.winSeen = false
	}

	// When the player wins for the first time, unlock appropriately
	queueState(state: ClientState): void {
		if (!this.winSeen && state.winner === 0) {
			console.log('here')
			this.winSeen = true
			this.unlockMissionRewards()
		}
		super.queueState(state)
	}

	private unlockMissionRewards(): void {
		console.log(this.params)
		// Set that user has completed the missions with this id
		if (this.params.missionID !== undefined) {
			UserSettings._setIndex(
				'completedMissions',
				this.params.missionID,
				true)
		}
	}
}

export class TutorialGameScene extends AdventureGameScene {
	constructor (args = {key: 'TutorialGameScene', lastScene: 'AdventureScene'}) {
		super(args)
	}

	// TODO Ensure that autopass is on
	// TODO Hide the counts for deck and discard pile
	protected displayState(state: ClientState, isRecap: boolean): boolean {
		let result = super.displayState(state, isRecap)

		switch (this.params.missionID) {
			case 3:
				this.view.decks.hide()
				this.view.discardPiles.hide()
				this.view.pass.hide()
				// Display hints based on what round it is (TODO this in json)
				switch(state.versionNumber) {
					case 0:
						this.view.ourHand.focus("This is your hand. Each card costs some amount of breath to play (Top number) and gives you an amount of points when it resolves (Bottom number).\nCards are played to the story that we build together, and at night that story resolves, granting whoever contributed more points the win.\nWhen a player gets to 5 wins, that player wins the game.")
						// this.view.ourHand.focus("Spend breath to play cards from your hand to the story.\nOnce we're both done, night falls and the story is performed.")
						break
					case 2:
						this.view.ourHand.focus("This round we each played a Dove, which is worth 1 point. So the first night is a tie and neither player earns a win.")
						break
					case 4:
						this.view.ourHand.focus("A new day begins, we each have 1 more breath than yesterday.\nThis time you have enough to play Dash.")
						break
				}
				// TODO
				break
			case 6:
				this.view.decks.hide()
				this.view.discardPiles.hide()

				if (isRecap || state.maxMana[0] === 1 || (state.maxMana[0] === 2 && state.isRoundStart())) {
					// Can't pass on the first round or before playing a card on round 2
					this.view.pass.hide()
				}

				// Display hints based on what round it is (TODO this in json)
				let hints = {
					1: "Playing a card with Inspire will give you extra Breath next round.",
					2: "Extra breath won't help you next round. It's better to save Stars for a better time.",
					3: "Getting extra Breath is great, but the 1 point from Dove can't possibly win you this round...",
					4: "Uprising is worth 1 more point for every card before it. Try to play it as late as possible.",
					5: "You're a natural! Just 1 more win and I'll let you pass.",
				}
				
				const hint = isRecap ? undefined : hints[state.maxMana[0]]
				if (hint !== undefined && state.isRoundStart() && !isRecap) {
					this.view.ourHand.focus(hints[state.maxMana[0]])
				}
				
				break
			case 9:
				// TODO
		}
		
		return result
	}
}

