import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import ClientState from '../../lib/clientState'


// Base region
export default class Region {
	container: Phaser.GameObjects.Container

	// All gameobjects that should be deleted before new state is shown
	temp: any[] = []

	// Function called when elements in this region are interacted with
	callback: (args: any) => () => void

	addCard(card: Card, position: [number, number] = [0, 0]): CardImage {
		return new CardImage(card, this.container).setPosition(position)
	}

	// Display parts of the given state relevant to this region
	displayState(state: ClientState): void {}

	setCallback(f: (args: any) => () => void) {}

	protected deleteTemp(): void {
		for (let i = 0; i < this.temp.length; i++) {
			this.temp[i].destroy()
		}
	}
}