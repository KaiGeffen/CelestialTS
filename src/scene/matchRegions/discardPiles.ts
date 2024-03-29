import "phaser"
import { Zone } from '../../lib/animation'
import { CardImage } from '../../lib/cardImage'
import ClientState from '../../lib/clientState'
import { Depth, Space, Time, Flags } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


export default class DiscardPilesRegion extends Region {
	ourCallback: () => void
	theirCallback: () => void

	create (scene: BaseScene): DiscardPilesRegion {
		this.scene = scene

		this.container = scene.add.container(Space.windowWidth, Space.windowHeight/2)
		.setDepth(Depth.discardPiles)
		.setVisible(!Flags.mobile)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// Ours
		this.cards = []
		for (let i = 0; i < state.discard[0].length; i++) {
			let card = this.addCard(state.discard[0][i], CardLocation.ourDiscard(this.container, i))
			.setOnClick(that.ourCallback)

			this.temp.push(card)
			this.cards.push(card)
		}

		// Theirs
		this.cards2 = []
		for (let i = 0; i < state.discard[1].length; i++) {
			let card = this.addCard(state.discard[1][i], CardLocation.theirDiscard(this.container, i))
			.setOnClick(that.theirCallback)

			this.temp.push(card)
			this.cards2.push(card)
		}
	}

	setCallback(ourCallback: () => void, theirCallback: () => void): void {
		this.ourCallback = ourCallback
		this.theirCallback = theirCallback
	}
}