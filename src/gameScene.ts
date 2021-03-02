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
	net;
	handContainer: Phaser.GameObjects.Container
	opponentHandContainer: Phaser.GameObjects.Container

	constructor() {
		super({
			key: "GameScene"
		})
	}

	init(params: any): void {
		// Connect with the server
		this.net = new Network(params.deck, this)
		this.handContainer = this.add.container(0, 650 - 140)
		this.opponentHandContainer = this.add.container(0, 0)
	}

	create(): void {
		addCardInfoToScene(this)
	}

	// Display the given game state
	displayState(state: ClientState): void {
		// Hands
		for (var i = state.hand.length - 1; i >= 0; i--) {
			this.addCard(state.hand[i], i, this.handContainer)
		}
		for (var i = state.opponentHand - 1; i >= 0; i--) {
			this.addCard(cardback, i, this.opponentHandContainer)
		}
	}

	private addCard(card: Card, index: number, container: Phaser.GameObjects.Container): void {
		var image: Phaser.GameObjects.Image;
		var [x, y] = this.getCardPosition(index, container);

		image = this.add.image(x, y, card.name);
		image.setDisplaySize(100, 100);

		// image.setInteractive();
		// image.on('pointerdown', this.onClick(card), this);

		container.add(image);

		// This enables hovertext etc
		new CardImage(card, image);
	}

	private getCardPosition(index: number, container): [number, number] {
		let x = 0
		let y = 0

		switch (container) {
			case this.handContainer:
			case this.opponentHandContainer:
				let col = index
				let xPad = (1 + col) * space.pad
				x = col * space.cardSize + xPad + space.cardSize/2

				y = space.pad + space.cardSize/2
				break;
			
		}
	    

	    return [x, y]
  	}

}