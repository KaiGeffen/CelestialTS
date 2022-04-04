import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'
import BaseScene from '../baseScene'


export default class ResultsRegion extends Region {
	create (scene: BaseScene, winner): ResultsRegion {
		this.scene = scene

		this.container = scene.add.container(0, 0)

		// Create everything here, this is created when the game has been won
		

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		for (let i = 0; i < state.deck.length; i++) {
			this.temp.push(this.addCard(cardback, CardLocation.ourDeck(this.container, i)))
		}

		for (let i = 0; i < state.opponentDeckSize; i++) {
			this.temp.push(this.addCard(cardback, CardLocation.theirDeck(this.container, i)))
		}
	}
}