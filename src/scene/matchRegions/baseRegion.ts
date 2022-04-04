import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import ClientState from '../../lib/clientState'
import { Time } from '../../settings/settings'
import BaseScene from '../baseScene'


// Base region
export default class Region {
	container: Phaser.GameObjects.Container

	scene: BaseScene

	// All gameobjects that should be deleted before new state is shown
	temp: any[] = []

	addCard(card: Card, position: [number, number] = [0, 0]): CardImage {
		return new CardImage(card, this.container).setPosition(position)
	}

	// Display parts of the given state relevant to this region
	displayState(state: ClientState, isRecap: boolean): void {}

	show(): void {
		this.container.setVisible(true)
	}

	hide(): void {
		this.container.setVisible(false)
	}

	protected deleteTemp(): void {
		for (let i = 0; i < this.temp.length; i++) {
			this.temp[i].destroy()
		}
	}

	// Animate the given card being emphasized
	protected animateEmphasis(card: Card, position: [number, number], delay: number): void {
		// Create a new image of the card
		let cardImage = this.addCard(card, position).hide()

		// Animate moving x direction, appearing at start
		this.scene.tweens.add({
			targets: cardImage.container,
			alpha: 0,
			scale: 2,
			delay: delay,
			duration: Time.recapTweenWithPause(),
			onStart: function (tween, targets, _)
			{
				cardImage.show()
			},
			onComplete: function (tween, targets, _) {
				cardImage.destroy()
			}
		})
	}
}