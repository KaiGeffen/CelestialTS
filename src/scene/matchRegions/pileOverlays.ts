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


class OverlayRegion extends Region {
	create (scene: Phaser.Scene): OverlayRegion {
		this.scene = scene

		this.container = scene.add.container(0, 0).setVisible(false)

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

	displayState(state: ClientState, isRecap: boolean): void {}

	// Add a card to this overlay
	protected addOverlayCard(card: Card, i: number): CardImage {
		let position = CardLocation.overlay(this.container, i)

		let cardImage = this.addCard(card, position).moveToTopOnHover()

		this.temp.push(card)

		return cardImage
	}
}

export class OurDeckOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		for (let i = 0; i < state.deck.length; i++) {
			this.addOverlayCard(state.deck[i], i)
		}
	}
}

export class TheirDeckOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		for (let i = 0; i < state.lastShuffle[1].length; i++) {
			this.addOverlayCard(state.lastShuffle[1][i], i)
		}
	}
}

export class OurDiscardOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		for (let i = 0; i < state.discard[0].length; i++) {
			this.addOverlayCard(state.discard[0][i], i)
		}
	}
}

export class TheirDiscardOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		for (let i = 0; i < state.discard[1].length; i++) {
			this.addOverlayCard(state.discard[1][i], i)
		}
	}
}
