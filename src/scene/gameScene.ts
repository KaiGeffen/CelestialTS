import "phaser";
import { collectibleCards, Card, cardback } from "../catalog/catalog"

import { Network } from "../net"
import ClientState from "../lib/clientState"
import { CardImage, addCardInfoToScene } from "../lib/cardImage"
// Import Settings itself 
import { ColorSettings, StyleSettings, Space } from "../settings"
import Recap from '../lib/recap'


const AUTO_RECAP_PARAM = 'ar'
const RECAP_TIME = 1000

var cardInfo: Phaser.GameObjects.Text

var storyHiddenLock: boolean = false

export class GameScene extends Phaser.Scene {
	net: Network
	// Objects (CardImages and text) that will be removed before displaying a new state
	temporaryObjs

	searchingBackground: Phaser.GameObjects.Rectangle
	txtSearching: Phaser.GameObjects.Text

	mulligansComplete: Boolean
	mulliganHighlights: Phaser.GameObjects.Rectangle[]
	txtOpponentMulligan: Phaser.GameObjects.Text
	
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	deckContainer: Phaser.GameObjects.Container
	discardContainer: Phaser.GameObjects.Container
	opponentDeckContainer: Phaser.GameObjects.Container
	opponentDiscardContainer: Phaser.GameObjects.Container

	storyContainer: Phaser.GameObjects.Container
	stackContainer: Phaser.GameObjects.Container
	recapContainer: Phaser.GameObjects.Container
	passContainer: Phaser.GameObjects.Container

	priorityRectangle: Phaser.GameObjects.Rectangle
	visionRectangle: Phaser.GameObjects.Rectangle
	txtVision: Phaser.GameObjects.Text

	manaText: Phaser.GameObjects.Text
	opponentManaText: Phaser.GameObjects.Text
	scoreText: Phaser.GameObjects.Text
	opponentScoreText: Phaser.GameObjects.Text

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

	// Option to show the recap after a round ends
	autoRecap: boolean

	constructor() {
		super({
			key: "GameScene"
		})
	}

	init(params: any): void {
		// Game settings from deckbuilder
	    this.autoRecap = params.settings['autoRecap']
		// Code to matchmake player with ('ai' if versus computer)
	    let mmCode = params.settings['mmCode']
	    if (params.settings['vsAi']) mmCode = 'ai'

		// Connect with the server
		this.net = new Network(params.deck, this, mmCode)

		// Make a list of objects that are temporary with game state
		this.temporaryObjs = []

		this.handContainer = this.add.container(0, 650 - 140)
		this.opponentHandContainer = this.add.container(0, 0)
		this.deckContainer = this.add.container(0, 650/2).setVisible(false)
		this.discardContainer = this.add.container(0, 650/2).setVisible(false)
		this.opponentDiscardContainer = this.add.container(0, 650/2).setVisible(false)
		this.opponentDeckContainer = this.add.container(0, 650/2).setVisible(false)

		this.recapContainer = this.add.container(0, 650/2 - 80).setVisible(false)
		this.storyContainer = this.add.container(0, 650/2 - 80)
		this.stackContainer = this.add.container(800, 0)
		this.passContainer = this.add.container(1100 - Space.pad, 650/2 - 40).setVisible(false)

		this.input.on('pointerdown', this.clickAnywhere(), this)
	}

	create(): void {
		// Middle line, below everything
		let midline = this.add.rectangle(0, 650/2, 1100, 20, ColorSettings.middleLine, 1).setOrigin(0, 0.5)
		this.children.sendToBack(midline)

		// Priority highlight
		let height = Space.cardSize + 2 * Space.pad
		this.priorityRectangle = this.add.rectangle(0, -500, 1100, height, 0xffffff, 0.1).setOrigin(0, 0)

		// Vision highlight and text
		height = Space.cardSize + 2 * Space.stackOffset + 2 * Space.pad
		this.visionRectangle = this.add.rectangle(0, 80, 1100, height, 0xffffff, 0.1).setOrigin(1, 0.5)
		this.txtVision = this.add.text(0, 80, '', StyleSettings.small).setOrigin(0, 0.5)
		this.storyContainer.add([this.visionRectangle, this.txtVision])

		// Mulligan highlights and button
		this.mulligansComplete = false
		this.mulliganHighlights = []
		for (var i = 0; i < 3; i++) {
			let [x, y] = this.getCardPosition(i, this.handContainer, 0)
			let highlight = this.add.rectangle(x, y, 100, 140, ColorSettings.mulliganHighlight, 1).setVisible(false)
			this.handContainer.add(highlight)
  			
  			this.mulliganHighlights.push(highlight)
		}
		
		this.txtOpponentMulligan = this.add.text(Space.announceOffset, 200, 'Opponent is still mulliganing...', StyleSettings.announcement).setOrigin(1, 0.5)

		let x = Space.pad * 2 + Space.cardSize * 1.5
		let btnMulligan = this.add.text(x, 650 - 200, 'Mulligan', StyleSettings.button).setOrigin(0.5, 0.5)
		btnMulligan.setInteractive()

		let that = this
		btnMulligan.on('pointerdown', function (event) {
			let mulligans = ''
			for (var i = 0; i < that.mulliganHighlights.length; i++) {
				if (that.mulliganHighlights[i].visible) mulligans += '1'
				else mulligans += '0'
			}

			that.net.doMulligan(mulligans)

			// Remove all mulligan objects
			that.mulliganHighlights.forEach(o => o.destroy())
			btnMulligan.destroy()
			that.mulligansComplete = true
		})

		// Pass button
    	let btnPass = this.add.text(0, 80, 'Pass', StyleSettings.button).setOrigin(1, 0.5)
    	this.passContainer.add(btnPass)
    	btnPass.setInteractive()

	    btnPass.on('pointerdown', function (event) {
	    	if (!that.recapPlaying) {
	    		that.net.passTurn()
	    	}
	    })

	    // Mana text
	    this.manaText = this.add.text(1100 - Space.pad,
	    	650 - 30 - Space.cardSize - Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)
	    this.opponentManaText = this.add.text(1100 - Space.pad,
	    	30 + Space.cardSize + Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)

	    this.scoreText = this.add.text(1100 - Space.pad,
	    	650 - 70 - Space.cardSize - Space.pad * 2,
	    	'', StyleSettings.basic).setOrigin(1.0, 0.5)
	    this.opponentScoreText = this.add.text(1100 - Space.pad,
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
	    	Space.pad, -(Space.cardSize/2 + Space.pad), "Opponent's last known shuffle:", StyleSettings.basic)
	    txtLastShuffleExplanation.setOrigin(0, 1)
	    this.opponentDeckContainer.add(txtLastShuffleExplanation)

	    // Scores text for recap states, same as below text but viewed when recalling recap states
	    this.txtScores = this.add.text(
	    	Space.scoresOffset, Space.cardSize/2 + Space.stackOffset, '', StyleSettings.announcement).setOrigin(0.5, 0.5)
	    this.storyContainer.add(this.txtScores)

	    // Recap text and hidden text
	    this.txtRecapTotals = this.add.text(
	    	Space.scoresOffset, Space.cardSize/2 + Space.stackOffset, '', StyleSettings.announcement).setOrigin(0.5, 0.5)
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

	    // Add card info here so that it's on top of other GameObjects
	    cardInfo = addCardInfoToScene(this)
	}

	// Display searching for opponent if still looking, else remove that text
	displaySearchingStatus(searching: boolean): void {
		if (searching) {
			this.searchingBackground = this.add.rectangle(0, 0, 1100, 650, ColorSettings.background).setOrigin(0, 0)
			this.txtSearching = this.add.text(1100/2, 650/2, 'Searching for an opponent...', StyleSettings.announcement).setOrigin(0.5, 0.5)
		}
		else {
			this.sound.play('success')

			if (this.searchingBackground) // Only destroy if they exist
			{
				this.searchingBackground.destroy()
				this.txtSearching.destroy()
			}
		}
	}

	// If a recap of states is playing, wait to show the new state until after it has finished
	recapPlaying: Boolean = false
	queuedState: ClientState = undefined
	// Display the given game state
	displayState(state: ClientState, recap: Boolean = false): void {
		let that = this
		let isRoundStart = state.story.acts.length === 0 && state.passes === 0

		// If currently watching a recap, change the colors and display scores
		if (recap)
		{
			this.cameras.main.setBackgroundColor(ColorSettings.recapBackground)

			let s = `${state.score[1]}\n\n${state.score[0]}`
			this.txtScores.setText(s)
		}
		// Queue this for after recap finishes
		else if (this.recapPlaying)
		{
			this.queuedState = state
			return
		}
		// Display this non-recap state, with normal background and no scores displayed
		else
		{
			// TODO Sometimes this should happen even in a recap, such is if a card is discarded
			// Reset the hover text in case the hovered card moved with object replacement
			cardInfo.setVisible(false)

			this.cameras.main.setBackgroundColor(ColorSettings.background)
			this.txtScores.setText('')

			// If a round just ended, recap each state that the game was in throughout the story
			let numberStates = state.recap.stateList.length
			if (isRoundStart && numberStates > 0) {
				this.recapPlaying = true
				
				// Display each recapped state
				for (var i = 0; i < numberStates; i++) {
					let delayBeforeDisplay = i * RECAP_TIME
					let recapState = state.recap.stateList[i]

					setTimeout(function() {
						that.displayState(recapState, recap=true)
					}, delayBeforeDisplay)
				}

				// Display this state without any recapped states
				setTimeout(function() {
					that.recapPlaying = false

					if (that.queuedState !== undefined) {
						that.displayState(that.queuedState)
						that.queuedState = undefined
					} else {
						state.recap.stateList = []
						that.displayState(state)
					}
				}, numberStates * RECAP_TIME)
				return
			}
		}

		// Play whatever sound this new state brings
		if (state.soundEffect !== null) {
			this.sound.play(state.soundEffect)
		}

		// Display victory / defeat
		if (state.winner === 0 && !recap) {
			let txtResult = this.add.text(Space.pad, Space.stackOverlap * 2, "You won!\n\nClick to continue...", StyleSettings.announcement).setOrigin(0, 0.5)
			txtResult.setInteractive()
			txtResult.on('pointerdown', this.exitScene, this)
			this.storyContainer.add(txtResult)
		}
		else if (state.winner === 1 && !recap) {
			let txtResult = this.add.text(Space.pad, Space.stackOverlap * 2, "You lost!\n\nClick to continue...", StyleSettings.announcement).setOrigin(0, 0.5)
			txtResult.setInteractive()
			txtResult.on('pointerdown', this.exitScene, this)
			this.storyContainer.add(txtResult)
		}

		// Remove all of the existing cards
		this.temporaryObjs.forEach(obj => obj.destroy())
		this.temporaryObjs = []

		// Autopass - TODO Remove or have a setting for Autopass
		if (state.hand.length === 0 && state.priority === 0) this.net.passTurn();

		// Mulligan
		this.txtOpponentMulligan.setVisible(!state.mulligansComplete[1])
		this.passContainer.setVisible(!state.mulligansComplete.includes(false))

		// Hands
		for (var i = state.hand.length - 1; i >= 0; i--) {
			let cardImage = this.addCard(state.hand[i], i, this.handContainer)

			// TODO Immediately play a sound based on if it's playable, and ignore the next sound from server (Immediate card sound)
			if (!state.cardsPlayable[i]) {
				cardImage.setUnplayable()
			}

			// Play the card if it's clicked on (Even if unplayable, will signal error)
			cardImage.image.on('pointerdown', this.clickCard(i), this)
		}
		for (var i = state.opponentHandSize - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}

		// Story
		let numActsCompleted = 0
		if (recap) {
			numActsCompleted = state.recap.playList.length

			for (var i = 0; i < numActsCompleted; i++) {
				let completedAct: [Card, number, string] = state.recap.playList[i]
				let card = completedAct[0]
				let owner = completedAct[1]

				this.addCard(card, i, this.storyContainer, owner).setTransparent()
			}
		}
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			let storyIndex = i + numActsCompleted
			this.addCard(act.card, storyIndex, this.storyContainer, act.owner)
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
		this.addCard(cardback, 0, this.stackContainer, 0)
		this.txtDeckSize.setText(state.deck.length.toString())

		this.txtOpponentDeckSize.setText(state.opponentDeckSize.toString())
		this.addCard(cardback, 0, this.stackContainer, 1)	

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

		this.stackContainer.bringToTop(this.txtDeckSize)
		this.stackContainer.bringToTop(this.txtOpponentDeckSize)
		this.stackContainer.bringToTop(this.txtDiscardSize)
		this.stackContainer.bringToTop(this.txtOpponentDiscardSize)

		// Priority
		if (state.priority === 1) { this.priorityRectangle.setY(0) }
		else { this.priorityRectangle.setY(650 - 140) }

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
		this.manaText.setText(`Mana: ${state.mana}/${state.maxMana[0]}`)
		this.opponentManaText.setText(`Mana: ?/${state.maxMana[1]}`)

		// Status
		this.txtStatus.setText(state.status)
		this.txtOpponentStatus.setText(state.opponentStatus)

		// Score
		this.scoreText.setText(`Score: ${state.wins[0]}`)
		this.opponentScoreText.setText(`Score: ${state.wins[1]}`)

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

		// If the round just started, show the recap
		// if (this.autoRecap && isRoundStart && !recap && state.maxMana[0] > 1) {
		// 	this.hoverAlternateView(this.recapContainer, this.btnRecap)()
		// 	this.clickAlternateView()()
		// }
	}

	// Alert the user that they have taken an illegal or impossible action
	signalError(): void {
      	this.sound.play('failure')

		this.cameras.main.flash(300, 0, 0, 0.1)
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
				break

			case this.recapContainer:
			case this.storyContainer:
				let filledSpace = index * (Space.cardSize - Space.stackOverlap)
				x = Space.pad + Space.cardSize/2 + filledSpace

				if (owner === 1) {
					y = Space.cardSize/2
				} else {
					y = Space.cardSize/2 + Space.stackOffset * 2
				}
				break

			case this.deckContainer:
			case this.discardContainer:
			case this.opponentDeckContainer:
			case this.opponentDiscardContainer:
				// Each row contains 15 cards, then next row of cards is below with some overlap
				x = Space.pad + Space.cardSize/2 + (Space.cardSize - Space.stackOverlap)  * (index%15)
				y = Math.floor(index / 15) * (Space.cardSize - Space.stackOffset)

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

  	private clickCard(index: number): () => void  {

  		let that = this
  		return function() {
  			if (that.recapPlaying) {
  				that.signalError()
  			}
  			else if (that.mulligansComplete) {
  				that.net.playCard(index)
  			}
  			else {
      			this.sound.play('click')

  				let highlight = that.mulliganHighlights[index]
  				highlight.setVisible(!highlight.visible)
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

  	private exitScene(): void {
  		this.net.closeSocket()
  		this.scene.start("BuilderScene")
  	}
}
