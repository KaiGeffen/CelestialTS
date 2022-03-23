import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class DecksRegion extends Region {
	ourCallback: () => void
	theirCallback: () => void

	create (scene: Phaser.Scene): DecksRegion {
		this.scene = scene

		this.container = scene.add.container(0, 150)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.deck.length; i++) {
			let card = this.addCard(cardback, CardLocation.ourDeck(this.container, i))

			card.setOnClick(that.ourCallback)

			this.temp.push(card)
		}

		for (let i = 0; i < state.opponentDeckSize; i++) {
			let card = this.addCard(cardback, CardLocation.theirDeck(this.container, i))

			card.setOnClick(that.theirCallback)
			
			this.temp.push(card)
		}
	}

	// TODO Our deck callback
	setCallback(ourCallback: () => void, theirCallback: () => void): void {
		this.ourCallback = ourCallback

		this.theirCallback = theirCallback
	}
}