import 'phaser'

import { SymmetricButtonSmall } from '../../lib/buttons/backed'
import { CardImage } from '../../lib/cardImage'
import { Space, Style } from '../../settings/settings'
import Card from '../../lib/card'


class DeckRegion {
	// Hint telling users how to add cards
	private txtHint: Phaser.GameObjects.Text

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: SymmetricButtonSmall

	// Deck of cards in user's current deck
	private deck: CardImage[] = []

	// Container containing all cards in the deck
	container: Phaser.GameObjects.Container

	create(scene: Phaser.Scene) {
		this.createBackground(scene)

		// Hint text - Tell user to click cards to add
		this.txtHint = scene.add.text(
			Space.windowWidth/2,
			Space.windowHeight - 120, // TODO
			'Click a card to add it to your deck',
			Style.announcement)
		.setOrigin(0.5, 0)

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		this.btnStart = new SymmetricButtonSmall(scene, 
			Space.windowWidth - 70, // TODO
			Space.windowHeight - 80, // TODO
			'').setDepth(2)
		// TODO Add the above somewhere that they have access to the current deck panel's height

		// Deck container
		// NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
		// this.container = this.add.container(Space.windowWidth - Space.cardWidth, Space.windowHeight).setDepth(2)
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
		// Must add an invisible region below and above the scroller or else partially visible cards will be clickable on
      // their bottom parts, which cannot be seen and are below the scroller
      // TODO determine the y and x
      let y = 600 // this.panel.y + this.panel.height
      let background = scene.add
      .rectangle(0,
        y,
        Space.windowWidth, Space.windowHeight, 0x989898, 1)
      .setOrigin(0)
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