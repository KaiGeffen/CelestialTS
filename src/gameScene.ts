import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";

export class GameScene extends Phaser.Scene {
	net;

	constructor() {
		super({
			key: "GameScene"
		});
	}

	init(deck: Card[]): void {
		// Encode the cards
		
		
		// Connect with the server
		// Display game state
	}

}