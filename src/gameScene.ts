import "phaser";
import { collectibleCards, Card, cardback } from "./catalog/catalog";

import { Network } from "./net"
import ClientState from "./clientState"
import { CardImage, addCardInfoToScene } from "./cardImage"
import { buttonStyle, textStyle, stylePassed, styleSizes, space } from "./settings"


var cardInfo: Phaser.GameObjects.Text

export class GameScene extends Phaser.Scene {
	net: Network
	cards: CardImage[]
	
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	deckContainer: Phaser.GameObjects.Container
	discardContainer: Phaser.GameObjects.Container
	opponentDiscardContainer: Phaser.GameObjects.Container
	storyContainer: Phaser.GameObjects.Container
	stackContainer: Phaser.GameObjects.Container
	opponentStackContainer: Phaser.GameObjects.Container // TODO remove

	priorityRectangle: Phaser.GameObjects.Rectangle
	manaText: Phaser.GameObjects.Text
	opponentManaText: Phaser.GameObjects.Text
	scoreText: Phaser.GameObjects.Text
	opponentScoreText: Phaser.GameObjects.Text

	txtPass: Phaser.GameObjects.Text
	txtOpponentPass: Phaser.GameObjects.Text
	txtDeckSize: Phaser.GameObjects.Text
	txtOpponentDeckSize: Phaser.GameObjects.Text
	txtDiscardSize: Phaser.GameObjects.Text
	txtOpponentDiscardSize: Phaser.GameObjects.Text

	constructor() {
		super({
			key: "GameScene"
		})
	}

	init(params: any): void {
		// Connect with the server
		this.net = new Network(params.deck, this)
		this.cards = []

		this.handContainer = this.add.container(0, 650 - 140)
		this.opponentHandContainer = this.add.container(0, 0)
		this.deckContainer = this.add.container(0, 650/2).setVisible(false)
		this.discardContainer = this.add.container(0, 650/2).setVisible(false)
		this.opponentDiscardContainer = this.add.container(0, 650/2).setVisible(false)
		this.storyContainer = this.add.container(0, 650/2 - 80)
		this.stackContainer = this.add.container(680, 0)

		let height = space.cardSize + 2 * space.pad
		this.priorityRectangle = this.add.rectangle(0, -500, 1100, height, 0xffffff, 0.1)
		this.priorityRectangle.setOrigin(0, 0)
	}

	create(): void {
		// Middle line, below everything
		let midline = this.add.rectangle(0, 650/2, 1100, 20, 0xff0000, 0.4).setOrigin(0)
		this.children.sendToBack(midline)

		cardInfo = addCardInfoToScene(this)

		// Pass button
    	let btnPass = this.add.text(1100 - space.pad, 650/2, 'Pass', buttonStyle).setOrigin(1, 0.5)
    	btnPass.setInteractive()

	    let net = this.net
	    btnPass.on('pointerdown', function (event) {
	      net.passTurn()
	    })

	    this.manaText = this.add.text(1100 - space.pad, 650 - 30, '', textStyle).setOrigin(1.0, 0.5)
	    this.opponentManaText = this.add.text(1100 - space.pad, 30, '', textStyle).setOrigin(1.0, 0.5)

	    this.scoreText = this.add.text(1100 - space.pad, 650 - 70, '', textStyle).setOrigin(1.0, 0.5)
	    this.opponentScoreText = this.add.text(1100 - space.pad, 70, '', textStyle).setOrigin(1.0, 0.5)

	    this.txtPass = this.add.text(space.pad, 200, 'Passed', stylePassed).setVisible(false).setOrigin(0, 0.5)
	    this.txtOpponentPass = this.add.text(space.pad, 650 - 200, 'Passed', stylePassed).setVisible(false).setOrigin(0, 0.5)
	    
	    this.txtDeckSize = this.add.text(
	    	space.cardSize/2,
	    	650 - space.pad - space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtDeckSize.setInteractive()
	    this.txtDeckSize.on('pointerover', this.hoverDeck(), this)
	    this.txtDeckSize.on('pointerout', this.hoverDeckExit(), this)
	    
	    this.txtDiscardSize = this.add.text(
	    	space.cardSize*3/2 + space.pad,
	    	650 - space.pad - space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtDiscardSize.setInteractive()
	    this.txtDiscardSize.on('pointerover', this.hoverDiscard(0), this)
	    this.txtDiscardSize.on('pointerout', this.hoverDiscardExit(0), this)

	    this.txtOpponentDeckSize = this.add.text(
	    	space.cardSize/2,
	    	space.pad + space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtOpponentDiscardSize = this.add.text(
	    	space.cardSize*3/2 + space.pad,
	    	space.pad + space.cardSize/2,
	    	'', styleSizes).setOrigin(0.5, 0.5)
	    this.txtOpponentDiscardSize.setInteractive()
	    this.txtOpponentDiscardSize.on('pointerover', this.hoverDiscard(1), this)
	    this.txtOpponentDiscardSize.on('pointerout', this.hoverDiscardExit(1), this)
	    
	    let stacks = [this.txtDeckSize, this.txtDiscardSize, this.txtOpponentDeckSize, this.txtOpponentDiscardSize]
	    this.stackContainer.add(stacks)
	}

	// Display the given game state
	displayState(state: ClientState): void {
		cardInfo.text = ''

		// Remove all of the existing cards
		this.cards.forEach(cardImage => cardImage.destroy())
		this.cards = []

		// Hands
		for (var i = state.hand.length - 1; i >= 0; i--) {
			this.addCard(state.hand[i], i, this.handContainer)
		}
		for (var i = state.opponentHandSize - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}

		// Story
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			this.addCard(act.card, i, this.storyContainer, act.owner)
		}

		// Deck, discard piles
		for (var i = state.deck.length - 1; i >= 0; i--) {
			this.addCard(state.deck[i], i, this.deckContainer)
		}
		for (var i = state.discard[0].length - 1; i >= 0; i--) {
			this.addCard(state.discard[0][i], i, this.discardContainer)
		}
		for (var i = state.discard[1].length - 1; i >= 0; i--) {
			this.addCard(state.discard[1][i], i, this.opponentDiscardContainer)
		}

		// Stacks
		if (state.deck.length > 0) {
			this.addCard(cardback, 0, this.stackContainer, 0)
			this.txtDeckSize.setText(state.deck.length.toString())
		} else this.txtDeckSize.setText('')

		if (state.opponentDeckSize > 0) {
			this.addCard(cardback, 0, this.stackContainer, 1)
			this.txtOpponentDeckSize.setText(state.opponentDeckSize.toString())
		} else this.txtOpponentDeckSize.setText('')

		if (state.discard[0].length > 0) {
			this.addCard(state.discard[0][0], 1, this.stackContainer, 0)
			this.txtDiscardSize.setText(state.discard[0].length.toString())
		} else this.txtDiscardSize.setText('')
		
		if (state.discard[1].length > 0) {
			this.addCard(state.discard[1][0], 1, this.stackContainer, 1)
			this.txtOpponentDiscardSize.setText(state.discard[1].length.toString())
		} else this.txtOpponentDiscardSize.setText('')

		this.stackContainer.bringToTop(this.txtDeckSize)
		this.stackContainer.bringToTop(this.txtOpponentDeckSize)
		this.stackContainer.bringToTop(this.txtDiscardSize)
		this.stackContainer.bringToTop(this.txtOpponentDiscardSize)

		// Priority
		if (state.priority === 1) { this.priorityRectangle.setY(0) }
		else { this.priorityRectangle.setY(650 - 140) }

		// Mana
		this.manaText.setText(`Mana: ${state.mana}/${state.maxMana[0]}`)
		this.opponentManaText.setText(`Mana: ?/${state.maxMana[1]}`)

		// Score
		this.scoreText.setText(`Score: ${state.wins[0]}`)
		this.opponentScoreText.setText(`Score: ${state.wins[1]}`)

		// Passes
		if (state.passes === 0) {
			this.txtPass.setVisible(false)
			this.txtOpponentPass.setVisible(false)
		} else if (state.priority === 0) {
			this.txtPass.setVisible(true)
			this.txtOpponentPass.setVisible(false)
		} else {
			this.txtPass.setVisible(false)
			this.txtOpponentPass.setVisible(true)
		}

	}

	private addCard(card: Card,
					index: number,
					container: Phaser.GameObjects.Container,
					owner: number = 0): void {
		var image: Phaser.GameObjects.Image;
		var [x, y] = this.getCardPosition(index, container, owner)

		image = this.add.image(x, y, card.name);
		image.setDisplaySize(100, 100)

		// TODO Remove this line
		image.setInteractive()
		image.on('pointerdown', this.clickCard(index), this)

		container.add(image)

		this.cards.push(new CardImage(card, image))
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
			case this.opponentDiscardContainer:
				x = space.pad + space.cardSize/2 + (space.cardSize - space.stackOverlap)  * index
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

  	private clickCard(index: number): () => void  {
  		let net = this.net
  		return function() {
  			net.playCard(index)
  		}
  	}

  	private hoverDeck(): () => void {
  		let deckC = this.deckContainer
  		let storyC = this.storyContainer
  		return function() {
  			deckC.setVisible(true)
  			storyC.setVisible(false)
  		}
  	}

  	private hoverDeckExit(): () => void {
  		let deckC = this.deckContainer
  		let storyC = this.storyContainer
  		return function() {
  			deckC.setVisible(false)
  			storyC.setVisible(true)
  		}
  	}

  	private hoverDiscard(owner: number): () => void {
  		let discardC = undefined
  		if (owner === 0) discardC = this.discardContainer;
  		else discardC = this.opponentDiscardContainer

  		let storyC = this.storyContainer
  		return function() {
  			discardC.setVisible(true)
  			storyC.setVisible(false)
  		}
  	}

  	private hoverDiscardExit(owner: number): () => void {
  		let discardC = undefined
  		if (owner === 0) discardC = this.discardContainer;
  		else discardC = this.opponentDiscardContainer

  		let storyC = this.storyContainer
  		return function() {
  			discardC.setVisible(false)
  			storyC.setVisible(true)
  		}
  	}
}