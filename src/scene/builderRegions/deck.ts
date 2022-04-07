import 'phaser'

import { SymmetricButtonSmall } from '../../lib/buttons/backed'
import { CardImage } from '../../lib/cardImage'
import { Space, Style } from '../../settings/settings'
import Card from '../../lib/card'


export default class DeckRegion {
	// Hint telling users how to add cards
	private txtHint: Phaser.GameObjects.Text

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: SymmetricButtonSmall

	// Deck of cards in user's current deck
	private deck: CardImage[] = []

	// Container containing all cards in the deck
	container: Phaser.GameObjects.Container

	create(scene: Phaser.Scene) {
		// Deck container
		// NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
		this.container = scene.add.container(0, Space.windowHeight).setDepth(2)

		let background = this.createBackground(scene)

		// Hint text - Tell user to click cards to add
		this.txtHint = scene.add.text(
			Space.windowWidth/2,
			Space.windowHeight - 120, // TODO
			'Click a card to add it to your deck',
			Style.announcement)
		.setOrigin(0.5, 0)

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		this.btnStart = new SymmetricButtonSmall(this.container, 
			Space.windowWidth - 70, // TODO
			Space.windowHeight - 80, // TODO
			'').setDepth(2)
		// TODO Add the above somewhere that they have access to the current deck panel's height

		// Add each object to this container
		this.container.add([background, this.txtHint])
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
      let background = scene.add
      .rectangle(0,
        0,
        Space.windowWidth, Space.cardHeight/2 + Space.pad, 0x989898, 1)
      .setOrigin(0, 1)
      .setInteractive()

      scene.plugins.get('rexDropShadowPipeline')['add'](background, {
        distance: 3,
        shadowColor: 0x000000,
      })

      return background
	}

	// Add the given card and return the created cardImage
	addCardToDeck(card: Card): CardImage {
		console.log('Adding a card')
		return undefined

	}

	// Set the current deck, and return whether the given deck was valid
	setDeck(deckCode: string | Card[]): boolean {
		console.log('Setting the deck')
		return false
	}
}