import "phaser";
import { collectibleCards, cardback } from "../catalog/catalog"
import Card from "../lib/card"

import { Network } from "../net"
import ClientState from "../lib/clientState"
import BaseScene from "./baseScene"
import { CardImage, addCardInfoToScene, cardInfo, refreshCardInfo } from "../lib/cardImage"
// Import Settings itself 
import { ColorSettings, StyleSettings, UserSettings, Space } from "../settings"
import Recap from '../lib/recap'
import Button from '../lib/button'
import { Animation } from '../lib/animation'


const RECAP_TIME = 1000

var storyHiddenLock: boolean = false

export default class GameScene extends BaseScene {
	net: Network

	// Objects (CardImages and text) that will be removed before displaying a new state
	temporaryObjs

	mulliganHighlights: Phaser.GameObjects.Rectangle[]
	txtOpponentMulligan: Phaser.GameObjects.Text

	btnPass: Button
	
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	deckContainer: Phaser.GameObjects.Container
	discardContainer: Phaser.GameObjects.Container
	opponentDeckContainer: Phaser.GameObjects.Container
	opponentDiscardContainer: Phaser.GameObjects.Container

	mulliganContainer: Phaser.GameObjects.Container

	storyContainer: Phaser.GameObjects.Container
	stackContainer: Phaser.GameObjects.Container
	recapContainer: Phaser.GameObjects.Container
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

	txtStatus: Phaser.GameObjects.Text
	txtOpponentStatus: Phaser.GameObjects.Text

	txtPass: Phaser.GameObjects.Text
	txtOpponentPass: Phaser.GameObjects.Text

	txtRecapTotals: Phaser.GameObjects.Text

	txtDeckSize: Phaser.GameObjects.Text
	txtOpponentDeckSize: Phaser.GameObjects.Text
	txtDiscardSize: Phaser.GameObjects.Text
	txtOpponentDiscardSize: Phaser.GameObjects.Text
	btnRecap: Phaser.GameObjects.Text

	// Information about the recap that is playing
	txtScores: Phaser.GameObjects.Text

	// Message explaining to user what they did wrong
	txtError: Phaser.GameObjects.Text

	// The states which are queued up and have not yet been seen, with key being their version number
	queuedStates: { [key: number]: ClientState}

	// The last recap, each state that the game passes through in resolving the story
	queuedRecap: ClientState[]


	constructor(args = {key: "GameScene"}) {
		super(args)
	}

	init(params: any): void {
		// Code to matchmake player with ('ai' if versus computer)
		let mmCode = UserSettings._get('mmCode')
	    if (UserSettings._get('vsAi')) {
	    	mmCode = 'ai'
	    }

	    // Tutorial should always be against ai
	    if (params['isTutorial']) {
	    	if (params['tutorialNumber'] === 1) {
	    		mmCode = 'tutorial'
	    	} else if (params['tutorialNumber'] === 2) {
	    		mmCode = 'ai'
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
		this.opponentDiscardContainer = this.add.container(0, 0).setVisible(false)
		this.opponentDeckContainer = this.add.container(0, 0).setVisible(false)

		this.mulliganContainer = this.add.container(0, 0).setVisible(true)

		this.storyContainer = this.add.container(0, 0)
		this.recapContainer = this.add.container(0, 0).setVisible(false)
		this.stackContainer = this.add.container(Space.stackX, 0)
		this.passContainer = this.add.container(1100 - Space.pad, 650/2 - 40).setVisible(false)

		this.input.on('pointerdown', this.clickAnywhere(), this)

		// Defined these arguments here, so that they don't carry over between instances of Game Scene
		this.recapPlaying = false
		this.queuedStates = {}
		this.queuedRecap = []
	}

	create(): void {
		let that = this

		// Middle line, below everything
		let midline = this.add.rectangle(0, 650/2, 1100, 20, ColorSettings.middleLine, 1).setOrigin(0, 0.5)
		this.children.sendToBack(midline)

		// Priority highlight
		let height = Space.cardSize + 2 * Space.pad
		this.priorityRectangle = this.add.rectangle(0, -500, 1100, height, 0xffffff, 0.1).setOrigin(0, 0)
		this.txtYourTurn = this.add.text(Space.announceOffset, 650 - 200, 'Your turn', StyleSettings.announcement).setVisible(false).setOrigin(1, 0.5)
		this.txtTheirTurn = this.add.text(Space.announceOffset, 200, 'Their turn', StyleSettings.announcement).setVisible(false).setOrigin(1, 0.5)

		// Vision highlight and text
		height = Space.cardSize + 2 * Space.stackOffset + 2 * Space.pad
		this.visionRectangle = this.add.rectangle(0, Space.windowHeight/2, 1100, height, 0xffffff, 0.1).setOrigin(1, 0.5)
		this.txtVision = this.add.text(0, Space.windowHeight/2, '', StyleSettings.small).setOrigin(0, 0.5)
		this.storyContainer.add([this.visionRectangle, this.txtVision])

		// Mulligan highlights and button
		this.createMulliganObjects()

		// Pass button
    	this.btnPass = new Button(this, 0, 80, 'Pass', this.onPass()).setOrigin(1, 0.5)
    	this.passContainer.add(this.btnPass)

	    // Mana text
	    this.txtMana = this.add.text(1100 - Space.pad,
	    	650 - 30 - Space.cardSize - Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)
	    this.txtOpponentMana = this.add.text(1100 - Space.pad,
	    	30 + Space.cardSize + Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)

	    this.txtWins = this.add.text(1100 - Space.pad,
	    	650 - 70 - Space.cardSize - Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)
	    this.txtOpponentWins = this.add.text(1100 - Space.pad,
	    	70 + Space.cardSize + Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)

	    // Status text
	    this.txtStatus = this.add.text(Space.pad,
	    	650 - Space.cardSize - Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(0, 1)
	    this.txtOpponentStatus = this.add.text(Space.pad,
	    	Space.cardSize + Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(0, 0)

	    this.txtPass = this.add.text(Space.announceOffset, 650 - 200, 'Passed', StyleSettings.announcement).setVisible(false).setOrigin(1, 0.5)
	    this.txtOpponentPass = this.add.text(Space.announceOffset, 200, 'Passed', StyleSettings.announcement).setVisible(false).setOrigin(1, 0.5)

	    // Alternate views presented when hovering over/clicking any stacks
	    // TODO Make a method that replaces each of these sections, since they are all nearly identical
	    this.txtDeckSize = this.add.text(
	    	Space.cardSize/2,
	    	650 - Space.pad - Space.cardSize/2,
	    	'', StyleSettings.stack).setOrigin(0.5, 0.5)
	    this.txtDeckSize.setInteractive()
	    this.txtDeckSize.on('pointerover', this.hoverAlternateView(this.deckContainer, this.txtDeckSize), this)
	    let hoverExit = this.hoverAlternateViewExit(this.deckContainer, this.txtDeckSize)
	    this.txtDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDeckSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    this.txtDiscardSize = this.add.text(
	    	Space.cardSize*3/2 + Space.pad,
	    	650 - Space.pad - Space.cardSize/2,
	    	'', StyleSettings.stack).setOrigin(0.5, 0.5)
	    this.txtDiscardSize.setInteractive()
	    this.txtDiscardSize.on('pointerover', this.hoverAlternateView(this.discardContainer, this.txtDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.discardContainer, this.txtDiscardSize)
	    this.txtDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDiscardSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDeckSize = this.add.text(
	    	Space.cardSize/2,
	    	Space.pad + Space.cardSize/2,
	    	'', StyleSettings.stack).setOrigin(0.5, 0.5)
	    this.txtOpponentDeckSize.setInteractive()
	    this.txtOpponentDeckSize.on('pointerover', this.hoverAlternateView(this.opponentDeckContainer, this.txtOpponentDeckSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDeckContainer, this.txtOpponentDeckSize)
	    this.txtOpponentDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDeckSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDiscardSize = this.add.text(
	    	Space.cardSize*3/2 + Space.pad,
	    	Space.pad + Space.cardSize/2,
	    	'', StyleSettings.stack).setOrigin(0.5, 0.5)
	    this.txtOpponentDiscardSize.setInteractive()
	    this.txtOpponentDiscardSize.on('pointerover', this.hoverAlternateView(this.opponentDiscardContainer, this.txtOpponentDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDiscardContainer, this.txtOpponentDiscardSize)
	    this.txtOpponentDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDiscardSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    let stacks = [this.txtDeckSize, this.txtDiscardSize, this.txtOpponentDeckSize, this.txtOpponentDiscardSize]
	    this.stackContainer.add(stacks)

	    let txtLastShuffleExplanation = this.add.text(
	    	Space.pad, Space.windowHeight/2 - (Space.cardSize/2 + Space.pad), "Opponent's last known shuffle:", StyleSettings.basic)
	    txtLastShuffleExplanation.setOrigin(0, 1)
	    this.opponentDeckContainer.add(txtLastShuffleExplanation)

	    // Scores text for recap states, same as below text but viewed when recalling recap states
	    this.txtScores = this.add.text(
	    	Space.scoresOffset, Space.windowHeight/2,
	    	'', StyleSettings.announcement).setOrigin(0.5, 0.5)
	    this.storyContainer.add(this.txtScores)

	    // Recap text and hidden text
	    this.txtRecapTotals = this.add.text(
	    	Space.scoresOffset, Space.windowHeight/2,
	    	'', StyleSettings.announcement).setOrigin(0.5, 0.5)
	    this.recapContainer.add(this.txtRecapTotals)

	    let btnRecap = this.add.text(0, 0, 'Recap', StyleSettings.button).setOrigin(1, 0.5)
	    this.passContainer.add(btnRecap)
	    btnRecap.setInteractive()
	    btnRecap.on('pointerover', this.hoverAlternateView(this.recapContainer, btnRecap), this)
	    hoverExit = this.hoverAlternateViewExit(this.recapContainer, btnRecap)
	    btnRecap.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    btnRecap.on('pointerdown', this.clickAlternateView(), this)
	    this.btnRecap = btnRecap

	    // Error text, for when the user does something wrong they get an explanation
		this.txtError = this.add.text(500, 650/2, '', StyleSettings.announcement).setOrigin(0.5, 0.5)

	    this.displaySearchingStatus(true)

	    super.create()
	}

	// Create all objects relating to the mulligan phase
	private createMulliganObjects(): void {
		// Highlights
		this.mulliganHighlights = []
		for (var i = 0; i < 3; i++) {
			let [x, y] = this.getCardPosition(i, this.handContainer, 0)
			let highlight = this.add.rectangle(x, y, 100, 140, ColorSettings.mulliganHighlight, 1).setVisible(false)
			this.handContainer.add(highlight)
  			
  			this.mulliganHighlights.push(highlight)
		}

		// Text announcing opponent is still mulliganing
		this.txtOpponentMulligan = this.add.text(Space.announceOffset, 200, 'Opponent is still mulliganing...', StyleSettings.announcement).setOrigin(1, 0.5)

		// Button for player to confirm their mulligan
		let x = Space.pad * 2 + Space.cardSize * 1.5
		let btnMulligan = new Button(this, x, Space.windowHeight - 200, 'Mulligan').setOrigin(0.5, 0.5)

		let that = this
		let f = function () {
			let mulligans = ''
			for (var i = 0; i < that.mulliganHighlights.length; i++) {
				if (that.mulliganHighlights[i].visible) mulligans += '1'
				else mulligans += '0'
			}

			that.net.doMulligan(mulligans)

			// Remove all mulligan objects
			that.mulliganHighlights.forEach(o => o.destroy())
			btnMulligan.destroy()
		}
		btnMulligan.setOnClick(f)

		this.mulliganContainer.add([this.txtOpponentMulligan, btnMulligan])
	}

	// Try to display the next queued state TODO Recovery if we've been waiting too long
	update(time, delta): void {
		// Prioritize showing the recap, if there is one
		if (this.queuedRecap.length > 0) {
			let wasShown = this.displayState(this.queuedRecap[0], true)

			if (wasShown) {
				this.queuedRecap.shift()
				console.log(this.queuedRecap)
				if (this.queuedRecap.length === 0) {
					this.recapPlaying = false
				}
			}
		}

		// Otherwise, show a non-recap state, as determined by its version number
		let nextVersionNumber = this.net.versionNumber + 1

		if (nextVersionNumber in this.queuedStates) {
			let isDisplayed = this.displayState(this.queuedStates[nextVersionNumber])

			// If the state was just shown, delete it
			if (isDisplayed) {
				delete this.queuedStates[nextVersionNumber]
			}
		}
	}

	// Display searching for opponent if still looking
	displaySearchingStatus(searching: boolean): void {
		if (searching) {
			let searchingBackground = this.add.rectangle(0, 0, 1100, 650, ColorSettings.background).setOrigin(0, 0)
			let txtSearching = this.add.text(1100/2, 300, 'Searching for an opponent...', StyleSettings.announcement).setOrigin(0.5, 0.5)

			let btnExit = new Button(this, Space.windowWidth/2, 400, "Cancel", this.exitScene).setOrigin(0.5, 0.5)

			this.temporaryObjs.push(searchingBackground, txtSearching, btnExit)
		}
		else {
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
		this.queuedRecap = stateList
	}

	// If a recap of states is playing, wait to show the new state until after it has finished
	recapPlaying: Boolean
	// Display the given game state, returns false if the state isn't shown immediately
	displayState(state: ClientState, recap: Boolean = false, skipTweens: Boolean = false): boolean {
		let that = this
		let isRoundStart = state.story.acts.length === 0 && state.passes === 0

		// NOTE The reason to round (~10) here is because onFinish will call this when animations very nearly complete
		// let anyTweenPlaying = !this.tweens.getAllTweens().every(function (tween) {return tween.totalDuration - tween.totalElapsed <= 100})
		let anyTweenPlaying = this.tweens.getAllTweens().length > 0

		// If any tweens are not almost done, queue and wait for them to finish
		if (anyTweenPlaying) {
			return false
		}
		// If currently watching a recap, change the colors and display scores
		else if (recap)
		{
			this.cameras.main.setBackgroundColor(ColorSettings.recapBackground)

			this.animatePointGain(state)

			let s = `${state.score[1]}\n\n${state.score[0]}`
			this.txtScores.setText(s)
		}
		// Queue this for after recap finishes
		else if (this.recapPlaying)
		{
			return false
		}
		// Display this non-recap state, with normal background and no scores displayed
		else
		{
			this.cameras.main.setBackgroundColor(ColorSettings.background)
			this.txtScores.setText('')

			// If a round just ended, recap each state that the game was in throughout the story
			let numberStates = state.recap.stateList.length
			if (isRoundStart && numberStates > 0) {
				
				this.recapPlaying = true

				// Start the recap playing
				this.queueRecap(state.recap.stateList)

				// Remove the playlist from this state
				state.recap.stateList = []

				// Add this state to the queue
				this.queueState(state)

				// return
				return false
			}
		}

		// Play whatever sound this new state brings
		if (state.soundEffect !== null) {
			this.sound.play(state.soundEffect)
		}

		// Display victory / defeat
		if (!recap) {
			this.displayWinLose(state)
		}

		// Remove all of the existing cards
		this.temporaryObjs.forEach(obj => obj.destroy())
		this.temporaryObjs = []

		// Mulligan
		this.txtOpponentMulligan.setVisible(!state.mulligansComplete[1])
		this.passContainer.setVisible(!state.mulligansComplete.includes(false))

		// Hands
		this.displayHands(state, recap, isRoundStart)

		// Story
		let numActsCompleted = 0
		if (recap) {
			numActsCompleted = state.recap.playList.length

			for (var i = 0; i < numActsCompleted; i++) {
				let completedAct: [Card, number, string] = state.recap.playList[i]
				let card = completedAct[0]
				let owner = completedAct[1]

				this.addCard(card, i, this.storyContainer, owner).setTransparent(true)
			}
		}
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			let storyIndex = i + numActsCompleted
			let card = this.addCard(act.card, storyIndex, this.storyContainer, act.owner)

			// If opponent just played this card, animate it being played
			if (!recap && act.owner === 1 && state.passes === 0 && i === state.story.acts.length - 1) {
				this.animateOpponentPlay(card.image)
			}
		}

		// Recap
		let playList = state.recap.playList
		let x = 0
		for (var i = 0; i < playList.length; i++) {
			let owner = playList[i][1]

			this.addCard(playList[i][0], i, this.recapContainer, owner)
			x = this.addCardRecap(playList[i][2], i, owner).x + Space.cardSize
		}
		let s = this.getRecapTotalText(state.recap)
		this.txtRecapTotals.setText(s)

		// Deck, discard piles
		for (var i = 0; i < state.deck.length; i++) {
			this.addCard(state.deck[i], i, this.deckContainer)
		}
		for (var i = 0; i < state.discard[0].length; i++) {
			this.addCard(state.discard[0][i], i, this.discardContainer)
		}
		for (var i = 0; i < state.lastShuffle[1].length; i++) {
			this.addCard(state.lastShuffle[1][i], i, this.opponentDeckContainer)
		}
		for (var i = 0; i < state.discard[1].length; i++) {
			this.addCard(state.discard[1][i], i, this.opponentDiscardContainer)
		}

		// Stacks
		this.displayStacks(state)

		// TODO Hacky, use depth instead, don't do every time state is shown
		this.stackContainer.bringToTop(this.txtDeckSize)
		this.stackContainer.bringToTop(this.txtOpponentDeckSize)
		this.stackContainer.bringToTop(this.txtDiscardSize)
		this.stackContainer.bringToTop(this.txtOpponentDiscardSize)

		// Priority (Not shown during recap or once game is over, theirs hidden during their mulligan)
		if (recap || state.winner !== null) {
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

			let x = this.getCardPosition(state.vision, this.storyContainer, 0)[0] - Space.cardSize/2
			this.visionRectangle.setX(Math.min(x, 1100))
		}

		// Mana
		this.txtMana.setText(`Mana: ${state.mana}/${state.maxMana[0]}`)
		this.txtOpponentMana.setText('')//`Mana: ?/${state.maxMana[1]}`)

		// Status
		this.txtStatus.setText(state.status)
		this.txtOpponentStatus.setText(state.opponentStatus)

		// Score
		this.txtWins.setText(`Wins: ${state.wins[0]}`)
		this.txtOpponentWins.setText(`Wins: ${state.wins[1]}`)
		if (state.soundEffect === 'win') {
			this.tweens.add({
	  			targets: this.txtWins,
	  			scale: 1.5,
	  			duration: 500,
	  			ease: "Sine.easeInOut",
	  			yoyo: true
	  		})
		} else if (state.soundEffect === 'lose') {
			this.tweens.add({
	  			targets: this.txtOpponentWins,
	  			scale: 1.5,
	  			duration: 500,
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

		// Refresh card info to describe what it is currently hovering over
		refreshCardInfo()

		// Remember what version of the game state this is, for use when communicating with server
		this.net.setVersionNumber(state.versionNumber)

		// Autopass
		if (!recap && state.hand.length === 0 && state.priority === 0) this.net.passTurn()

		// State was displayed
		return true
	}

	// Callback for pressing the Pass button
	private onPass(): () => void {
		let that = this
		return function() {
	    	if (!that.recapPlaying) {
	    		that.net.passTurn()

	    		// Animate the turn being passed, so that user has immediate feedback before server returns state
	    		that.animatePriorityPass(0)

				this.txtPass.setVisible(true)
				this.txtYourTurn.setVisible(false)
	    	}
	    }
	}

	// Alert the user that they have taken an illegal or impossible action
	errorMsgTimeout: NodeJS.Timeout
	signalError(msg: string = ''): void {
      	this.sound.play('failure')

		this.cameras.main.flash(300, 0, 0, 0.1)

		this.txtError.setText(msg)

		// Remove previous timeout, create a new one
		if (this.errorMsgTimeout !== undefined) {
			clearTimeout(this.errorMsgTimeout)
		}

		let that = this
		this.errorMsgTimeout = setTimeout(function() { that.txtError.setText('') }, 1000)
	}

	// Alert user that their opponent left
	signalDC(): void {
		let txt = 'Your opponent disconnected, you win!'
		let btn = new Button(this, Space.windowWidth/2, Space.windowHeight/2, txt, this.exitScene)
			.setOrigin(0.5)
			.setStyle(StyleSettings.announcement)

		this.storyContainer.add(btn)
	}

	// Called by the BaseScene button which returns to main menu, must alert server that we are exiting
	beforeExit(): void {
		this.net.closeSocket()
	}

	// Display cards in each player's hand
	private displayHands(state: ClientState, recap: Boolean, isRoundStart: Boolean): void {
		// Create each card in client's hand. New cards should be animated to show that they were drawn
		let myHand: CardImage[] = []
		for (var i = 0; i < state.hand.length; i++) {
			let cardImage = this.addCard(state.hand[i], i, this.handContainer)

			if (!state.cardsPlayable[i]) {
				cardImage.setPlayable(false)
			}

			// Play the card if it's clicked on (Even if unplayable, will signal error)
			cardImage.image.on('pointerdown',
				this.clickCard(i, cardImage, state),
				this)

			// TODO Add an animation for the camera on server side
			// If the card is a Camera and this is the start of a round, animate it
			if (isRoundStart && !recap && cardImage.card.name === 'Camera') {
				cardImage.animateCamera(0)
			}

			myHand.push(cardImage)
		}

		// Add each card in opponent's hand
		let theirHand: CardImage[] = []
		for (var i = 0; i < state.opponentHandSize; i++) {
			theirHand.push(this.addCard(cardback, i, this.opponentHandContainer))
		}

		let that = this
		function animateHand(cards: CardImage[], player: number) {
			// Go through the animation list backwards, setting longest delay on rightmost drawn cards
			for (i = state.animations[player].length - 1; i >= 0; i--) {
				let card: CardImage
				let delay = i * 500

				switch (state.animations[player][i]) {
					case Animation.Draw:
					case Animation.TutorDeck:
						card = cards.pop()

						that.animateDraw(card.image, delay)
						break
					case Animation.TutorDiscard:
						card = cards.pop()					

						that.animateDraw(card.image, delay, true)
						break
					case Animation.Create:
						card = cards.pop()

						card.image.setScale(0)
						that.tweens.add({
							targets: card.image,
							scale: 1,
							delay: delay,
							duration: 400,
							onStart: function (tween, targets, _)
							{
								card.image.setVisible(true)
							}
						})
						break
				}
			}
		}
		
		animateHand(myHand, 0)
		animateHand(theirHand, 1)
	}

	// Display each player's stacks (deck, discard pile)
	private displayStacks(state: ClientState): void {
		// Do all animations for the given deck
		let that = this
		function animateDeck(deck: Phaser.GameObjects.Image, player: number): void {
			// The y which card will bounce up/down to before returning to stack
			let innerY = (deck.y < Space.windowHeight/2) ? deck.y + Space.cardSize*2 : deck.y - Space.cardSize*2

			// Go through all animations and apply any that relate to stacks
			for (var i = 0; i <= state.animations[player].length; i++) {
				let delay = i * 500

				switch (state.animations[player][i]) {
					case Animation.Shuffle:
						that.tweens.add({
				  			targets: deck,
				  			y: deck.y - Space.cardSize/2,
				  			delay: delay,
				  			duration: 250,
				  			ease: "Sine.easeInOut",
				  			yoyo: true,
			  			})

						// Animate another cardback yoyoing in the opposite direction
			  			let halfDeck = that.add.sprite(deck.x, deck.y, deck.texture)
			  			deck.parentContainer.add(halfDeck)
			  			
			  			that.tweens.add({
				  			targets: halfDeck,
				  			y: halfDeck.y + Space.cardSize/2,
				  			delay: delay,
				  			duration: 250,
				  			ease: "Sine.easeInOut",
				  			yoyo: true,
				  			onComplete: function () { halfDeck.destroy() }
			  			})
						break
					// Move a cardback from discard pile to top of deck
					case Animation.Top:
						let newTop = that.add.sprite(deck.x + Space.cardSize, deck.y, deck.texture).setVisible(false)
			  			deck.parentContainer.add(newTop)
			  			
			  			that.tweens.add({
				  			targets: newTop,
				  			x: deck.x,
				  			delay: delay,
				  			duration: 400,
				  			ease: "Sine.easeInOut",
				  			onStart: function () { newTop.setVisible(true) },
				  			onComplete: function () { newTop.destroy() }
			  			})
			  			that.tweens.add({
			  				targets: newTop,
			  				y: innerY,
			  				delay: delay,
			  				duration: 200,
			  				ease: "Sine.easeInOut",
			  				yoyo: true
			  			})
						break
					case Animation.Mill:
						let milledCard = that.add.sprite(deck.x + Space.pad, deck.y, deck.texture).setVisible(false)
			  			deck.parentContainer.add(milledCard)
			  			
			  			that.tweens.add({
				  			targets: milledCard,
				  			x: milledCard.x + Space.cardSize,
				  			delay: delay,
				  			duration: 400,
				  			ease: "Sine.easeInOut",
				  			onStart: function () { milledCard.setVisible(true) },
				  			onComplete: function () { milledCard.destroy() }
			  			})
			  			that.tweens.add({
			  				targets: milledCard,
			  				y: innerY,
			  				delay: delay,
			  				duration: 200,
			  				ease: "Sine.easeInOut",
			  				yoyo: true
			  			})
						break
				}
			}
		}

		let deck = this.addCard(cardback, 0, this.stackContainer, 0).image
		this.txtDeckSize.setText(state.deck.length.toString())
		animateDeck(deck, 0)

		let opponentDeck = this.addCard(cardback, 0, this.stackContainer, 1).image
		this.txtOpponentDeckSize.setText(state.opponentDeckSize.toString())
		animateDeck(opponentDeck, 1)

		// Show discard piles, if they have cards in them
		if (state.discard[0].length > 0) {
			this.addCard(state.discard[0].slice(-1)[0], 1, this.stackContainer, 0)

			this.txtDiscardSize.setVisible(true)
			this.txtDiscardSize.setText(state.discard[0].length.toString())
		} else this.txtDiscardSize.setVisible(false)
		
		if (state.discard[1].length > 0) {
			this.addCard(state.discard[1].slice(-1)[0], 1, this.stackContainer, 1)

			this.txtOpponentDiscardSize.setVisible(true)
			this.txtOpponentDiscardSize.setText(state.discard[1].length.toString())
		} else this.txtOpponentDiscardSize.setVisible(false)
	}

	// Tell player that they won or lost, public so that Tutorial can overwrite
	displayWinLose(state: ClientState): void {
		if (state.winner === 0) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You won!\n\nClick here to continue...", this.exitScene).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)
			
			this.storyContainer.add(btnResult)
		}
		else if (state.winner === 1) {
			let btnResult = new Button(this, Space.pad, Space.windowHeight/2, "You lost!\n\nClick here to continue...", this.exitScene).setOrigin(0, 0.5)
			btnResult.setStyle(StyleSettings.announcement)

			this.storyContainer.add(btnResult)
		}
	}
	
	// Tween the image to move to its position from the deck after delay. Return the new delay
	private animateDraw(image: Phaser.GameObjects.Image, delay: number, fromDiscard: Boolean = false): void {
		let x = image.x
		if (!fromDiscard) {
			image.setX(Space.stackX)
		} else {
			image.setX(Space.stackX + Space.cardSize + Space.pad)
		}

		image.setVisible(false)

		this.tweens.add({
			targets: image,
			x: x,
			delay: delay,
			duration: 400,
			onStart: function (tween, targets, _)
			{
				image.setVisible(true)
			}
		})

		if (fromDiscard) {
			let y = (image.y < Space.windowHeight/2) ? image.y + Space.cardSize*2 : image.y - Space.cardSize*2
			this.tweens.add({
				targets: image,
				y: y,
				delay: delay,
				duration: 200,
				yoyo: true
			})
		}
	}

	private animateOpponentPlay(card: Phaser.GameObjects.Image): void {
		let y = card.y
		card.setY(y - 200)

		this.tweens.add({
  					targets: card,
  					y: y,
  					duration: 500,
  					ease: "Sine.easeInOut"
  					})
	}

	// Animate the priority rectangle passing from the given player to their opponent
	private animatePriorityPass(player: number): void {
		let y = (player === 0) ? 0 : Space.windowHeight - this.priorityRectangle.height
		
		this.tweens.add({
			targets: this.priorityRectangle,
			y: y,
			duration: 400,
			ease: "Sine.easeInOut"
		})
	}

	private addCard(card: Card,
					index: number,
					container: Phaser.GameObjects.Container,
					owner: number = 0): CardImage {
		let image: Phaser.GameObjects.Image
		let [x, y] = this.getCardPosition(index, container, owner)

		image = this.add.image(x, y, card.name)
		image.setDisplaySize(100, 100)

		container.add(image)

		let cardImage = new CardImage(card, image)
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

			case this.recapContainer:
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
				// Each row contains 15 cards, then next row of cards is below with some overlap
				x = Space.pad + Space.cardSize/2 + (Space.cardSize - Space.stackOverlap)  * (index%15)
				y = Math.floor(index / 15) * (Space.cardSize - Space.stackOffset) + Space.windowHeight/2

				break

			case this.stackContainer:
				// Deck is 0, discard is 1
				if (index === 0) x = Space.cardSize/2
				else x = Space.cardSize * 1.5 + Space.pad

				// My pile is 0, opponent's is 1
				if (owner === 0) y = 650 - Space.cardSize/2 - Space.pad
				else y = Space.cardSize/2 + Space.pad

				break
			
		}

	    return [x, y]
  	}

  	private addCardRecap(s: string, index: number, owner: number): Phaser.GameObjects.Text {
  		let [x, y] = this.getCardPosition(index, this.recapContainer, owner)
  		x -= Space.cardSize/2
  		
  		if (owner === 0) y += Space.cardSize/2 + Space.pad
  		else y -= Space.cardSize/2 + Space.pad

  		let txt = this.add.text(x, y, s, StyleSettings.small)
  		if (owner === 0) txt.setOrigin(0, 0)
  		else txt.setOrigin(0, 1)

  		this.recapContainer.add(txt)

  		this.temporaryObjs.push(txt)

  		return txt
  	}

  	private getRecapTotalText(recap: Recap): string {
  		let result = ''

  		let p1Done = false;
  		[1, 0].forEach( function(player) {
  			result += `${recap.sums[player]}`

  			if (recap.safety[player] > 0) {
  				result += `[${recap.safety[player]}]`
  			}

  			for (var i = 0; i < recap.wins[player]; i++) {
  				result += '*'
  			}

  			if (!p1Done) {
  				result += '\n\n'
  				p1Done = true
  			}
  		})

  		return result
  	}

  	private clickCard(index: number, card: CardImage, state: ClientState): () => void  {

  		let that = this
  		return function() {
  			// Mulligan functionality
  			// Toggle mulligan for the card
  			if (!state.mulligansComplete[0]) {
      			this.sound.play('click')

  				let highlight = that.mulliganHighlights[index]
  				highlight.setVisible(!highlight.visible)
  				return
  			}

  			// Non-mulligan, which can be in error for a variety of reasons
  			// Game is over
  			if (state.winner !== null) {
  				that.signalError('The game is over')
  			}
  			// Opponent still mulliganing
  			else if (!state.mulligansComplete[1]) {
  				that.signalError('Opponent is still mulliganing')
  			}
  			else if (that.recapPlaying) {
  				that.signalError('Recap is playing')
  			}
  			// Opponent's turn
  			else if (state.priority === 1) {
  				that.signalError("It's not your turn")
  			}
  			else if (card.unplayable) {
  				that.signalError('Not enough mana')
  			}
  			else {
  				// Animate the priority shifting to opponent
  				that.animatePriorityPass(0)

  				// Send a this card to its place in the story
  				let end = that.getCardPosition(state.story.acts.length, that.storyContainer, 0)

  				that.tweens.add({
  					targets: card.image,
  					x: end[0],
  					y: end[1],
  					duration: 500,
  					ease: "Sine.easeInOut",
  					onStart: function () {setTimeout(function() { that.net.playCard(index) }, 10)}
  					})

  				// Card played onStart for tween
  			}
  		}
  	}

  	// Disables the story hidden lock seen below
  	private clickAnywhere(): () => void {
  		let that = this
  		return function() {
  			let hiddenContainers = [
		  		that.deckContainer,
		  		that.discardContainer,
		  		that.opponentDeckContainer,
		  		that.opponentDiscardContainer,
		  		that.recapContainer]

	  		let highlightedObjects = [
		  		that.txtDeckSize,
		  		that.txtDiscardSize,
		  		that.txtOpponentDeckSize,
		  		that.txtOpponentDiscardSize,
		  		that.btnRecap]

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

  				highlightedObject.setShadow(2, 2, ColorSettings.textHighlight)
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
	    	s, StyleSettings.announcement).setOrigin(0.5, 0.5)

  		this.tweens.add({
  			targets: txt,
  			scale: 1.5,
  			// x: Space.scoresOffset,
  			duration: 500,
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

  	// NOTE Overwritten by Tutorial Scene
  	exitScene(): void {
  		this.net.closeSocket()
  		this.scene.start("BuilderScene")
  	}
}
