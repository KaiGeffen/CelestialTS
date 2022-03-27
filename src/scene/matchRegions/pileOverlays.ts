import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


class OverlayRegion extends Region {
	create (scene: Phaser.Scene): OverlayRegion {
		this.scene = scene

		this.container = scene.add.container(0, 0)
		.setDepth(0.5)
		.setVisible(false)

		let that = this

		// Create the background
		let background = scene.add.rectangle(0, 0,
			Space.windowWidth, Space.windowHeight,
			Color.darken, 0.5
			)
		.setOrigin(0)
		.setInteractive()
		.on('pointerdown', () => {that.container.setVisible(false)})

		// TODO Hide during mulligan, adjust to pile sizes, text specific to each pile
		let txtHint = scene.add.text(Space.windowWidth/2,
			Space.windowHeight/2 - Space.cardHeight/2 - Space.pad,
			'Click outside to exit',
			Style.basic).setOrigin(0.5, 1)

		let txtTitle = scene.add.text(Space.windowWidth/2,
			txtHint.y - Space.pad - txtHint.height,
			'Your Deck',
			Style.announcement).setOrigin(0.5, 1)

		this.container.add([background, txtHint, txtTitle])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {}

	// Add a card to this overlay
	protected addOverlayCard(card: Card, i: number, total: number): CardImage {
		let position = CardLocation.overlay(this.container, i, total)

		let cardImage = this.addCard(card, position).moveToTopOnHover()

		this.temp.push(cardImage)

		return cardImage
	}
}

export class OurDeckOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		for (let i = 0; i < state.deck.length; i++) {

			this.addOverlayCard(state.deck[i], i, state.deck.length)
		}
	}
}

export class TheirDeckOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		for (let i = 0; i < state.lastShuffle[1].length; i++) {
			this.addOverlayCard(state.lastShuffle[1][i], i, state.lastShuffle[1].length)
		}
	}
}

export class OurDiscardOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		for (let i = 0; i < state.discard[0].length; i++) {
			this.addOverlayCard(state.discard[0][i], i, state.discard[0].length)
		}
	}
}

export class TheirDiscardOverlay extends OverlayRegion {
	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		for (let i = 0; i < state.discard[1].length; i++) {
			this.addOverlayCard(state.discard[1][i], i, state.discard[1].length)
		}
	}
}
