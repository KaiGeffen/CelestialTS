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

import { OurHandRegion, TheirHandRegion, StoryRegion, ScoreRegion, DecksRegion, DiscardPilesRegion } from "./matchRegions/matchRegions"
import Region from './matchRegions/baseRegion'


var storyHiddenLock: boolean = false


class OldGameScene extends BaseScene {
	net: Network

	// The params used to instantiate this scene
	params: any

	// Objects (CardImages and text) that will be removed before displaying a new state
	temporaryObjs: any[]

	mulliganHighlights: Phaser.GameObjects.Rectangle[]
	myHand: CardImage[]
	// Cards which were mulliganed and now await the mulligan event to shuffle back into deck
	mulliganedCards: CardImage[]
	txtOpponentMulligan: Phaser.GameObjects.Text

	btnPass: Button
	// Replaces the pass button before the story plays
	btnPlay: Button
	// Replaces the pass button after the game has ended
	btnExit: Button

	btnMulligan: Button
	
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	deckContainer: Phaser.GameObjects.Container
	discardContainer: Phaser.GameObjects.Container
	expendContainer: Phaser.GameObjects.Container
	opponentDeckContainer: Phaser.GameObjects.Container
	opponentDiscardContainer: Phaser.GameObjects.Container
	opponentExpendContainer: Phaser.GameObjects.Container

	mulliganContainer: Phaser.GameObjects.Container

	storyContainer: Phaser.GameObjects.Container
	stackContainer: Phaser.GameObjects.Container
	passContainer: Phaser.GameObjects.Container

	priorityRectangle: Phaser.GameObjects.Rectangle
	txtYourTurn: Phaser.GameObjects.Text
	txtTheirTurn: Phaser.GameObjects.Text
	
	visionRectangle: Phaser.GameObjects.Rectangle
	txtVision: Phaser.GameObjects.Text

	txtMana: Phaser.GameObjects.Text
	txtOpponentMana: Phaser.GameObjects.Text
	txtWins: Phaser.GameObjects.Text
	txtOpponentWins: Phaser.GameObjects.Text

	statusBar: StatusBar
	statusBarOpp: StatusBar

	txtPass: Phaser.GameObjects.Text
	txtOpponentPass: Phaser.GameObjects.Text

	txtDeckSize: Phaser.GameObjects.Text
	txtOpponentDeckSize: Phaser.GameObjects.Text
	txtDiscardSize: Phaser.GameObjects.Text
	txtOpponentDiscardSize: Phaser.GameObjects.Text
	
	btnRecap: Button
	btnSkip: Button

	// Information about the recap that is playing
	txtScores: Phaser.GameObjects.Text

	// The states which are queued up and have not yet been seen, with key being their version number
	queuedStates: { [key: number]: ClientState}

	// State currently displayed, used to return to after replaying a recap
	currentState: ClientState

	// The recap that will be played, each state that the game passes through in resolving the story
	queuedRecap: ClientState[]

	// The last recap that was shown
	lastRecap: ClientState[]


	constructor(args = {key: "GameScene"}) {
		super(args)
	}

	init(params: any): void {
		this.params = params

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

		// Make a list of objects that are temporary with game state
		this.temporaryObjs = []

		this.handContainer = this.add.container(0, 0).setDepth(3)
		this.opponentHandContainer = this.add.container(0, 0)
		this.deckContainer = this.add.container(0, 0).setVisible(false)
		this.discardContainer = this.add.container(0, 0).setVisible(false)
		this.expendContainer = this.add.container(0, 0).setVisible(false)
		this.opponentDiscardContainer = this.add.container(0, 0).setVisible(false)
		this.opponentDeckContainer = this.add.container(0, 0).setVisible(false)
		this.opponentExpendContainer = this.add.container(0, 0).setVisible(false)

		this.mulliganContainer = this.add.container(0, 0).setVisible(true)

		this.storyContainer = this.add.container(0, 0)
		this.stackContainer = this.add.container(0, 0)
		this.passContainer = this.add.container(Space.windowWidth - Space.pad, Space.windowHeight/2 - 40).setVisible(false)

		this.input.on('pointerdown', this.clickAnywhere(), this)

		// Defined these arguments here, so that they don't carry over between instances of Game Scene
		this.recapPlaying = false
		this.queuedStates = {}
		this.currentState = undefined
		this.queuedRecap = []
		this.lastRecap = []
	}

	create(): void {
		super.precreate()
    
		let that = this

		// Priority highlight
		let height = Space.cardSize + 2 * Space.pad
		this.priorityRectangle = this.add.rectangle(0, Space.windowHeight - height, Space.windowWidth, height, Color.priorityRectangle, 0.5).setOrigin(0, 0).setDepth(-1)
		this.txtYourTurn = this.add.text(Space.announceOffset, Space.windowHeight - 200, 'Your turn', Style.announcement).setVisible(false).setOrigin(1, 0.5)
		this.txtTheirTurn = this.add.text(Space.announceOffset, 200, 'Their turn', Style.announcement).setVisible(false).setOrigin(1, 0.5)

		// Vision highlight and text
		height = Space.cardSize + 2 * Space.stackOffset + 2 * Space.pad
		this.visionRectangle = this.add.rectangle(0, Space.windowHeight/2, Space.windowWidth, height, 0xffffff, 0.1).setOrigin(1, 0.5)
		this.txtVision = this.add.text(0, Space.windowHeight/2, '', Style.small).setOrigin(0, 0.5)
		this.storyContainer.add([this.visionRectangle, this.txtVision])

		// Mulligan highlights and button
		this.createMulliganObjects()

		// Pass button
    	this.btnPass = new Button(this, 0, 80, 'Pass', this.onPass()).setOrigin(1, 0.5)
    	this.passContainer.add(this.btnPass)
    	this.btnPlay = new Button(this, 0, 80, 'Play').setOrigin(1, 0.5).setVisible(false)
    	this.passContainer.add(this.btnPlay)
    	this.btnExit = new Button(this, 0, 80, 'Exit', this.exitScene()).setOrigin(1, 0.5).setVisible(false)
    	this.passContainer.add(this.btnExit)

	    // Mana text
	    this.txtMana = this.add.text(Space.windowWidth - Space.pad,
	    	Space.windowHeight - 30 - Space.cardSize - Space.pad * 2,
	    	'', Style.basic).setOrigin(1.0, 0.5)
	    this.txtOpponentMana = this.add.text(Space.windowWidth - Space.pad,
	    	30 + Space.cardSize + Space.pad * 2,
	    	'', Style.basic).setOrigin(1.0, 0.5)

	    this.txtWins = this.add.text(Space.windowWidth - Space.pad,
	    	Space.windowHeight - 70 - Space.cardSize - Space.pad * 2,
	    	'', Style.basic).setOrigin(1.0, 0.5)
	    this.txtOpponentWins = this.add.text(Space.windowWidth - Space.pad,
	    	70 + Space.cardSize + Space.pad * 2,
	    	'', Style.basic).setOrigin(1.0, 0.5)

	    // Status text
	    this.statusBar = new StatusBar(this, Space.windowHeight - Space.cardSize - Space.pad * 2, true)
	    this.statusBarOpp = new StatusBar(this, Space.cardSize + Space.pad * 2, false)

	    // Passing text
	    this.txtPass = this.add.text(Space.announceOffset, Space.windowHeight - 200, 'Passed', Style.announcement).setVisible(false).setOrigin(1, 0.5)
	    this.txtOpponentPass = this.add.text(Space.announceOffset, 200, 'Passed', Style.announcement).setVisible(false).setOrigin(1, 0.5)

	    // Alternate views presented when hovering over/clicking any stacks
	    // TODO Make a method that replaces each of these sections, since they are all nearly identical
	    this.txtDeckSize = this.add.text(
	    	Space.stackX + Space.cardSize/2,
	    	Space.windowHeight - Space.pad - Space.cardSize/2,
	    	'', Style.stack).setOrigin(0.5, 0.5)
	    this.txtDeckSize.setInteractive()
	    this.txtDeckSize.on('pointerover', this.hoverAlternateView(this.deckContainer, this.txtDeckSize), this)
	    let hoverExit = this.hoverAlternateViewExit(this.deckContainer, this.txtDeckSize)
	    this.txtDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDeckSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    this.txtDiscardSize = this.add.text(
	    	Space.stackX + Space.cardSize*3/2 + Space.pad,
	    	Space.windowHeight - Space.pad - Space.cardSize/2,
	    	'', Style.stack).setOrigin(0.5, 0.5)
	    this.txtDiscardSize.setInteractive()
	    this.txtDiscardSize.on('pointerover', this.hoverAlternateView(this.discardContainer, this.txtDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.discardContainer, this.txtDiscardSize)
	    this.txtDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDiscardSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDeckSize = this.add.text(
	    	Space.stackX + Space.cardSize/2,
	    	Space.pad + Space.cardSize/2,
	    	'', Style.stack).setOrigin(0.5, 0.5)
	    this.txtOpponentDeckSize.setInteractive()
	    this.txtOpponentDeckSize.on('pointerover', this.hoverAlternateView(this.opponentDeckContainer, this.txtOpponentDeckSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDeckContainer, this.txtOpponentDeckSize)
	    this.txtOpponentDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDeckSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDiscardSize = this.add.text(
	    	Space.stackX + Space.cardSize*3/2 + Space.pad,
	    	Space.pad + Space.cardSize/2,
	    	'', Style.stack).setOrigin(0.5, 0.5)
	    this.txtOpponentDiscardSize.setInteractive()
	    this.txtOpponentDiscardSize.on('pointerover', this.hoverAlternateView(this.opponentDiscardContainer, this.txtOpponentDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDiscardContainer, this.txtOpponentDiscardSize)
	    this.txtOpponentDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDiscardSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    let stacks = [this.txtDeckSize, this.txtDiscardSize, this.txtOpponentDeckSize, this.txtOpponentDiscardSize]
	    this.stackContainer.add(stacks)

	    let txtLastShuffleExplanation = this.add.text(
	    	Space.pad, Space.windowHeight/2 - (Space.cardSize/2 + Space.pad), "Opponent's last known shuffle:", Style.basic)
	    txtLastShuffleExplanation.setOrigin(0, 1)
	    this.opponentDeckContainer.add(txtLastShuffleExplanation)

	    // Scores text for recap states, same as below text but viewed when recalling recap states
	    this.txtScores = this.add.text(
	    	Space.scoresOffset, Space.windowHeight/2,
	    	'', Style.announcement).setOrigin(0.5, 0.5)
	    this.storyContainer.add(this.txtScores)

	    // Recap button - click to watch the last recap
	    this.btnRecap = new Button(this, 0, 0, 'Recap', this.doLastRecap()).setOrigin(1, 0.5)
	    this.passContainer.add(this.btnRecap)

	    // Skip button - skip the recap once it is playing
	    this.btnSkip = new Button(this, 0, 0, 'Skip', this.doSkip()).setOrigin(1, 0.5)
	    this.passContainer.add(this.btnSkip)

	    this.displaySearchingStatus(true)

	    // Debug, expend container
	    let e = this.input.keyboard.addKey('E')
	    e.on('down', () => {that.expendContainer.setVisible(!that.expendContainer.visible)})
	    let r = this.input.keyboard.addKey('R')
	    r.on('down', () => {that.opponentExpendContainer.setVisible(!that.opponentExpendContainer.visible)})

	    // Debug, autowin
	    let w = this.input.keyboard.addKey('W')
	    w.on('down', () => {that.net.playCard(13)})

	    super.create()
	}

	// Set the background to recap animation / not
	interval: NodeJS.Timeout = undefined
	isFadingIn: boolean
	private setBackground(isRecap: boolean): void {
		let that = this

		let vMain = document.getElementById('v-main')
		let vRecap: any = document.getElementById('v-recap')

		if (isRecap) {
			document.body.style.background = '#080808'

			// If the recap video isn't yet playing, play it
			vRecap.play()
			
			// If we were fading in, stop
			if (that.isFadingIn) {
				clearInterval(that.interval)
				that.interval = undefined

				that.isFadingIn = false
			}

			if (that.interval === undefined) {
				clearInterval(that.interval)

				that.interval = setInterval(function() {

				// Regex to get and replace the opacity
				let re = /(opacity\()([0-9]+)(%\))/
				let style = vMain.getAttribute('style')
				let [_, opac, amt, perc] = style.match(re)

				// If the bottom was reached, exit
				if (amt === '0') {
					clearInterval(that.interval)
					that.interval = undefined
				}
				else {
					// Decrement the opacity and set it
					amt = (Number(amt) - 1).toString()

					let newStyle = style.replace(re, '$1' + amt + '$3')
					vMain.setAttribute('style', newStyle)
				}
			}, 1)
			}
			
		} else {
			document.body.style.background = '#101035'

			// If we were fading out, stop
			if (!that.isFadingIn) {
				clearInterval(that.interval)
				that.interval = undefined

				that.isFadingIn = true
			}

			// Fade in the normal background
			if (that.interval === undefined) {
				that.interval = setInterval(function() {

				// Regex to get and replace the opacity
				let re = /(opacity\()([0-9]+)(%\))/
			let style = vMain.getAttribute('style')
				let [_, opac, amt, perc] = style.match(re)

				// If the top was reached, exit
				if (amt === '100') {
					// Pause the recap video
					vRecap.pause()

					clearInterval(that.interval)
					that.interval = undefined
				}
				else {
					// Increment the opacity and set it
					amt = (Number(amt) + 1).toString()
					let newStyle = style.replace(re, '$1' + amt + '$3')
					vMain.setAttribute('style', newStyle)
				}
			}, 1)
			}
		}
	}

	// Create all objects relating to the mulligan phase
	private createMulliganObjects(): void {
		this.mulliganedCards = []

		// Highlights
		this.mulliganHighlights = []
		for (var i = 0; i < Mechanics.numMulligans; i++) {
			let [x, y] = this.getCardPosition(i, this.handContainer, 0)
			let highlight = this.add.rectangle(x, y, 100, 140, Color.mulliganHighlight, 1).setVisible(false)
			this.handContainer.add(highlight)
  			
  			this.mulliganHighlights.push(highlight)
		}

		// Text announcing opponent is still mulliganing
		this.txtOpponentMulligan = this.add.text(Space.announceOffset, 200, 'Opponent is still mulliganing...', Style.announcement).setOrigin(1, 0.5)

		// Button for player to confirm their mulligan
		let x = Space.pad * 2 + Space.cardSize * 1.5
		this.btnMulligan = new Button(this, x, Space.windowHeight - 200, 'Mulligan').setOrigin(0.5, 0.5)


		let that = this
		let f = function () {

			// Get the string to send signifying which cards to mulligan
			let mulligans = ''
			let amt = 0
			for (var i = 0; i < that.mulliganHighlights.length; i++) {
				if (that.mulliganHighlights[i].visible) {
					mulligans += '1'

					// Animate the mulliganed cards moving up out of hand, and their later transition to deck
					that.animateMulliganedCard(i)

					amt += 1
				} 
				else {
					mulligans += '0'

					// Move the remaining cards to fill in any holes to their left
					if (amt > 0) {
						that.animateKeptCard(i, amt)						
					}
				}
			}

			that.net.doMulligan(mulligans)			

			// Remove all mulligan objects
			that.mulliganHighlights.forEach(o => o.destroy())
			that.btnMulligan.destroy()
		}
		this.btnMulligan.setOnClick(f)

		this.mulliganContainer.add([this.txtOpponentMulligan, this.btnMulligan])
	}

	// Try to display the next queued state TODO Recovery if we've been waiting too long
	update(time, delta): void {
		// Prioritize showing the recap, if there is one
		if (this.queuedRecap.length > 0) {
			let wasShown = this.displayState(this.queuedRecap[0], true)

			if (wasShown) {
				this.queuedRecap.shift()

				if (this.queuedRecap.length === 0) {
					this.recapPlaying = false
				}

				return
			}
		}

		// Otherwise, show a non-recap state, as determined by its version number
		let nextVersionNumber = versionNumber + 1

		// When a recap replay finishes, return to the current state
		if (this.currentState !== undefined) {
			nextVersionNumber = Math.max(this.currentState.versionNumber, nextVersionNumber)
		}

		if (nextVersionNumber in this.queuedStates) {
			let isDisplayed = this.displayState(this.queuedStates[nextVersionNumber])

			// If the state was just shown, delete it
			if (isDisplayed) {
				this.currentState = this.queuedStates[nextVersionNumber]
				delete this.queuedStates[nextVersionNumber]
			}
		}
	}

	// Display searching for opponent if still looking
	displaySearchingStatus(searching: boolean): void {
		// Objects hidden while searching for opponent
		let hiddenObjets = [this.priorityRectangle, this.txtOpponentMulligan, this.btnMulligan]

		if (searching) {
			let txtSearching = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 50, 'Searching for an opponent...', Style.announcement).setOrigin(0.5)

			let btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight/2 + 50, "Cancel", this.exitScene()).setOrigin(0.5)

			this.temporaryObjs.push(txtSearching, btnExit)

			// Set hidden objects as invisible
			hiddenObjets.forEach( obj => obj.setAlpha(0))
		}
		else {
			hiddenObjets.forEach(obj => obj.setAlpha(1))

			this.sound.play('success')
		}
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

	// If a recap of states is playing, wait to show the new state until after it has finished
	recapPlaying: Boolean
	// Display the given game state, returns false if the state isn't shown immediately
	displayState(state: ClientState, isRecap: boolean = false, skipTweens: Boolean = false): boolean {
		let that = this

		let isRoundStart = state.story.acts.length === 0 && state.passes === 0
		let anyTweenPlaying = this.tweens.getAllTweens().length > 0
		// This is the final state shown as the recap plays
		let isRoundEnd = ['win', 'lose', 'tie'].includes(state.soundEffect)

		// If any tweens are not almost done, queue and wait for them to finish
		if (anyTweenPlaying) {
			return false
		}
		// If currently watching a recap, change the colors and display scores
		else if (isRecap) {
			this.animatePointGain(state)

			let s = `${state.score[1]}\n\n${state.score[0]}`
			this.txtScores.setText(s)

			// Causes minimum wait for each recap state
			this.tweens.add({
				targets: this.txtScores,
				alpha: 1,
				duration: Time.recapStateMinimum()
			})

			// Play button visible at the start of night
			// Play button stops transition to next state until clicked
			const isRecapStart = state.recap.playList.length === 0 && isRecap && !isRoundEnd
			this.btnPass.setVisible(!isRecapStart)
			this.btnPlay.setVisible(isRecapStart)
			if (isRecapStart) {
				this.btnPlay.glowUntilClicked()
			}
		}
		// Queue this for after recap finishes
		else if (this.recapPlaying) {
			return false
		}
		// Display this non-recap state, with normal background and no scores displayed
		else {
			this.txtScores.setText('')

			// If a round just ended, recap each state that the game was in throughout the story
			let numberStates = state.recap.stateList.length
			if (isRoundStart && numberStates > 0) {

				// Start the recap playing
				this.queueRecap(state.recap.stateList)

				// Remove the playlist from this state
				state.recap.stateList = []

				// Add this state to the queue
				this.queueState(state)

				// Return false: that this state was not shown at this time
				return false
			}
		}

		// Set the background appropriately
		this.setBackground(isRecap)

		// Play whatever sound this new state brings
		if (state.soundEffect !== null) {
			this.sound.play(state.soundEffect)
		}

		// Display victory / defeat
		if (!isRecap) {
			this.displayWinLose(state)
		}

		// Remove all of the existing cards
		this.temporaryObjs.forEach(obj => obj.destroy())
		this.temporaryObjs = []

		// Mulligan
		this.txtOpponentMulligan.setVisible(!state.mulligansComplete[1])
		this.passContainer.setVisible(!state.mulligansComplete.includes(false))

		// Hands
		this.displayHands(state, isRecap, isRoundStart)

		// Story
		this.displayStory(state, isRecap, isRoundStart)

		// Recap
		this.btnRecap.setVisible(!isRecap && this.lastRecap.length > 0)
		this.btnSkip.setVisible(isRecap)

		// Deck, discard, expended piles
		for (var i = 0; i < state.deck.length; i++) {
			this.addCard(state.deck[i], i, this.deckContainer)
		}
		for (var i = 0; i < state.discard[0].length; i++) {
			this.addCard(state.discard[0][i], i, this.discardContainer)
		}
		for (var i = 0; i < state.expended[0].length; i++) {
			this.addCard(state.expended[0][i], i, this.expendContainer)
		}

		for (var i = 0; i < state.lastShuffle[1].length; i++) {
			this.addCard(state.lastShuffle[1][i], i, this.opponentDeckContainer)
		}
		for (var i = 0; i < state.discard[1].length; i++) {
			this.addCard(state.discard[1][i], i, this.opponentDiscardContainer)
		}
		for (var i = 0; i < state.expended[1].length; i++) {
			this.addCard(state.expended[1][i], i, this.opponentExpendContainer)
		}

		// Stacks
		this.displayStacks(state)

		// TODO Hacky, use depth instead, don't do every time state is shown
		this.stackContainer.bringToTop(this.txtDeckSize)
		this.stackContainer.bringToTop(this.txtOpponentDeckSize)
		this.stackContainer.bringToTop(this.txtDiscardSize)
		this.stackContainer.bringToTop(this.txtOpponentDiscardSize)

		// Priority (Not shown during recap or once game is over, theirs hidden during their mulligan)
		if (isRecap || state.winner !== null) {
			this.priorityRectangle.setVisible(false)
			this.txtYourTurn.setVisible(false)
			this.txtTheirTurn.setVisible(false)
		}
		else if (state.priority === 1) {
			this.priorityRectangle.setY(0).setVisible(true)
			this.txtYourTurn.setVisible(false)
			this.txtTheirTurn.setVisible(true)
		}
		else {
			// NOTE Animated here and not above because the animation happens before the server responds (On press card/pass)
			this.priorityRectangle.setVisible(true)
			this.animatePriorityPass(1)

			this.txtYourTurn.setVisible(true)
			this.txtTheirTurn.setVisible(false)
		}
		if (!state.mulligansComplete[1]) {
			this.txtTheirTurn.setVisible(false)
		}

		// Vision
		if (state.vision === 0) {
			this.txtVision.setText('')

			this.visionRectangle.setX(0)
		}
		else {
			this.txtVision.setText(state.vision.toString())

			let x = this.getCardPosition(state.vision, this.storyContainer, 0)[0] - Space.cardSize / 2
			this.visionRectangle.setX(Math.min(x, Space.windowWidth))
		}

		// Mana
		this.txtMana.setText(`Mana: ${state.mana}/${state.maxMana[0]}`)
		this.txtOpponentMana.setText('')//`Mana: ?/${state.maxMana[1]}`)

		// Status
		let pointerIsOverAStatus = this.statusBar.setStatuses(state.status) ||
			this.statusBarOpp.setStatuses(state.opponentStatus)

		// Score
		this.txtWins.setText(`Wins: ${state.wins[0]}`)
		this.txtOpponentWins.setText(`Wins: ${state.wins[1]}`)
		if (state.soundEffect === 'win') {
			this.tweens.add({
				targets: this.txtWins,
				scale: 1.5,
				duration: Time.recapTween(),
				ease: "Sine.easeInOut",
				yoyo: true
			})
		} else if (state.soundEffect === 'lose') {
			this.tweens.add({
				targets: this.txtOpponentWins,
				scale: 1.5,
				duration: Time.recapTween(),
				ease: "Sine.easeInOut",
				yoyo: true
			})
		}

		// Passes
		if (state.passes === 0) {
			this.txtPass.setVisible(false)
			this.txtOpponentPass.setVisible(false)
		} else if (state.priority === 0) {
			this.txtPass.setVisible(false)
			this.txtOpponentPass.setVisible(true)
		} else {
			this.txtPass.setVisible(true)
			this.txtOpponentPass.setVisible(false)
		}

		// Play all of the remaining animations
		this.displayNonHandAnimations(state.animations)

		// Refresh card info to describe what it is currently hovering over
		if (!pointerIsOverAStatus) {
			refreshCardInfo()
		}

		// Remember what version of the game state this is, for use when communicating with server
		this.net.setVersionNumber(state.versionNumber)

		// Autopass
		let haveNoCards = state.hand.length === 0
		let haveNoPlayableCards = !state.cardsPlayable.includes(true)
		// If not a recap and it is your turn, pass if either we have no cards, or autopass is on and we have no available plays
		if (!isRecap && state.priority === 0 && !state.mulligansComplete.includes(false) &&
			((haveNoCards) ||
			(UserSettings._get('autopass') && haveNoPlayableCards))) {
			this.net.passTurn()
		}

		// State was displayed
		return true
	}

	// Play all animations besides those which end in the hand, which are applied elsewhere
	// TODO also not ending in story
	private displayNonHandAnimations(animations: [Animation[], Animation[]]): void {
		let that = this

		// Returns a function which performs an animation for the given player
		let delay = 0
		let doAnimation = function(player: number): (animation: Animation) => void {
			return function(animation: Animation): void {
				if (animation.from === Zone.Shuffle) {
					that.displayShuffleAnimation(delay, player, that)
				}
				else if (animation.from === Zone.Status) {
					that.displayStatusAnimation(animation, delay, player, that)
				}
				else if (animation.from === animation.to) {
					that.displayFocusAnimation(animation, delay, player, that)
				}
				else if (animation.to !== Zone.Hand && animation.to !== Zone.Story) {
					that.displayMovementAnimation(animation, delay, player, that)
				}

				// TODO Shuffle hits this
				delay += Time.recapTween()
			}
		}


		animations[0].forEach(doAnimation(0))
		delay = 0
		animations[1].forEach(doAnimation(1))

	}

	// Display a shuffling animation
	private displayShuffleAnimation(delay: number, player: number, that): void {
		let x = Space.stackX
		let yOffset = Space.pad + Space.cardSize/2
		let y = player === 0 ? Space.windowHeight - yOffset : yOffset

		let bottomHalf = that.add.sprite(x, y, 'Cardback').setOrigin(0, 0.5)
		let topHalf = that.add.sprite(x, y, 'Cardback').setOrigin(0, 0.5)
		that.stackContainer.add([bottomHalf, topHalf])

		that.tweens.add({
			targets: topHalf,
			y: topHalf.y - Space.cardSize/2,
			delay: delay,
			duration: Time.recapTween()/2,
			ease: "Sine.easeInOut",
			yoyo: true,
			onStart: function() { that.sound.play('shuffle') },
			onComplete: function () { topHalf.destroy() }
		})
		that.tweens.add({
			targets: bottomHalf,
			y: bottomHalf.y + Space.cardSize/2,
			delay: delay,
			duration: Time.recapTween()/2,
			ease: "Sine.easeInOut",
			yoyo: true,
			onComplete: function () { bottomHalf.destroy() }
		})
	}

	// Display an animation of a status being gained
	private displayStatusAnimation(animation: Animation, delay: number, player: number, that): void {
		let txt: Phaser.GameObjects.Text

		if (player === 0) {
			txt = that.statusBar.get(animation.status)
		} else {
			txt = that.statusBarOpp.get(animation.status)
		}

		that.tweens.add({
  			targets: txt,
  			scale: 1.5,
  			duration: Time.recapTweenWithPause(),
  			ease: "Sine.easeInOut",
  			yoyo: true,
  			delay: delay,
			onStart: function() { that.sound.play(animation.status.toString().toLowerCase()) }
  		})
	}

	// Display an animation which is any card moving between zones that doesn't end in the hand
	private displayMovementAnimation(animation: Animation, delay: number, player: number, that): void {
		let card: CardImage

		switch(animation.from) {
			case Zone.Mulligan:
			// NOTE We never get the opponent's mulligan animations from server
			card = that.mulliganedCards[animation.index]
			// Add back into temporary objects, so it doesn't persist
			that.temporaryObjs.push(card)
			break

			case Zone.Hand:
			if (player === 0) {
				card = that.addCard(animation.card, animation.index, that.handContainer, player)
			} else {
				card = that.addCard(animation.card, animation.index, that.opponentHandContainer, player)
			}
			break

			case Zone.Deck:
			card = that.addCard(animation.card, 0, that.stackContainer, player)
			break

			case Zone.Discard:
			card = that.addCard(animation.card, 1, that.stackContainer, player)
			break

			// case Zone.Story:
			// 	card = that.addCard(animation.card, 0, that.stackContainer, player)
			// 	break

			case Zone.Gone:
			card = that.addCard(animation.card, 0, that.storyContainer, player)
			// NOTE This gets changed below
			break
		}

		let x, y
		switch(animation.to) {
			// case Zone.Deck:
			case Zone.Deck:
			[x, y] = that.getCardPosition(0, that.stackContainer, player)
			break

			case Zone.Discard:
			[x, y] = that.getCardPosition(1, that.stackContainer, player)
			break

			case Zone.Gone:
			x = card.container.x
			y = Space.windowHeight/2
			break
		}

		// Gone start at midline, and drops vertically to wherever it's going
		if (animation.from === Zone.Gone) {
			card.setPosition([x, Space.windowHeight/2])
		}

		// Hide card until animation starts
		if (animation.from !== Zone.Mulligan) {
			card.hide()
			card.container.setDepth(1)	
		}

		that.tweens.add({
			targets: card.container,
			x: x,
			y: y,
			delay: delay,
			duration: Time.recapTweenWithPause(),
			onStart: function (tween, targets, _)
			{
				card.show()
			},
			onComplete: function (tween, targets, _) {
				card.hide()
			}
		})

		// If discard pile plus a zone on line with it, yo-yo in towards the center of board
		let lateralZones = [Zone.Hand, Zone.Deck]
		if (
			(animation.to === Zone.Discard && lateralZones.includes(animation.from)) || 
			(animation.from === Zone.Discard && lateralZones.includes(animation.to))) 
		{
			// Towards center by 2 card sizes
			let y = (card.container.y < Space.windowHeight/2) ? card.container.y + Space.cardSize*2 : card.container.y - Space.cardSize*2

			that.tweens.add({
				targets: card.container,
				y: y,
				delay: delay,
				duration: Time.recapTweenWithPause()/2,
				yoyo: true,
				onStart: function() { that.sound.play('discard') }
			})
		}

		// If card is being removed from the game, fade it out
		if (animation.to === Zone.Gone) {
			that.tweens.add({
				targets: card.container,
				alpha: 0,
				delay: delay,
				duration: Time.recapTweenWithPause()
			})
		}

		// If card is being created, fade it in
		if (animation.from === Zone.Gone) {
			card.container.setAlpha(0)

			that.tweens.add({
				targets: card.container,
				alpha: 1,
				delay: delay,
				duration: Time.recapTweenWithPause()
			})
		}
	}

	// Display an animation of the given zone shaking
	private displayFocusAnimation(animation: Animation, delay: number, player: number, that): void {
		let card: CardImage

		switch(animation.from) {
			// case Zone.Mulligan:
			// // NOTE We never get the opponent's mulligan animations from server
			// card = that.mulliganedCards[animation.index]
			// // Add back into temporary objects, so it doesn't persist
			// that.temporaryObjs.push(card)
			// break

			case Zone.Hand:
				if (player === 0) {
					card = that.addCard(animation.card, animation.index, that.handContainer, player)
				} else {
					card = that.addCard(animation.card, animation.index, that.opponentHandContainer, player)
				}
				break

			// case Zone.Deck:
			// card = that.addCard(animation.card, 0, that.stackContainer, player)
			// break

			case Zone.Discard:
				card = that.addCard(animation.card, 1, that.stackContainer, player)
				break

			// case Zone.Story:
			// 	card = that.addCard(animation.card, 0, that.stackContainer, player)
			// 	break

			// case Zone.Gone:
			// card = that.addCard(animation.card, 0, that.storyContainer, player)
			// // NOTE This gets changed below
			// break
		}

		// Hide card until animation starts
		card.hide()
		card.container.setDepth(1)

		that.tweens.add({
			targets: card.container,
			alpha: 0,
			scale: 2,
			delay: delay,
			duration: Time.recapTweenWithPause(),
			onStart: function (tween, targets, _)
			{
				card.show()
			},
			onComplete: function (tween, targets, _) {
				card.destroy()
			}
		})
	}


	// Callback for pressing the Pass button
	private onPass(): () => void {
		let that = this
		return function() {
			if (that.testCanPlay(10, that.currentState)) {
	    		that.net.passTurn()

	    		// Animate the turn being passed, so that user has immediate feedback before server returns state
	    		that.animatePriorityPass(0)

				this.txtPass.setVisible(true)
				this.txtYourTurn.setVisible(false)
	    	}
	    }
	}

	// Watch the last recap
	private doLastRecap(): () => void {
		let that = this

		return function() {
			that.recapPlaying = true
			that.queuedRecap = [...that.lastRecap]
			that.queueState(that.currentState)
		}
	}

	// TODO Make more method names use 'do' instead of 'on'
	private doSkip(): () => void {
		let that = this

		return function() {
			// Complete all tweens
			that.tweens.getAllTweens().forEach((tween) => {
				tween.complete()
			})

			// Set variables to a recap not playing
			that.queuedRecap = []
			that.recapPlaying = false

			// Hide the play button
			that.btnPlay.setVisible(false).stopGlow()

			// Show the pass button unless the game is over
			if (!that.btnExit.visible) {
				that.btnPass.setVisible(true)
			}
		}
	}

	// Jump to the recap action at the given index
	private jumpToRecapAct(i: number): () => void {
		let that = this

		return function() {
			// Get the series of states for this recap starting from the given index
			let recap = that.lastRecap.slice(i + 1)

			// Set that a recap is playing, queue the correct recap
			that.recapPlaying = true
			that.queuedRecap = recap

			// To correctly display point changes, set the current scores to the last recaps totals
			that.lastScore = that.lastRecap[i].score

			// Skip all tweens playing currently
			that.tweens.getAllTweens().forEach((tween) => {
				tween.complete()
			})
		}
	}

	// Alert user that their opponent left
	signalDC(): void {
		// TODO Replace this with menu impl
		let txt = 'Your opponent disconnected, you win!'
		let btn = new Button(this, Space.windowWidth/2, Space.windowHeight/2, txt, this.exitScene())
			.setOrigin(0.5)
			.setStyle(Style.announcement)

		this.storyContainer.add(btn)
	}

	// Called by the BaseScene button which returns to main menu, must alert server that we are exiting
	beforeExit(): void {
		this.net.exitMatch()

		this.setBackground(false)
	}

	// Display cards in each player's hand
	private displayHands(state: ClientState, recap: Boolean, isRoundStart: Boolean): void {
		// Create each card in client's hand. New cards should be animated to show that they were drawn
		let myHand: CardImage[] = []
		for (var i = 0; i < state.hand.length; i++) {
			let cardImage = this.addCard(state.hand[i], i, this.handContainer)

			// Set the cost of the card, which might differ from its default value
			cardImage.setCost(state.costs[i])

			if (!state.cardsPlayable[i]) {
				cardImage.setPlayable(false)
			}

			myHand.push(cardImage)
		}
		// Add the callbacks for clicking each card, which animate later cards
		for (var i = 0; i < state.hand.length; i++) {
			// Play the card if it's clicked on (Even if unplayable, will signal error)
			myHand[i].image.on('pointerdown',
				this.clickCard(i, myHand[i], state, [...myHand]),
				this)
		}

		// Add each card in opponent's hand
		let theirHand: CardImage[] = []
		for (var i = 0; i < state.opponentHandSize; i++) {
			theirHand.push(this.addCard(cardback, i, this.opponentHandContainer))
		}

		let that = this
		function animateHand(cards: CardImage[], player: number) {
			// TODO This isn't necessary since index is a part of animation
			// Go through the animation list backwards, setting longest delay on rightmost drawn cards
			for (i = state.animations[player].length - 1; i >= 0; i--) {
				let delay = i * Time.recapTween()

				let animation: Animation = state.animations[player][i]
				if (animation.to === Zone.Hand) {
					let card = cards[animation.index]

					let x, y
					switch(animation.from) {
						case Zone.Discard:
							// Move in towards center of board
							y = (player === 0) ? card.container.y - Space.cardSize*2 : card.container.y + Space.cardSize*2
							that.tweens.add({
								targets: card.container,
								y: y,
								delay: delay,
								duration: Time.recapTweenWithPause()/2,
								yoyo: true
							})

							// Remember where to end, then move to starting position
							x = card.container.x
							card.setPosition([Space.stackX + Space.cardSize + Space.pad, card.container.y])
							card.hide()

							// Animate moving x direction, appearing at start
							that.tweens.add({
								targets: card.container,
								x: x,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onStart: function (tween, targets, _)
								{
									card.show()
									that.sound.play('draw')
								}
							})
							break
							
						case Zone.Deck:
							// Remember where to end, then move to starting position
							x = card.container.x
							card.setPosition([Space.stackX, card.container.y])
							card.hide()

							// Animate moving x direction, appearing at start
							that.tweens.add({
								targets: card.container,
								x: x,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onStart: function (tween, targets, _)
								{
									card.show()
									that.sound.play('draw')
								}
							})
							break
						
						case Zone.Gone:
							// Animate moving y direciton
							y = card.container.y
							card.setPosition([card.container.x, Space.windowHeight/2])
							card.hide()

							// Animate moving x direction, appearing at start
							that.tweens.add({
								targets: card.container,
								y: y,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onStart: function (tween, targets, _)
								{
									card.show()
								}
							})
							
							// If card is being created, fade it in
							card.container.setAlpha(0)
							that.tweens.add({
								targets: card.container,
								alpha: 1,
								delay: delay,
								duration: Time.recapTweenWithPause()
							})
							break

						case Zone.Story:
							y = card.container.y
							that.tweens.add({
								targets: card.container,
								y: y,
								delay: delay,
								duration: Time.recapTweenWithPause()
							})
							x = card.container.x
							// Animate moving x direction, appearing at start
							that.tweens.add({
								targets: card.container,
								x: x,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onStart: function (tween, targets, _)
								{
									card.show()
									// TODO Add a bounce sound for cards returning from story to hand
									that.sound.play('draw')
								}
							})

							// Where to end is established, move start location
							// TODO This always pops it off the end, which works now but not in general
							let storyIndex = animation.index2
							card.setPosition(that.getCardPosition(storyIndex, that.storyContainer, player))
							card.hide()
							
							break
					}
				}
			}
		}

		animateHand(myHand, 0)
		animateHand(theirHand, 1)

		// NOTE This is for the mulligan animation at the start of the match
		this.myHand = myHand
	}

	// Display cards in the story
	private displayStory(state: ClientState, isRecap: boolean, isRoundEnd: boolean): void {
		let cards: CardImage[] = []

		let numActsCompleted = 0
		if (isRecap) {
			numActsCompleted = state.recap.playList.length

			// Show all of the acts that have already resolved
			let lastAct: CardImage = undefined
			for (var i = 0; i < numActsCompleted; i++) {
				let completedAct: [Card, number, string] = state.recap.playList[i]
				let card = completedAct[0]
				let owner = completedAct[1]

				lastAct = this.addCard(card, i, this.storyContainer, owner).setTransparent(true)

				// Click to jump to that position in the recap
				lastAct.setOnClick(this.jumpToRecapAct(i))

				// Add this card to the list of all cards in the story
				// cards.push(lastAct)
			}

			// Make the last act dissolve, but not the very last state, where wins are shown
			if (lastAct !== undefined && lastAct.card.fleeting && !isRoundEnd) {
				lastAct.dissolve()
			}
		}
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			let storyIndex = i + numActsCompleted
			let card = this.addCard(act.card, storyIndex, this.storyContainer, act.owner)

			if (isRecap) {
				// Click to jump to that position in the recap
				// card.set(this.jumpToRecapAct(i + numActsCompleted)) TODO Broke
			}

			// TODO Make this an animation from server instead of figuring out which cases it's being played
			// If opponent just played this card, animate it being played
			if (!isRecap && act.owner === 1 && state.passes === 0 && i === state.story.acts.length - 1) {
				this.animateOpponentPlay(card)
			}

			// Add this card to the list of all cards in the story
			cards.push(card)
		}

		let that = this
		function animateStory(player: number) {
			for (i = 0; i < state.animations[player].length; i++) {
				let delay = i * Time.recapTween()

				let animation: Animation = state.animations[player][i]
				if (animation.to === Zone.Story) {
					let card = cards[animation.index]

					let x, y
					switch(animation.from) {
						case Zone.Discard:
							// Animate towards eventual position
							that.tweens.add({
								targets: card.container,
								x: card.container.x,
								y: card.container.y,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onStart: function (tween, targets, _)
								{
									card.show()
									that.sound.play('play')
								}
							})

							// Move to discard pile to start
							card.setPosition(that.getCardPosition(1, that.stackContainer, player))
							card.hide()
							break
						
						case Zone.Transform:
							// Don't position correctly, just copy the position from card it's transforming into
							let fromCard = that.addCard(animation.card, 0, that.storyContainer, 0)
							fromCard.setPosition([card.container.x, card.container.y])

							that.tweens.add({
								targets: fromCard.container,
								alpha: 0,
								delay: delay,
								duration: Time.recapTweenWithPause(),
								onComplete: function (tween, targets, _) {
									fromCard.destroy()
								}
							})

							break
						// TODO Other cases
					}
				}
			}
		}

		animateStory(0)
		animateStory(1)
	}

	// Display each player's stacks (deck, discard pile)
	private displayStacks(state: ClientState): void {
		let deck = this.addCard(cardback, 0, this.stackContainer, 0)
		this.txtDeckSize.setText(state.deck.length.toString())

		let opponentDeck = this.addCard(cardback, 0, this.stackContainer, 1)
		this.txtOpponentDeckSize.setText(state.opponentDeckSize.toString())

		if (state.discard[0].length > 0) {
			let card = this.addCard(state.discard[0].slice(-1)[0], 1, this.stackContainer, 0)

			this.txtDiscardSize.setVisible(true)
			this.txtDiscardSize.setText(state.discard[0].length.toString())

			// animateDiscard(card, 0)
		} else this.txtDiscardSize.setVisible(false)
		
		if (state.discard[1].length > 0) {
			let card = this.addCard(state.discard[1].slice(-1)[0], 1, this.stackContainer, 1)

			this.txtOpponentDiscardSize.setVisible(true)
			this.txtOpponentDiscardSize.setText(state.discard[1].length.toString())

			// animateDiscard(card, 1)
		} else this.txtOpponentDiscardSize.setVisible(false)
	}

	// Tell player that they won or lost, public so that Tutorial can overwrite
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
		}

		let width = Space.maxHeight - 250
		if (state.winner === 0) {
			// Set that user has completed the missions with this id
			if (this.params.missionID !== undefined) {
				UserSettings._setIndex(
					'completedMissions',
					this.params.missionID,
					true)
			}

			let txtTitle = this.add.text(0, -(width/2 + 50), 'Victory!', Style.announcement).setOrigin(0.5, 1)
			menu.add(txtTitle)

			let bgVictory = this.add.image(0, -50, 'bg-Victory')
			menu.add(bgVictory)

			let y = width/2 + 50
			new Icon(this, menu, -Space.iconSeparation, y, 'Exit', this.exitScene())
			new Icon(this, menu, 0, y, 'Retry', this.doRetry())
			new Icon(this, menu, Space.iconSeparation, y, 'Review', () => menu.close())
		}
		else if (state.winner === 1) {
			let txtTitle = this.add.text(0, -(width/2 + 50), 'Defeat!', Style.announcement).setOrigin(0.5, 1)
			menu.add(txtTitle)

			let bgDefeat = this.add.image(0, -50, 'bg-Defeat')
			menu.add(bgDefeat)

			let y = width/2 + 50
			new Icon(this, menu, -Space.iconSeparation, y, 'Exit', this.exitScene())
			new Icon(this, menu, 0, y, 'Retry', this.doRetry())
			new Icon(this, menu, Space.iconSeparation, y, 'Review', () => menu.close())
		}
	}

	private animateOpponentPlay(card: CardImage): void {
		let y = card.container.y
		card.container.setY(y - 200)

		this.tweens.add({
  					targets: card.container,
  					y: y,
  					duration: Time.recapTween(),
  					ease: "Sine.easeInOut"
  					})
	}

	// Animate the priority rectangle passing from the given player to their opponent
	private animatePriorityPass(player: number): void {
		let y = (player === 0) ? 0 : Space.windowHeight - this.priorityRectangle.height
		
		this.tweens.add({
			targets: this.priorityRectangle,
			y: y,
			duration: Time.recapTween(),
			ease: "Sine.easeInOut"
		})
	}

	private addCard(card: Card,
					index: number,
					container: Phaser.GameObjects.Container,
					owner: number = 0): CardImage {

		// Cards in the stacks should not be interactive
		let interactive = container !== this.stackContainer

		// Make the card image
		let cardImage = new CardImage(card, container, interactive)

		// Reposition the card
		cardImage.setPosition(this.getCardPosition(index, container, owner))

		this.temporaryObjs.push(cardImage)
		return cardImage
	}

	private getCardPosition(index: number, container, owner: number): [number, number] {
		let x = 0
		let y = 0

		switch (container) {
			case this.handContainer:
			case this.opponentHandContainer:
				let xPad = (1 + index) * Space.pad
				x = index * Space.cardSize + xPad + Space.cardSize/2

				y = Space.pad + Space.cardSize/2
				if (container === this.handContainer) {
					y += Space.windowHeight - 140
				}
				break

			case this.storyContainer:
				let filledSpace = index * (Space.cardSize - Space.stackOverlap)
				x = Space.pad + Space.cardSize/2 + filledSpace

				if (owner === 1) {
					y = Space.windowHeight/2 - Space.stackOffset
				} else {
					y = Space.windowHeight/2 + Space.stackOffset
				}
				break

			case this.deckContainer:
			case this.discardContainer:
			case this.opponentDeckContainer:
			case this.opponentDiscardContainer:
			case this.expendContainer:
			case this.opponentExpendContainer:
				// Each row contains 15 cards, then next row of cards is below with some overlap
				x = Space.pad + Space.cardSize/2 + (Space.cardSize - Space.stackOverlap)  * (index%15)
				y = Math.floor(index / 15) * (Space.cardSize - Space.stackOffset) + Space.windowHeight/2

				break

			case this.stackContainer:
				// Deck is 0, discard is 1
				if (index === 0) x = Space.stackX + Space.cardSize/2
				else x = Space.stackX + Space.cardSize*3/2 + Space.pad

				// My pile is 0, opponent's is 1
				if (owner === 0) y = Space.windowHeight - Space.cardSize/2 - Space.pad
				else y = Space.cardSize/2 + Space.pad

				break
			
		}

	    return [x, y]
  	}

  	private clickCard(index: number, card: CardImage, state: ClientState, hand: CardImage[]): () => void  {
  		let that = this

  		return function() {
  			// Mulligan functionality
			// Toggle mulligan for the card
			if (!state.mulligansComplete[0]) {
				this.sound.play('click')

				let highlight = that.mulliganHighlights[index]
				highlight.setVisible(!highlight.visible)
			}
  			else if (that.testCanPlay(index, state, card)) {
  				// Animate the priority shifting to opponent
  				that.animatePriorityPass(0)

  				// Send a this card to its place in the story
  				let end = that.getCardPosition(state.story.acts.length, that.storyContainer, 0)

  				that.tweens.add({
  					targets: card.container,
  					x: end[0],
  					y: end[1],
  					duration: Time.recapTween(),
  					ease: "Sine.easeInOut",
  					// After brief delay, tell network, hide info, shift cards to fill its spot
  					onStart: function () {setTimeout(function() {
  						that.net.playCard(index)

  						cardInfo.setVisible(false)

		  				// Fill in the hole where the card was
		  				that.animateCardsFillHole(index, hand)
  					}, 10)}
  					})

  				// Make cardInfo invisible above (After brief delay) and remove description
  				// So that it won't linger after card has left
  				card.setDescribable(false)

  			}
  		}
  	}

  	private animateCardsFillHole(index: number, hand: CardImage[]): void {
  		let scene = hand[0].image.scene

  		for (var i = index + 1; i < hand.length; i++) {
  			let card = hand[i].container

  			scene.tweens.add({
  				targets: card,
  				x: card.x - Space.cardSize - Space.pad,
  				duration: Time.recapTween() - 10,
  				ease: "Sine.easeInOut"
  			})
  		}
  	}

  	// Test if the given play is valid in the given state, and display error if not
  	private testCanPlay(index: number, state: ClientState, card?: CardImage): boolean {
		// Game is over
		if (state.winner !== null) {
			this.signalError('The game is over')
		}
		// Opponent still mulliganing
		else if (!state.mulligansComplete[1]) {
			this.signalError('Opponent is still mulliganing')
		}
		else if (this.recapPlaying) {
			this.signalError('Recap is playing')
		}
		// Opponent's turn
		else if (state.priority === 1) {
			this.signalError("It's not your turn")
		}
		else if (card !== undefined && card.unplayable) {
			this.signalError('Not enough mana')
		}
		else {
			return true
		}

		return false
  	}

  	// Disables the story hidden lock seen below
  	private clickAnywhere(): () => void {
  		let that = this
  		return function() {
  			let hiddenContainers = [
		  		that.deckContainer,
		  		that.discardContainer,
		  		that.opponentDeckContainer,
		  		that.opponentDiscardContainer]

	  		let highlightedObjects = [
		  		that.txtDeckSize,
		  		that.txtDiscardSize,
		  		that.txtOpponentDeckSize,
		  		that.txtOpponentDiscardSize]

  			if (storyHiddenLock) {
      			that.sound.play('close')

	  			hiddenContainers.forEach(c => c.setVisible(false))
	  			highlightedObjects.forEach(o => o.setShadow())
	  			that.storyContainer.setVisible(true)

  				storyHiddenLock = false
  			}
  		}
  	}

  	private clickAlternateView(): () => void {
  		let that = this
  		return function() {
  			if (!storyHiddenLock) {
      			that.sound.play('open')

  				that.time.delayedCall(1, () => storyHiddenLock = true)
  			}
  		}
  	}

  	private hoverAlternateView(
  		revealedContainer: Phaser.GameObjects.Container,
  		highlightedObject: Phaser.GameObjects.Text
  		): () => void {
  		
  		let storyContainer = this.storyContainer
  		return function() {
  			if (!storyHiddenLock) {
  				revealedContainer.setVisible(true)
  				storyContainer.setVisible(false)

  				highlightedObject.setShadow(2, 2, Color.stackHighlight)
  			}
  		}
  	}

  	private hoverAlternateViewExit(
  		revealedContainer: Phaser.GameObjects.Container,
  		highlightedObject: Phaser.GameObjects.Text
  		): () => void {
  		
  		let storyContainer = this.storyContainer
  		return function() {
  			if (!storyHiddenLock) {
  				revealedContainer.setVisible(false)
  				storyContainer.setVisible(true)

  				highlightedObject.setShadow()
  			}
  		}
  	}

  	lastScore: [number, number] = [0, 0]
  	private animatePointGain(state: ClientState): void {
  		// The index of the card that is causing this point gain
  		let sourceIndex = state.recap.playList.length - 1

  		if (sourceIndex < 0) {
  			this.lastScore = state.score
  			return
  		}

  		let that = this
  		function getGain(i: number): string {
  			let amt = state.score[i] - that.lastScore[i]
  			if (amt < 0) {
  				return amt.toString()
  			} else if (amt === 0) {
  				return ''
  			} else {
  				return `+${amt}`
  			}
  		}
  		let myGain = `${state.score[0]}`
		let s = `${getGain(1)}\n\n${getGain(0)}`

  		let x = this.getCardPosition(sourceIndex, this.storyContainer, 0)[0]

  		// Send a this card to its place in the story
  		let txt = this.add.text(
	    	x, Space.windowHeight/2,
	    	s, Style.announcement).setOrigin(0.5, 0.5)

  		this.tweens.add({
  			targets: txt,
  			scale: 1.5,
  			// x: Space.scoresOffset,
  			duration: Time.recapTween(),
  			ease: "Sine.easeInOut",
  			yoyo: true,
  			onComplete: 
	  			function (tween, targets, _)
	  			{
	  				txt.destroy()
	  			}
  		})

  		// Remember what the scores were for next time
  		this.lastScore = state.score
  	}

  	// Animate the card at given spot in hand being mulliganed away
  	private animateMulliganedCard(i: number): void {
  		let card = this.myHand[i]

  		this.tweens.add({
			targets: card.container,
			y: card.container.y - Space.cardSize*2,
			duration: Time.recapTweenWithPause(),
		})

		// Remove this card from the destroyed objects list
		let objIndex
		for (var i = 0; i < this.temporaryObjs.length; i++) {
			if (this.temporaryObjs[i] === card) {
				objIndex = i
			}
		}
		this.temporaryObjs.splice(objIndex, 1)

		// Remove any click events
		card.removeOnClick()

		// Add to a list of mulliganed cards, which animate when we get the mulligan event
		this.mulliganedCards.push(card)
  	}

  	// Animate a card being kept during the mulligan filling a hole of size distance in the hand
  	private animateKeptCard(i: number, distance: number): void {
  		let card = this.myHand[i]

  		let dx = (Space.cardSize + Space.pad) * distance
  		this.tweens.add({
			targets: card.container,
			x: card.container.x - dx,
			duration: Time.recapTweenWithPause(),
			delay: Time.recapTween(),
		})
  	}

  	// Retry the current game mode
  	private doRetry(): () => void {
  		let that = this
  		return function () {
	  		that.scene.start("GameScene", that.params)
  		}
  	}

  	// NOTE Overwritten by Tutorial Scene
  	exitScene(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()

  			if (that.params.missionID !== undefined) {
  				that.scene.start('AdventureScene')
  			}
  			else {
  				that.scene.start("BuilderScene")
  			}
  		}
  	}
}

// TODO Rename to Match
export default class GameScene extends BaseScene {
	view: View
	net: Network

	// The states which are queued up and have not yet been seen, with key being their version number
	queuedStates: { [key: number]: ClientState}

	constructor (args = {key: "GameScene"}) {
		super(args)
	}

	init (params: any) {
		super.precreate()

		this.queuedStates = {}

		// TODO use params

		// This is the model
		
		// Create the controller
		// new Controller() THis is the controller
		let mmCode = 'ai'

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

	signalDC(): void {
		// TODO Replace this with menu impl
		console.log('opp disconnected')
	}

	// Set all of the callback functions for the regions in the view
	private setCallbacks(view, net): void {
		// Hand region
		view.ourHand.setCallback((i: number) => {
			net.playCard(i)
		})
	}

	// Try to display the next queued state TODO Recovery if we've been waiting too long
	private update(time, delta): void {
		// Prioritize showing the recap, if there is one
		// if (this.queuedRecap.length > 0) {
		// 	let wasShown = this.displayState(this.queuedRecap[0], true)

		// 	if (wasShown) {
		// 		this.queuedRecap.shift()

		// 		if (this.queuedRecap.length === 0) {
		// 			this.recapPlaying = false
		// 		}

		// 		return
		// 	}
		// }

		// Otherwise, show a non-recap state, as determined by its version number
		let nextVersionNumber = versionNumber + 1

		// When a recap replay finishes, return to the current state
		// if (this.currentState !== undefined) {
		// 	nextVersionNumber = Math.max(this.currentState.versionNumber, nextVersionNumber)
		// }

		if (nextVersionNumber in this.queuedStates) {
			let isDisplayed = this.displayState(this.queuedStates[nextVersionNumber])

			// If the state was just shown, delete it
			if (isDisplayed) {
				// this.currentState = this.queuedStates[nextVersionNumber]
				delete this.queuedStates[nextVersionNumber]
			}
		}
	}

	// Display the given game state, returns false if the state isn't shown immediately
	private displayState(state: ClientState): boolean {
		// If any tweens are playing, don't display yet
		let anyTweenPlaying = this.tweens.getAllTweens().length > 0
		if (anyTweenPlaying) {
			return false
		}

		// Remember what version of the game state this is, for use when communicating with server
		this.net.setVersionNumber(state.versionNumber)

		this.view.displayState(state)

		return true
	}
}


// The View of MVC - What is presented to the user
class View {
	scene: Phaser.Scene

	ourHand: Region // TODO Don't access this directly from gamescene
	theirHand: Region
	story: Region
	score: Region
	decks: Region
	discardPiles: Region

	// Has the phaser objects
	// Handles layout, animation
	// Divided into regions

	constructor (scene: Phaser.Scene) {
		this.scene = scene

		// Create each of the regions
		// this.createOurHand()
		// new HandRegion()//.create(scene)
		this.ourHand = new OurHandRegion().create(scene)
		this.theirHand = new TheirHandRegion().create(scene)

		this.story = new StoryRegion().create(scene)
		this.score = new ScoreRegion().create(scene)

		this.decks = new DecksRegion().create(scene)
		this.discardPiles = new DiscardPilesRegion().create(scene)

		// this.createOurDeck()
		// this.createTheirDeck()
		// this.createOurDiscard()
		// this.createTheirDiscard()

		// // Count of rounds won, our current/max mana
		// this.createWins()

		// Set all of the callbacks
	}

	displayState(state: ClientState) {
		this.ourHand.displayState(state)
		this.theirHand.displayState(state)
		this.story.displayState(state)
		this.score.displayState(state)
		this.decks.displayState(state)
		this.discardPiles.displayState(state)
	}
}

