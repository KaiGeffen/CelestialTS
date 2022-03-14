import "phaser"

import Region from './baseRegion'

import { Space, Color } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


export default class OurHandRegion extends Region {
	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, 0)

		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.menuBackground, 1
			).setOrigin(0)

		let avatar = scene.add.image(Space.pad, Space.pad, 'avatar-Jules').setOrigin(0)

		// Add each of these objects to container
		this.container.add([
			background,
			avatar,
			])

		return this
	}

	displayState(state: ClientState): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.opponentHandSize; i++) {
			const x = 300 + (140 + Space.pad) * i
			
			let card = this.addCard(cardback, [x, 50])

			this.temp.push(card)
		}

		// TODO Statuses
	}
}