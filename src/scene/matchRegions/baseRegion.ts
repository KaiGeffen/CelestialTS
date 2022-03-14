import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'


// Base region
export default class Region {
	container: Phaser.GameObjects.Container

	addCard(card: Card, position: [number, number] = [0, 0]): CardImage {
		return new CardImage(card, this.container).setPosition(position)
	}
}