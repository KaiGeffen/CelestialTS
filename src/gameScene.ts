import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";

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

	constructor() {
		super({
			key: "GameScene"
		})
	}

	init(params: any): void {
		// Connect with the server
		this.net = new Network(params.deck, this)
	}

	// Display the given game state
	displayState(state: ClientState): void {
		// Hands
		for (var i = state.hand.length - 1; i >= 0; i--) {
			this.addCard(state.hand[i], i)
		}
	}

	private addCard(card: Card, index: number): void {
		var image: Phaser.GameObjects.Image;
		var [x, y] = this.getCardPosition(index);

		image = this.add.image(x, y, card.name);
		image.setDisplaySize(100, 100);

		// image.setInteractive();
		// image.on('pointerdown', this.onClick(card), this);

		// this.container.add(image);

		// This enables hovertext etc
		new CardImage(card, image);
	}

	private getCardPosition(index: number): [number, number] {
    let col = index
    let xPad = (1 + col) * space.pad
    let x = col * space.cardSize + xPad + space.cardSize / 2

    let y = 0

    return [x, y]
  }

}