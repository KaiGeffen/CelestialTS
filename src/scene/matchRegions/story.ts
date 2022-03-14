import "phaser"

import Region from './baseRegion'

import { Space, Color } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


// TODO
const middle = (Space.windowHeight)/2 - 150

export default class StoryRegion extends Region {
	create (scene: Phaser.Scene): Region {
		// TODO 150 is the height for their hand, but generalize
		this.container = scene.add.container(100 + 140/2, 150)

		return this
	}

	displayState(state: ClientState): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.story.acts.length; i++) {
			const x = (90) * i

			const act = state.story.acts[i]

			const y = act.owner === 0 ? middle + 80 : middle - 80

			let card = this.addCard(act.card, [x, y])
			// TODO Add a callback to jump around in recap

			this.temp.push(card)
		}

		// TODO Statuses
	}

	// Set the callback for when a card in this region is clicked on
	setCallback(f: (x: number) => () => void): Region {
		this.callback = f
		return this
	}
}