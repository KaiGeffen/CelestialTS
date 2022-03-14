import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import ClientState from '../../lib/clientState'


// Base region
export default class Region {
	container: Phaser.GameObjects.Container

	// Function called when elements in this region are interacted with
	callback: (args: any) => () => void

	addCard(card: Card, position: [number, number] = [0, 0]): CardImage {
		return new CardImage(card, this.container).setPosition(position)
	}

	// Display parts of the given state relevant to this region
	displayState(state: ClientState): void {}

	setCallback(f: (args: any) => () => void) {}
}