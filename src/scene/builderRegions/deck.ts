import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { SymmetricButtonLarge, AvatarSmall } from '../../lib/buttons/backed'
import Cutout from '../../lib/buttons/cutout'
import { CardImage } from '../../lib/cardImage'
import { Space, Style, Color, Mechanics } from '../../settings/settings'
import Card from '../../lib/card'
import { decodeCard, encodeCard } from '../../lib/codec'
import avatarNames from '../../lib/avatarNames';


const width = Space.deckPanelWidth// + Space.pad * 2

export default class DeckRegion {
	private scene: Phaser.Scene

	// Callback for when the deck's avatar or name is edited
	editCallback: (name: string, avatar: number) => void

	// The panel within which all of the cards are
	private panel
	private scrollablePanel

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: SymmetricButtonLarge

	// Deck of cards in user's current deck
	private deck: Cutout[] = []

	// The avatar button
	private avatarNumber: number
	private avatar: AvatarSmall
	private txtDeckName: Phaser.GameObjects.Text

	// Container containing all cards in the deck
	private container: ContainerLite

	create(scene: Phaser.Scene,
		x: number,
		startCallback: () => void,
		editCallback?: (name: string, avatar: number) => void
		) {
		this.scene = scene

		this.editCallback = editCallback

		// Deck container
		this.container = new ContainerLite(scene)

		// TODO Make everything in a panel
		this.createScrollable(startCallback, x)

		return this
	}

	private createScrollable(startCallback: () => void, x: number) {
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background)
		.setInteractive()

		this.scrollablePanel = this.scene['rexUI'].add.scrollablePanel({
			x: x,
			y: 0,
			width: width,
			height: Space.windowHeight,

			background: background,

			panel: {
				child: this.createPanel(startCallback)
			},

			header: this.createHeader(startCallback),
			footer: this.createFooter(startCallback),

			space: {
				top: Space.filterBarHeight + Space.pad,
				bottom: Space.pad,
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
		this.avatar = new AvatarSmall(containerAvatar, 0, 0, 'Jules', this.onClickAvatar())
		sizer.add(containerAvatar, {padding: {bottom: Space.pad}})

		// Add the deck's name
		this.txtDeckName = this.scene.add.text(0, 0, '', Style.announcement).setOrigin(0.5)
		let container = new ContainerLite(this.scene, 0, 0, width, this.txtDeckName.height - Space.pad*2)
		container.add(this.txtDeckName)
		sizer.add(container)

		return sizer
	}

	private createFooter(startCallback: () => void): Phaser.GameObjects.GameObject {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			Space: {left: Space.pad, right: Space.pad}
		})

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		let containerButton = new ContainerLite(this.scene, 0, 0, width, Space.largeButtonHeight)
		this.btnStart = new SymmetricButtonLarge(containerButton, 0, 0, '0/15', startCallback)
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
			let index = this.addToPanelSorted(container, card)

			this.scrollablePanel.layout()

			this.deck.splice(index, 0, cutout)
		}
		
		// Update start button to reflect new amount of cards in deck
		this.updateText()

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
			for (let i = 0; i < deck.length; i++) {
				let card = deck[i]
				this.addCardToDeck(card)
			}

			return true
		}
	}

	setAvatar(id: number): DeckRegion {
		// TODO Require all decks to have an avatar
		id = id === undefined ? 0 : id

		this.avatarNumber = id

		this.avatar.setAvatarNumber(id)

		return this
	}

	setName(name: string): DeckRegion {
		this.txtDeckName.setText(name)

		return this
	}

	// Set the deck's name to be the premade for given avatar
	setPremadeName(id: number): DeckRegion {
		this.txtDeckName.setText(`${avatarNames[id]}`)

		return this
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
		this.deck.forEach(cutout => {
			cutout.setRequired()
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

	private addToPanelSorted(child: ContainerLite, card: Card): number {
		for (let i = 0; i < this.deck.length; i++) {
			if ((this.deck[i].card.cost > card.cost) ||
				((this.deck[i].card.cost === card.cost) &&
					(this.deck[i].card.name > card.name))
				) {
			this.panel.insert(i, child)
			return i
			}
		}

		// Default insertion is at the end, if it's not before any existing element
		this.panel.insert(this.deck.length, child)
		return this.deck.length
	}

	private onClickAvatar(): () => void {
		let that = this

		return function() {
			that.scene.scene.launch('MenuScene', {
					menu: 'editDeck',
					callback: that.editCallback,
					deckName: that.txtDeckName.text,
					selectedAvatar: that.avatarNumber,
				})
		}
	}
}

