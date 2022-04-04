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
import BaseScene from '../baseScene'


class OverlayRegion extends Region {
	txtTitle: Phaser.GameObjects.Text

	create (scene: BaseScene, title: string): OverlayRegion {
		this.scene = scene

		this.container = scene.add.container(0, 0)
		.setDepth(0.5)
		.setVisible(false)

		let that = this

		// Create the background
		let background = scene.add.rectangle(0, 0,
			Space.windowWidth, Space.windowHeight,
			Color.darken, 0.8
			)
		.setOrigin(0)
		.setInteractive()
		.on('pointerdown', () => {that.container.setVisible(false)})

		// TODO Hide during mulligan, adjust to pile sizes, text specific to each pile
		this.txtTitle = scene.add.text(Space.windowWidth/2,
			Space.windowHeight/2 + Space.cardHeight/2,
			title,
			Style.announcement).setOrigin(0.5, 0)

		this.container.add([background, this.txtTitle])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {}

	// Add a card to this overlay
	protected addOverlayCard(card: Card, i: number, total: number): CardImage {
		const titleHeight = this.txtTitle.height
		let position = CardLocation.overlay(this.container, i, total, titleHeight)

		let cardImage = this.addCard(card, position).moveToTopOnHover()

		this.temp.push(cardImage)

		return cardImage
	}
}

export class OurDeckOverlay extends OverlayRegion {
	create(scene: BaseScene): OverlayRegion {
		return super.create(scene, 'Your Deck')
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		const total = state.deck.length
		for (let i = 0; i < total; i++) {
			this.addOverlayCard(state.deck[i], i, total)
		}

		this.txtTitle.setVisible(total <= 15)
	}
}

export class TheirDeckOverlay extends OverlayRegion {
	create(scene: BaseScene): OverlayRegion {
		return super.create(scene, 'Their Last Shuffle')
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		const total = state.lastShuffle[1].length
		for (let i = 0; i < total; i++) {
			this.addOverlayCard(state.lastShuffle[1][i], i, total)
		}

		this.txtTitle.setVisible(total <= 15)
	}
}

export class OurDiscardOverlay extends OverlayRegion {
	create(scene: BaseScene): OverlayRegion {
		return super.create(scene, 'Your Discard Pile')
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		const total = state.discard[0].length
		for (let i = 0; i < total; i++) {
			this.addOverlayCard(state.discard[0][i], i, total)
		}

		this.txtTitle.setVisible(total <= 15)
	}
}

export class TheirDiscardOverlay extends OverlayRegion {
	create(scene: BaseScene): OverlayRegion {
		return super.create(scene, 'Their Discard Pile')
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		const total = state.discard[1].length
		for (let i = 0; i < total; i++) {
			this.addOverlayCard(state.discard[1][i], i, total)
		}

		this.txtTitle.setVisible(total <= 15)
	}
}
