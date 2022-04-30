import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { SymmetricButtonSmall, AvatarSmall } from '../../lib/buttons/backed'
import Cutout from '../../lib/buttons/cutout'
import { CardImage } from '../../lib/cardImage'
import { Space, Style, Color, Mechanics } from '../../settings/settings'
import Card from '../../lib/card'
import { decodeCard, encodeCard } from '../../lib/codec'


const width = Space.deckPanelWidth// + Space.pad * 2

export default class DeckRegion {
	private scene: Phaser.Scene

	// The panel within which all of the cards are
	private panel
	private scrollablePanel

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: SymmetricButtonSmall

	// Deck of cards in user's current deck
	private deck: Cutout[] = []

	// Container containing all cards in the deck
	private container: ContainerLite

	create(scene: Phaser.Scene, startCallback: () => void) {
		this.scene = scene

		// Deck container
		// NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
		this.container = new ContainerLite(scene)

		// TODO Make everything in a panel
		this.createScrollable(startCallback)

		return this
	}

	private createScrollable(startCallback: () => void) {
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background)
		.setInteractive()

		this.scrollablePanel = this.scene['rexUI'].add.scrollablePanel({
			x: 0,
			y: 0,
			width: width,
			height: Space.windowHeight,

			background: background,

			panel: {
				child: this.createPanel(startCallback)
			},

			header: this.createHeader(startCallback),

			space: {
				top: Space.filterBarHeight + Space.pad,
				item: Space.pad,
			},

			// mouseWheelScroller: {
				// 	focus: true,
				// 	speed: 1
				// },
			}).setOrigin(0)

		this.scrollablePanel.layout()

		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})

		return this.scrollablePanel
	}

	private createPanel(startCallback: () => void): Phaser.GameObjects.GameObject {
		this.panel = this.scene['rexUI'].add.fixWidthSizer({space: {
			top: 10,
			bottom: 10,
			// line: 10,//80 - Space.cardHeight,
		}}).addBackground(
		this.scene.add.rectangle(0, 0, width, Space.windowHeight, 0xF44FFF)
		)

		this.updateOnScroll(this.panel)

		return this.panel
	}

	private createHeader(startCallback: () => void): Phaser.GameObjects.GameObject {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			Space: {left: Space.pad, right: Space.pad}
		})

		// Add this deck's avatar
		let containerAvatar = new ContainerLite(this.scene, 0, 0, width, Space.avatarSize)
		let avatar = new AvatarSmall(containerAvatar, 0, 0, '\n\n\n\nDeck Name', 'Jules')
		sizer.add(containerAvatar, {padding: {bottom: Space.pad}})

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		let containerButton = new ContainerLite(this.scene, 0, 0, width, Space.largeButtonHeight)
		this.btnStart = new SymmetricButtonSmall(containerButton, 0, 0, '0/15', startCallback)
		sizer.add(containerButton)

		return sizer
	}

	// Add the given card and return the created cardImage
	addCardToDeck(card: Card): boolean {
		let totalCount = 0
		this.deck.forEach(cutout => {
			totalCount += cutout.count
		})

		if (totalCount  >= Mechanics.deckSize) {
			return false
		}

		// If this card exists in the deck already, increment it
		let alreadyInDeck = false
		this.deck.forEach(cutout => {
			if (cutout.name === card.name) {
				cutout.increment()
				alreadyInDeck = true
			}
		})

		if (!alreadyInDeck) {
			// If it doesn't, create a new cutout
			let container = new ContainerLite(this.scene, 0, 0, Space.deckPanelWidth, 50) // TODO
			let cutout = new Cutout(container, card)
			cutout.setOnClick(this.removeCardFromDeck(cutout))

			// Add the container in the right position in the panel
			this.addToPanelSorted(container, card)

			this.scrollablePanel.layout()

			this.deck.push(cutout)
		}
		
		// Update start button to reflect new amount of cards in deck
		this.updateText()

		// Update the saved deck data
		// TODO Smell
		this.scene['updateSavedDeck'](this.getDeckCode())

		return true
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
			this.deck.forEach( (cutout) => cutout.destroy())
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
		for (let i = 0; i < this.deck.length; i++) {
			let count = this.deck[i].count

			for (let j = 0; j < count; j++) {
				let s = this.deck[i].id
				txt += `${s}:`
			}
		}

		// Remove the last :
		txt = txt.slice(0, -1)

		return txt
	}

	// Add cards to the deck that must be in the deck
	addRequiredCards(cards: string): void {
		this.setDeck(cards)

		// Set each card in the deck to be required
		this.deck.forEach(card => {
			// TODO
			// card.setRequired()
		})
	}

	// Remove the card from deck which has given index
	private removeCardFromDeck(cutout: Cutout): () => void {
		let that = this
		return function() {
			// Play a sound
			that.scene.sound.play('click')

			// Decrement, if fully gone, remove from deck list
			if (cutout.decrement().count === 0) {

				// Find the index of it within the deck list, remove that after
				let index

				for (let i = 0; i < that.deck.length && index === undefined; i++) {
					if (that.deck[i].id === cutout.id) {
						index = i
					}
				}

				if (index === undefined) {
					throw 'Given cutout does not exist in deck'
				}

				// Remove from the deck list
				that.deck.splice(index, 1)

				// Destroy the cutout and its container
				cutout.destroy()

				// Reformat the panel
				that.scrollablePanel.t = Math.min(0.999999, that.scrollablePanel.t)
				that.panel.layout()
			}

			that.updateText()

			that.scene['updateSavedDeck'](that.getDeckCode())
		}
	}

	// Update the card count and deck button texts
	private updateText(): void {
		let totalCount = 0
		this.deck.forEach(cutout => {
			totalCount += cutout.count
		})

		if (totalCount === Mechanics.deckSize) {
			this.btnStart.setText('Start')
			this.btnStart.enable()
		}
		else
		{
			this.btnStart.setText(`${totalCount}/${Mechanics.deckSize}`)

			// TODO Grey out the button, have a disable method for button class
			// For debugging, allow sub-15 card decks locally
			if (location.port !== '4949') {
				this.btnStart.disable()
			}
		}
	}

	// TODO Make dry with other scenes
	// Update the panel when user scrolls with their mouse wheel
	private updateOnScroll(panel) {
		let that = this

		this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
			// Return if the pointer is outside of the panel
			if (!panel.getBounds().contains(pointer.x, pointer.y)) {
				return
			}

			// Scroll panel down by amount wheel moved
			that.scrollablePanel.childOY -= dy

			// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
			that.scrollablePanel.t = Math.max(0, that.scrollablePanel.t)
			that.scrollablePanel.t = Math.min(0.999999, that.scrollablePanel.t)
		})
	}

	private addToPanelSorted(child: ContainerLite, card: Card): void {
		// Default insertion is at the end, if it's not before any existing element
		let insertIndex = this.deck.length

		for (let i = 0; i < this.deck.length; i++) {
			if (this.deck[i].card.cost > card.cost ||
				(this.deck[i].card.cost === card.cost &&
								this.deck[i].card.name.localeCompare(card.name) === -1)
				) {
				insertIndex = i
			}
		}

		this.panel.insert(insertIndex, child)
	}





	// TODO Remove below unused methods

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
		this.setDeck(this.getDeckCode())
	}
}

