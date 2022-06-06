import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import ClientState from '../../lib/clientState'
import { Time, Space, Color, Depth } from '../../settings/settings'
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

	// Bring attention to the given region by hiding everything else on screen
	focus(): void {
		const x = -this.container.x
		const y = -this.container.y
		let background = this.scene.add.rectangle(x, y, Space.windowWidth, Space.windowHeight, Color.focusBackground, 0.6)
		.setOrigin(0)
		.setInteractive()
		
		this.container.add(background)
		this.container.sendToBack(background)

		// Remember the depth of this container in the callback
		const depth = this.container.depth
		background.on('pointerdown', () => {
			this.container.setDepth(depth)
			background.destroy()
		})

		// Move this container above all others
		this.container.setDepth(Depth.aboveAll)
	}

	protected deleteTemp(): void {
		for (let i = 0; i < this.temp.length; i++) {
			this.temp[i].destroy()
		}
	}

	// Animate the given card being emphasized
	protected animateEmphasis(card: CardImage, delay: number): void {
		card.hide()

		// Animate moving x direction, appearing at start
		this.scene.tweens.add({
			targets: card.container,
			alpha: 0,
			scale: 2,
			delay: delay,
			duration: Time.recapTweenWithPause(),
			onStart: function (tween, targets, _)
			{
				card.show()
			},
			onComplete: function (tween, targets, _) {
				card.destroy()
			}
		})
	}
}