import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";

import { Network } from "./net"
import ClientState from "./clientState"
import { CardImage, addCardInfoToScene } from "./cardImage"


export class GameScene extends Phaser.Scene {
	// net;

	constructor() {
		super({
			key: "GameScene"
		})
	}

	// init(params: any): void {
	// 	// Connect with the server
	// 	this.net = new Network(params.deck, this)
	// }

	// // Display the given game state
	// displayState(state: ClientState): void {
	// 	for (var i = state.hand.length - 1; i >= 0; i--) {
	// 		this.addCard(state.hand[i], i)
	// 	}
	// }

	// private addCard(card: Card, index: number): void {
	// 	var image: Phaser.GameObjects.Image;
	// 	var [x, y] = this.getCardPosition(index);

	// 	image = this.add.image(x, y, card.name);
	// 	image.setDisplaySize(100, 100);

	// 	image.setInteractive();
	// 	image.on('pointerdown', this.onClick(card), this);

	// 	this.container.add(image);

	// 	// TODO Use this maybe
	// 	new CardImage(card, image);
	// }

}