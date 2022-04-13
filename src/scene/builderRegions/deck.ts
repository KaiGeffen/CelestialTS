import 'phaser'

import { SymmetricButtonSmall } from '../../lib/buttons/backed'
import { CardImage } from '../../lib/cardImage'
import { Space, Style, Mechanics } from '../../settings/settings'
import Card from '../../lib/card'
import { decodeCard, encodeCard } from '../../lib/codec'


const height = Space.cardHeight/2 + Space.pad

export default class DeckRegion {
	private scene

	// Hint telling users how to add cards
	private txtHint: Phaser.GameObjects.Text

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: SymmetricButtonSmall

	// Deck of cards in user's current deck
	private deck: CardImage[] = []

	// Container containing all cards in the deck
	private container: Phaser.GameObjects.Container
	private cardContainer: Phaser.GameObjects.Container

	create(scene: Phaser.Scene, startCallback: () => void, x = 0) {
		this.scene = scene

		// Deck container
		// NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
		this.container = scene.add.container(x, 0).setDepth(2)
		this.cardContainer = scene.add.container(0, 0).setDepth(3)

		let background = this.createBackground(scene)

		// Hint text - Tell user to click cards to add
		this.txtHint = scene.add.text(
			(Space.windowWidth - x)/2,
			Space.windowHeight - height/2,
			'Click a card to add it to your deck',
			Style.announcement)
		.setOrigin(0.5)

		// Add each object to this container
		this.container.add([background, this.txtHint])

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		this.btnStart = new SymmetricButtonSmall(this.container, 
			Space.windowWidth - x - Space.smallButtonWidth/2 - Space.pad, // TODO
			Space.windowHeight - height/2,
			'0/15',
			startCallback)

		return this
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
		let background = scene.add
		.rectangle(0,
			Space.windowHeight,
			Space.windowWidth,
			height,
			0x989898, 1)
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
		if (this.deck.length >= Mechanics.deckSize) {
			return undefined
		}

		let index = this.deck.length

		let cardImage = new CardImage(card, this.cardContainer)
		.setPosition(this.getDeckCardPosition(index))
		.moveToTopOnHover()
		.setOnClick(this.removeCardFromDeck(index))

		// When hovered, move up to make this visible
		// When exiting, return to old y
		let y0 = cardImage.container.y
		cardImage.setOnHover(() => {
			let y = Space.windowHeight - Space.cardHeight/2 - cardImage.container.parentContainer.y
			cardImage.container.setY(y)
		},
		() => {
			cardImage.container.setY(y0)
		})

		// Add this to the deck
		this.deck.push(cardImage)

		// Update start button to reflect new amount of cards in deck
		this.updateText()

		// Sort the deck, now done automatically after each card added
		this.sort()

		// Update the saved deck data
		this.scene.updateSavedDeck(this.getDeckCode())

		return cardImage
	}

	// Set the current deck, and return whether the given deck was valid
	setDeck(deckCode: string | Card[]): boolean {
		let deck: Card[]
		if (typeof deckCode === "string") {
			// Get the deck from this code
			let cardCodes: string[] = deckCode.split(':')

			deck = cardCodes.map( (cardCode) => decodeCard(cardCode))

			if (deckCode === '') {
				deck = []
			}
		}
		else {
			deck = deckCode
		}

		// Check if the deck is valid, then create it if so
		if (deck.includes(undefined))
		{
			return false
		}
		else
		{
			// Remove the current deck
			this.deck.forEach( (cardImage) => cardImage.destroy())
			this.deck = []
			this.updateText()

			// Add the new deck
			deck.forEach( (card) => this.addCardToDeck(card))

			return true
		}
	}

	// Get the deck code for player's current deck
	getDeckCode(): string {
		let txt = ''
		this.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
		txt = txt.slice(0, -1)

		return txt
	}

	// Add cards to the deck that must be in the deck
	addRequiredCards(cards: string): void {
		this.setDeck(cards)

		// Set each card in the deck to be required
		this.deck.forEach(card => {
			card.setRequired()
		})
	}

	// Remove the card from deck which has given index
	private removeCardFromDeck(index: number): () => void {
		let that = this
		return function() {
			// Play a sound
			that.scene.sound.play('click')

			// Remove the image
			that.deck[index].destroy()

			// Remove from the deck array
			that.deck.splice(index, 1)

			that.correctDeckIndices()

			that.updateText()

			if (that.deck.length === 0) {
				that.txtHint.setVisible(true)
			}

			that.scene.updateSavedDeck(that.getDeckCode())
		}
	}

	// Update the card count and deck button texts
	private updateText(): void {
		if (this.deck.length === Mechanics.deckSize) {
			this.btnStart.setText('Start')
			this.btnStart.enable()
		}
		else
		{
			this.btnStart.setText(`${this.deck.length}/${Mechanics.deckSize}`)

			// TODO Grey out the button, have a disable method for button class
			// For debugging, allow sub-15 card decks locally
			if (location.port !== '4949') {
				this.btnStart.disable()
			}
		}

		this.txtHint.setVisible(this.deck.length === 0)
	}

	private getDeckCardPosition(index: number): [number, number] {
		let xPad = Space.pad

		// For resolutions below a threshold, make the overlap more intense to fit 15 cards
		let overlap = 0 // TODO Use an overlap sizer
		const x0 = Space.windowWidth - (Space.smallButtonWidth + 2*Space.pad + Space.cardWidth/2)
		let x = x0 - index * (Space.cardWidth - overlap)

		let y = Space.windowHeight

		return [x, y]
	}

	// Sort by cost all cards in the deck
	private sort(): void {
		this.deck.sort(function (card1, card2): number {
			if (card1.card.cost < card2.card.cost)
			{
				return 1
			}
			else if (card1.card.cost > card2.card.cost)
			{
				return -1
			}
			else
			{
				return card1.card.name.localeCompare(card2.card.name)
			}
		})

		this.correctDeckIndices()
	}

	// Set each card in deck to have the right position and onClick events for its index
	private correctDeckIndices(): void {
		for (var i = 0; i < this.deck.length; i++) {
			let cardImage = this.deck[i]

			cardImage.setPosition(this.getDeckCardPosition(i))

			// Ensure that each card is above all cards to its left
			cardImage.container.parentContainer.sendToBack(cardImage.container)

			// Remove the previous onclick event and add one with the updated index
			// Only do this if the card isn't required in the deck, in which case it can't be removed
			if (!cardImage.required) {
				cardImage.setOnClick(this.removeCardFromDeck(i), true)
			}
		}
	}
}
