import "phaser";
import { collectibleCards, cardback } from "../catalog/catalog"
import Card from "../lib/card"

import { Network, versionNumber } from "../net"
import ClientState from "../lib/clientState"
import BaseScene from "./baseScene"
import { CardImage, addCardInfoToScene, cardInfo, refreshCardInfo } from "../lib/cardImage"
import { StatusBar } from "../lib/status"

// Import Settings itself 
import { Color, Style, UserSettings, Time, Space, Mechanics } from "../settings/settings"
import Recap from '../lib/recap'
import Button from '../lib/button'
import Icon from '../lib/icon'
import Menu from '../lib/menu'
import { Animation, Zone } from '../lib/animation'
// TODO Remove unused

import { OurHandRegion, TheirHandRegion, StoryRegion, OurScoreRegion, TheirScoreRegion, OurButtonsRegion, DecksRegion, DiscardPilesRegion } from "./matchRegions/matchRegions"
import Region from './matchRegions/baseRegion'


var storyHiddenLock: boolean = false

// TODO Remove status bar file
// TODO Rename to Match
export default class GameScene extends BaseScene {
	view: View
	net: Network

	// The states which are queued up and have not yet been seen, with key being their version number
	queuedStates: { [key: number]: ClientState}

	// Recap handling
	queuedRecap: ClientState[] = []
	recapPlaying: boolean // TODO Redundant with above?
	lastRecap: ClientState[]
	currentState: ClientState
	constructor (args = {key: "GameScene"}) {
		super(args)
	}

	init (params: any) {
		// Reset variables
		this.queuedStates = {}
		this.queuedRecap = []
		this.recapPlaying = false
		this.lastRecap = []
		this.currentState = undefined

		// TODO Clean this up when a pass is done
		let mmCode
		if (params.mmCode !== undefined) {
			mmCode = params.mmCode
		}
		else {
			// TODO Clean up mmCode, shouldn't use UserSettings, remove this case
			// Code to matchmake player with ('ai' if versus computer)
			mmCode = UserSettings._get('mmCode')
			if (UserSettings._get('vsAi')) {
				mmCode = 'ai'
			}

			// Tutorial should always be against ai
			if (params['isTutorial']) {
				if (params['tutorialNumber'] === 1) {
					mmCode = 'tutorial'
				} else if (params['tutorialNumber'] === 2) {
					mmCode = `ai:${params['opponentDeck']}`
				}
			}
		}

		// Connect with the server
		this.net = new Network(params.deck, this, mmCode)

		// Create the view
		this.view = new View(this)

		this.setCallbacks(this.view, this.net)
	}

	create(): void {
		// TODO Fix create / precreate, bad smell
		super.precreate()
		
		super.create()
	}

	// Listens for websocket updates
	// Manages user decisions (What card to play, when to pass)

	// Methods called by the websocket

	// Display searching for opponent if still looking
	displaySearchingStatus(searching: boolean): void {

	}

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
		// TODO Replace this with menu impl
		console.log('opp disconnected')
	}

	// Set all of the callback functions for the regions in the view
	private setCallbacks(view, net): void {
		let that = this

		// Hand region
		view.ourHand.setCallback((i: number) => {
			net.playCard(i)
		})

		view.ourButtons.setRecapCallback(() => {
			that.recapPlaying = true
			that.queuedRecap = [...that.lastRecap]
			that.queueState(that.currentState)
		})

		view.ourButtons.setPassCallback(() => {
			net.playCard(10)
		})

		view.ourButtons.setSkipCallback(() => {
			that.tweens.getAllTweens().forEach((tween) => {
				tween.complete()
			})

			// Set variables to a state where a recap isn't playing
			that.queuedRecap = []
			that.recapPlaying = false
		})
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
	private displayState(state: ClientState, isRecap: boolean): boolean {
		// If there is a new recap, queue that instead and don't show this state yet
		if (this.queueNewRecap(state)) {
			return false
		}

		// If any tweens are playing, don't display yet
		let anyTweenPlaying = this.tweens.getAllTweens().length > 0
		if (anyTweenPlaying) {
			return false
		}

		// Remember what version of the game state this is, for use when communicating with server
		this.net.setVersionNumber(state.versionNumber)

		this.view.displayState(state, isRecap)

		return true
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
}


// The View of MVC - What is presented to the user
class View {
	scene: Phaser.Scene

	ourHand: Region
	ourButtons: Region
	theirHand: Region
	story: StoryRegion
	ourScore: Region
	theirScore: Region
	decks: Region
	discardPiles: Region

	// Has the phaser objects
	// Handles layout, animation
	// Divided into regions

	constructor (scene: Phaser.Scene) {
		this.scene = scene

		let background = scene.add.image(0, 0, 'bg-Match').setOrigin(0).setDepth(-1)

		// Create each of the regions
		// this.createOurHand()
		// new HandRegion()//.create(scene)
		this.ourHand = new OurHandRegion().create(scene)
		this.theirHand = new TheirHandRegion().create(scene)

		this.story = new StoryRegion().create(scene)
		this.ourScore = new OurScoreRegion().create(scene)
		this.theirScore = new TheirScoreRegion().create(scene)
		this.ourButtons = new OurButtonsRegion().create(scene)

		this.decks = new DecksRegion().create(scene)
		this.discardPiles = new DiscardPilesRegion().create(scene)
	}

	displayState(state: ClientState, isRecap: boolean) {
		this.ourHand.displayState(state, isRecap)
		this.theirHand.displayState(state, isRecap)
		this.story.displayState(state, isRecap)
		this.ourScore.displayState(state, isRecap)
		this.theirScore.displayState(state, isRecap)
		this.ourButtons.displayState(state, isRecap)
		this.decks.displayState(state, isRecap)
		this.discardPiles.displayState(state, isRecap)

		// Play whatever sound this new state brings
		if (state.soundEffect !== null) {
			this.scene.sound.play(state.soundEffect)
		}
	}
}

