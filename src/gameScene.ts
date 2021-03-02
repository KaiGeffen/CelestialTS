import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";

import { Network } from "./net"

export class GameScene extends Phaser.Scene {
	net;

	constructor() {
		super({
			key: "GameScene"
		})
	}

	init(params: any): void {
		// Connect with the server
		this.net = new Network(params.deck)

		// Send the decklist


		// Display game state
	}

}