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


export default class MulliganRegion extends Region {
	// The cards in our starting hand
	cards: CardImage[] = []

	// The player's keep/not keep choices for each card in their hand
	mulliganChoices = [false, false, false]

	// The callback for when the button is clicked
	onButtonClick: () => void

	create (scene: Phaser.Scene): MulliganRegion {
		this.scene = scene

		this.cards = []
		this.mulliganChoices = [false, false, false]

		this.container = scene.add.container(0, 0)
		.setDepth(5)

		let txtHint = scene.add.text(Space.windowWidth/2,
			Space.windowHeight/2 - Space.cardHeight/2 - Space.pad,
			'Click cards to replace',
			Style.basic).setOrigin(0.5, 1)
		let txtTitle = scene.add.text(Space.windowWidth/2,
			txtHint.y - Space.pad - txtHint.height,
			'Starting Hand',
			Style.announcement).setOrigin(0.5, 1)

		let btn = new Button(scene,
			Space.windowWidth/2,
			Space.windowHeight/2 + Space.cardHeight/2 + Space.pad,
			'Ready',
			() => this.onButtonClick())
		.setOrigin(0.5, 0)
		
		this.container.add([txtTitle, txtHint, btn])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		for (let i = 0; i < state.hand.length; i++) {
			let card = this.addCard(state.hand[i], CardLocation.mulligan(this.container, i))
			.setCost(state.costs[i])
			.setOnClick(this.onCardClick(i))

			this.cards.push(card)
		}
	}

	setCallback(callback: () => void): void {
		this.onButtonClick = callback
	}

	// The callback for when a card is clicked on
	private onCardClick(i: number): () => void {
		let that = this

		return function() {
			that.mulliganChoices[i] = !that.mulliganChoices[i]
			that.cards[i].setTransparent(that.mulliganChoices[i])
		}
	}
}
