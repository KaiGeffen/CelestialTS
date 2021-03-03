import "phaser";
import { collectibleCards, Card, cardback } from "./catalog/catalog";

import { Network } from "./net"
import ClientState from "./clientState"
import { CardImage, addCardInfoToScene } from "./cardImage"
import { buttonStyle, textStyle, stylePassed, space } from "./settings"


var cardInfo: Phaser.GameObjects.Text

export class GameScene extends Phaser.Scene {
	net: Network
	cards: CardImage[]
	
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	storyContainer: Phaser.GameObjects.Container

	priorityRectangle: Phaser.GameObjects.Rectangle
	manaText: Phaser.GameObjects.Text
	opponentManaText: Phaser.GameObjects.Text
	scoreText: Phaser.GameObjects.Text
	opponentScoreText: Phaser.GameObjects.Text

	txtPass: Phaser.GameObjects.Text
	txtOpponentPass: Phaser.GameObjects.Text
	

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
		this.storyContainer = this.add.container(0, 650/2 - 80)

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
    	let btnPass = this.add.text(1000, 325, 'Pass', buttonStyle)
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
		for (var i = state.opponentHand - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}

		// Story TODO reverse order
		for (var i = 0; i < state.story.acts.length; i++) {
			let act = state.story.acts[i]

			this.addCard(act.card, i, this.storyContainer, act.owner)
		}

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
		image.setDisplaySize(100, 100);

		// TODO Remove this line
		image.setInteractive()
		image.on('pointerdown', this.clickCard(index), this)

		container.add(image);

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

			
		}
	    

	    return [x, y]
  	}

  	private clickCard(index: number): () => void  {
  		let net = this.net
  		return function() {
  			net.playCard(index)
  		}
  	}
}