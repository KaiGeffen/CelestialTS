import "phaser"

import Region from './baseRegion'

import { Space, Color } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


export default class OurHandRegion extends Region {
	create (scene: Phaser.Scene): OurHandRegion {
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - height)

		// Make a container
		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.menuBackground, 1
			).setOrigin(0)

		let avatar = scene.add.image(Space.pad, Space.pad, 'avatar-Jules').setOrigin(0)

		// Recap button
		let btnRecap = new Button(scene,
			Space.windowWidth - Space.pad,
			height / 3,
			'Recap'
			).setOrigin(1, 0.5)

		// Pass button
		let btnPass = new Button(scene,
			Space.windowWidth - Space.pad,
			height * 2 / 3,
			'Pass'
			).setOrigin(1, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			avatar,
			btnRecap,
			btnPass,
			])

		return this
	}

	displayState(state: ClientState): void {
		let that = this

		for (let i = 0; i < state.hand.length; i++) {
			const x = 300 + (140 + Space.pad) * i
			
			this.addCard(state.hand[i], [x, 200/2])
			.setOnClick(
				// Callback is based on the index of this card in the hand
				() => {that.callback(i)}
				)
		}

		// TODO Statuses
	}

	// Set the callback for when a card in this region is clicked on
	setCallback(f: (x: number) => () => void): Region {
		this.callback = f
		return this
	}
}