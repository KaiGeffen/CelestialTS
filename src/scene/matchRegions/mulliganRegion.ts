import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class MulliganRegion extends Region {
	create (scene: Phaser.Scene): MulliganRegion {
		this.scene = scene

		this.container = scene.add.container(0, 0)
		.setDepth(5)
		.setVisible(false)

		let that = this

		// Create icons / reminder text

		// Create the background
		let background = scene.add.rectangle(0, 0,
			Space.windowWidth, Space.windowHeight,
			Color.darken, 0.5
			)
		.setOrigin(0)
		.setInteractive()
		.on('pointerdown', () => {that.container.setVisible(false)})

		// Add in the cards themselves

		this.container.add(background)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		for (let i = 0; i < state.hand.length; i++) {
			let card = this.addCard(state.hand[i], CardLocation.ourHand(state, i, this.container))
			.setCost(state.costs[i])
			.moveToTopOnHover()

			this.container.add(card)
			this.temp.push(card)
		}
	}
}
