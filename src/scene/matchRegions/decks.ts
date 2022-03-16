import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class DecksRegion extends Region {
	create (scene: Phaser.Scene): DecksRegion {
		this.scene = scene

		this.container = scene.add.container(0, 150)

		return this
	}

	displayState(state: ClientState): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.deck.length; i++) {
			this.temp.push(this.addCard(cardback, [30 - 3 * i, 400]))
		}

		for (let i = 0; i < state.opponentDeckSize; i++) {
			this.temp.push(this.addCard(cardback, [30 - 3 * i, 100]))
		}
	}
}