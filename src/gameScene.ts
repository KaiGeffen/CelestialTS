import "phaser";
import { collectibleCards, Card, cardback } from "./catalog/catalog";

import { Network } from "./net"
import ClientState from "./clientState"
import { CardImage, addCardInfoToScene } from "./cardImage"


const space = {
  cardSize: 100,
  pad: 20,
  cardsPerRow: 8,
  stackOffset: 30,
  stackOverlap: 40
}

export class GameScene extends Phaser.Scene {
	net
	cards: CardImage[]
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container
	storyContainer: Phaser.GameObjects.Container

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
	}

	create(): void {
		addCardInfoToScene(this)
	}

	// Display the given game state
	displayState(state: ClientState): void {
		// Remove all of the existing cards
		this.cards.forEach(cardImage => cardImage.destroy())

		// Hands
		for (var i = state.hand.length - 1; i >= 0; i--) {
			this.addCard(state.hand[i], i, this.handContainer)
		}
		for (var i = state.opponentHand - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}
		for (var i = state.story.acts.length - 1; i >= 0; i--) {
			let act = state.story.acts[i]

			this.addCard(act.card, i, this.storyContainer, act.owner)
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

				if (owner === 0) y = space.stackOffset * 2
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