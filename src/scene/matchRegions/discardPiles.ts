import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class DiscardPilesRegion extends Region {
	ourCallback: () => void
	theirCallback: () => void

	create (scene: Phaser.Scene): DiscardPilesRegion {
		this.scene = scene

		this.container = scene.add.container(Space.windowWidth, Space.windowHeight/2).setDepth(-1)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.discard[0].length; i++) {
			let card = this.addCard(state.discard[0][i], CardLocation.ourDiscard(this.container, i))
			
			card.setOnClick(that.ourCallback)

			this.temp.push(card)
		}

		for (let i = 0; i < state.discard[1].length; i++) {
			let card = this.addCard(state.discard[1][i], CardLocation.theirDiscard(this.container, i))

			card.setOnClick(that.theirCallback)

			this.temp.push()
		}
	}

	setCallback(ourCallback: () => void, theirCallback: () => void): void {
		this.ourCallback = ourCallback
		this.theirCallback = theirCallback
	}
}