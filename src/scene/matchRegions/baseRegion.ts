import 'phaser'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import ClientState from '../../lib/clientState'
import { Time, Space, Color, Depth, Style } from '../../settings/settings'
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
	focus(text = ''): void {
		const x = -this.container.x
		const y = -this.container.y

		// TODO
		// const s = text || "You look like you're in a hurry, so I'll speed things up. -Gives 2 wins to you"
		let foo = this.scene.rexUI.add.textBox({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			background:
				this.scene.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, Color.focusBackground, 0.6),
				// .setOrigin(0)
				// .setInteractive()
				// .on('pointerdown', () => {foo.destroy()}),
			text: this.scene.add.text(0, 0, text, Style.tutorial)
		}).layout()

		foo.start(text, 10)

		this.temp.push(foo)
		// this.container.add(foo)
		console.log(foo)

		// foo.start('uwuwuwuwuwuwuwuwuwuwuwuwu', 3)

		// let txt = 
		// .setOrigin(0.5)
		// this.container.add(txt)
		// this.temp.push(txt)
		
		// // Background behind everything, then text
		// this.container.sendToBack(txt)
		// .sendToBack(background)

		// // Remember the depth of this container in the callback
		// // const depth = this.container.depth
		// background.on('pointerdown', () => {
		// 	// this.container.setDepth(depth)
		// 	txt.destroy()
		// 	background.destroy()
		// })

		// TODO Reverse depth on state change

		// Move this container above all others
		// this.container.setDepth(Depth.aboveAll)
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