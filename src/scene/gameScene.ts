import "phaser";
import { collectibleCards, Card, cardback } from "../catalog/catalog"

import { Network } from "../net"
import ClientState from "../lib/clientState"
import { CardImage, addCardInfoToScene } from "../lib/cardImage"
import { buttonStyle, textStyle, smallTextStyle, stylePassed, styleSizes, space } from "../settings"
import Recap from '../lib/recap'


const AUTO_RECAP_PARAM = 'ar'

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
		this.passContainer = this.add.container(1100 - space.pad, 650/2 - 40).setVisible(false)

		this.input.on('pointerdown', this.clickAnywhere(), this)
	}

	create(): void {
		// Middle line, below everything
		let midline = this.add.rectangle(0, 650/2, 1100, 20, 0xff0000, 0.4).setOrigin(0, 0.5)
		this.children.sendToBack(midline)

		// Priority highlight
		let height = space.cardSize + 2 * space.pad
		this.priorityRectangle = this.add.rectangle(0, -500, 1100, height, 0xffffff, 0.1).setOrigin(0, 0)

		// Vision highlight and text
		height = space.cardSize + 2 * space.stackOffset + 2 * space.pad
		this.visionRectangle = this.add.rectangle(0, 80, 1100, height, 0xffffff, 0.1).setOrigin(1, 0.5)
		this.txtVision = this.add.text(0, 80, '', smallTextStyle).setOrigin(0, 0.5)
		this.storyContainer.add([this.visionRectangle, this.txtVision])

		// Mulligan highlights and button
		this.mulligansComplete = false
		this.mulliganHighlights = []
		for (var i = 0; i < 3; i++) {
			let [x, y] = this.getCardPosition(i, this.handContainer, 0)
			let highlight = this.add.rectangle(x, y, 100, 140, 0xffaaaa, 1).setVisible(false)
			this.handContainer.add(highlight)
  			
  			this.mulliganHighlights.push(highlight)
		}
		
		this.txtOpponentMulligan = this.add.text(space.pad, 200, 'Opponent is still mulliganing...', stylePassed).setOrigin(0, 0.5)

		let btnMulligan = this.add.text(space.pad, 650 - 200, 'Mulligan', buttonStyle).setOrigin(0, 0.5)
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
    	let btnPass = this.add.text(0, 80, 'Pass', buttonStyle).setOrigin(1, 0.5)
    	this.passContainer.add(btnPass)
    	btnPass.setInteractive()

	    btnPass.on('pointerdown', function (event) {
	      that.net.passTurn()
	    })

	    // Mana text
	    this.manaText = this.add.text(1100 - space.pad,
	    	650 - 30 - space.cardSize - space.pad * 2,
	    	'', textStyle).setOrigin(1.0, 0.5)
	    this.opponentManaText = this.add.text(1100 - space.pad,
	    	30 + space.cardSize + space.pad * 2,
	    	'', textStyle).setOrigin(1.0, 0.5)

	    this.scoreText = this.add.text(1100 - space.pad,
	    	650 - 70 - space.cardSize - space.pad * 2,
	    	'', textStyle).setOrigin(1.0, 0.5)
	    this.opponentScoreText = this.add.text(1100 - space.pad,
	    	70 + space.cardSize + space.pad * 2,
	    	'', textStyle).setOrigin(1.0, 0.5)

	    // Status text
	    this.txtStatus = this.add.text(space.pad,
	    	650 - space.cardSize - space.pad * 2,
	    	'', textStyle).setOrigin(0, 1)
	    this.txtOpponentStatus = this.add.text(space.pad,
	    	space.cardSize + space.pad * 2,
	    	'', textStyle).setOrigin(0, 0)

	    this.txtPass = this.add.text(space.pad, 650 - 200, 'Passed', stylePassed).setVisible(false).setOrigin(0, 0.5)
	    this.txtOpponentPass = this.add.text(space.pad, 200, 'Passed', stylePassed).setVisible(false).setOrigin(0, 0.5)
	    
	    // Alternate views presented when hovering over/clicking any stacks
	    // TODO Make a method that replaces each of these sections, since they are all nearly identical
	    this.txtDeckSize = this.add.text(
	    	space.cardSize/2,
	    	650 - space.pad - space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtDeckSize.setInteractive()
	    this.txtDeckSize.on('pointerover', this.hoverAlternateView(this.deckContainer, this.txtDeckSize), this)
	    let hoverExit = this.hoverAlternateViewExit(this.deckContainer, this.txtDeckSize)
	    this.txtDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDeckSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    this.txtDiscardSize = this.add.text(
	    	space.cardSize*3/2 + space.pad,
	    	650 - space.pad - space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtDiscardSize.setInteractive()
	    this.txtDiscardSize.on('pointerover', this.hoverAlternateView(this.discardContainer, this.txtDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.discardContainer, this.txtDiscardSize)
	    this.txtDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtDiscardSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDeckSize = this.add.text(
	    	space.cardSize/2,
	    	space.pad + space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtOpponentDeckSize.setInteractive()
	    this.txtOpponentDeckSize.on('pointerover', this.hoverAlternateView(this.opponentDeckContainer, this.txtOpponentDeckSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDeckContainer, this.txtOpponentDeckSize)
	    this.txtOpponentDeckSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDeckSize.on('pointerdown', this.clickAlternateView(), this)

	    this.txtOpponentDiscardSize = this.add.text(
	    	space.cardSize*3/2 + space.pad,
	    	space.pad + space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtOpponentDiscardSize.setInteractive()
	    this.txtOpponentDiscardSize.on('pointerover', this.hoverAlternateView(this.opponentDiscardContainer, this.txtOpponentDiscardSize), this)
	    hoverExit = this.hoverAlternateViewExit(this.opponentDiscardContainer, this.txtOpponentDiscardSize)
	    this.txtOpponentDiscardSize.on('pointerout', hoverExit, this)
	    this.input.on('gameout', hoverExit, this)
	    this.txtOpponentDiscardSize.on('pointerdown', this.clickAlternateView(), this)
	    
	    let stacks = [this.txtDeckSize, this.txtDiscardSize, this.txtOpponentDeckSize, this.txtOpponentDiscardSize]
	    this.stackContainer.add(stacks)

	    let txtLastShuffleExplanation = this.add.text(
	    	space.pad, -(space.cardSize/2 + space.pad), "Opponent's last known shuffle:", textStyle)
	    txtLastShuffleExplanation.setOrigin(0, 1)
	    this.opponentDeckContainer.add(txtLastShuffleExplanation)

	    // Recap text and hidden text
	    this.txtRecapTotals = this.add.text(
	    	0, space.cardSize/2 + space.stackOffset, '', stylePassed).setOrigin(0, 0.5)
	    this.recapContainer.add(this.txtRecapTotals)

	    let btnRecap = this.add.text(0, 0, 'Recap', buttonStyle).setOrigin(1, 0.5)
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
			let style = {
	      		font: '70px Arial',
	      		color: '#f71'
			}
			this.searchingBackground = this.add.rectangle(0, 0, 1100, 650, 0x202070).setOrigin(0, 0)
			this.txtSearching = this.add.text(1100/2, 650/2, 'Searching for an opponent...', style).setOrigin(0.5, 0.5)
		}
		else if (this.searchingBackground) // Only destroy if they exist
		{
			this.searchingBackground.destroy()
			this.txtSearching.destroy()
		}
	}

	// Display the given game state
	displayState(state: ClientState, recap: Boolean = false): void {
		let start_of_a_round = state.story.acts.length === 0 && state.passes === 0 && state.maxMana[0] > 1

		if (recap){
			this.cameras.main.setBackgroundColor("#707070")
		}
		else
		{
			this.cameras.main.setBackgroundColor("#202070")
		}

		if (start_of_a_round && state.recap.stateList.length > 0) {
			let firstRecappedState = state.recap.stateList.shift()
			this.displayState(firstRecappedState, recap=true)

			let that = this
			setTimeout(function() {
				that.displayState(state)
			}, 1000)
			return
		}

		// Display victory / defeat
		if (state.winner === 0) {
			let txtResult = this.add.text(space.pad, 0, "You won!\n\nClick to continue...", stylePassed).setOrigin(0, 0)
			txtResult.setInteractive()
			txtResult.on('pointerdown', this.exitScene, this)
			this.storyContainer.add(txtResult)
		}
		else if (state.winner === 1)
		{
			let txtResult = this.add.text(space.pad, 0, "You lost!\n\nClick to continue...", stylePassed).setOrigin(0, 0)
			txtResult.setInteractive()
			txtResult.on('pointerdown', this.exitScene, this)
			this.storyContainer.add(txtResult)
		}

		// Reset the hover text in case the hovered card moved with object replacement
		cardInfo.text = ''

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
			if (!state.cardsPlayable[i]) cardImage.setUnplayable()
		}
		for (var i = state.opponentHandSize - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}

		// Story
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			this.addCard(act.card, i, this.storyContainer, act.owner)
		}

		// Recap
		let playList = state.recap.playList
		let x = 0
		for (var i = 0; i < playList.length; i++) {
			let owner = playList[i][1]

			this.addCard(playList[i][0], i, this.recapContainer, owner)
			x = this.addCardRecap(playList[i][2], i, owner).x + space.cardSize
		}
		this.txtRecapTotals.setX(x + space.pad)
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
			this.txtDiscardSize.setText(state.discard[0].length.toString())
		} else this.txtDiscardSize.setText('')
		
		if (state.discard[1].length > 0) {
			this.addCard(state.discard[1].slice(-1)[0], 1, this.stackContainer, 1)
			this.txtOpponentDiscardSize.setText(state.discard[1].length.toString())
		} else this.txtOpponentDiscardSize.setText('')

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

			let x = this.getCardPosition(state.vision, this.storyContainer, 0)[0] - space.cardSize/2
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
		if (this.autoRecap && start_of_a_round) {
			this.hoverAlternateView(this.recapContainer, this.btnRecap)()
			this.clickAlternateView()()
		}
	}

	// Alert the user that they have taken an illegal or impossible action
	signalError(): void {
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

		image.on('pointerdown', this.clickCard(index), this)

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
				let xPad = (1 + index) * space.pad
				x = index * space.cardSize + xPad + space.cardSize/2

				y = space.pad + space.cardSize/2
				break

			case this.recapContainer:
			case this.storyContainer:
				let filledSpace = index * (space.cardSize - space.stackOverlap)
				x = space.pad + space.cardSize/2 + filledSpace

				if (owner === 1) {
					y = space.cardSize/2
				} else {
					y = space.cardSize/2 + space.stackOffset * 2
				}
				break

			case this.deckContainer:
			case this.discardContainer:
			case this.opponentDeckContainer:
			case this.opponentDiscardContainer:
				// Each row contains 15 cards, then next row of cards is below with some overlap
				x = space.pad + space.cardSize/2 + (space.cardSize - space.stackOverlap)  * (index%15)
				y = Math.floor(index / 15) * (space.cardSize - space.stackOffset)

				break

			case this.stackContainer:
				// Deck is 0, discard is 1
				if (index === 0) x = space.cardSize/2
				else x = space.cardSize * 1.5 + space.pad

				// My pile is 0, opponent's is 1
				if (owner === 0) y = 650 - space.cardSize/2 - space.pad
				else y = space.cardSize/2 + space.pad

				break
			
		}

	    return [x, y]
  	}

  	private addCardRecap(s: string, index: number, owner: number): Phaser.GameObjects.Text {
  		let [x, y] = this.getCardPosition(index, this.recapContainer, owner)
  		x -= space.cardSize/2
  		
  		if (owner === 0) y += space.cardSize/2 + space.pad
  		else y -= space.cardSize/2 + space.pad

  		let txt = this.add.text(x, y, s, smallTextStyle)
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
  			if (that.mulligansComplete) {
  				that.net.playCard(index)
  			}
  			else
  			{
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
	  			hiddenContainers.forEach(c => c.setVisible(false))
	  			highlightedObjects.forEach(o => o.setShadow())
	  			that.storyContainer.setVisible(true)

  				storyHiddenLock = false
  			}
  		}
  	}

  	private clickAlternateView(): () => void {
  		let time = this.time
  		return function() {
  			if (!storyHiddenLock) {
  				time.delayedCall(1, () => storyHiddenLock = true)
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

  				highlightedObject.setShadow(2, 2, '#ff0')
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
