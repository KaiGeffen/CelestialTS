import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'

import Cutout from '../../lib/buttons/cutout'

import { CardImage } from '../../lib/cardImage'
import { Space, Style, Color, Mechanics, Time } from '../../settings/settings'
import Card from '../../lib/card'
import { decodeCard, encodeCard } from '../../lib/codec'
import avatarNames from '../../lib/avatarNames';
import premadeDecklists from '../../catalog/premadeDecklists';


const width = Space.deckPanelWidth// + Space.pad * 2

export default class DeckRegion {
	private scene: Phaser.Scene

	// Callback for when the deck's avatar or name is edited
	editCallback: (name: string, avatar: number) => void

	// The panel within which all of the cards are
	private panel
	private scrollablePanel

	// Button allowing user to Start, or showing the count of cards in their deck
	private btnStart: Button

	// Deck of cards in user's current deck
	private deck: Cutout[] = []

	// The avatar button
	avatarNumber: number
	private avatar: Button
	private txtDeckName: Phaser.GameObjects.Text

	// Only for adventure mode
	private txtChoice: Phaser.GameObjects.Text

	create(scene: Phaser.Scene,
		startCallback: () => void,
		editCallback?: (name: string, avatar: number) => void
		) {
		this.scene = scene

		this.editCallback = editCallback

		// TODO Make everything in a panel
		this.createScrollable(startCallback)

		return this
	}

	private createScrollable(startCallback: () => void) {
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background)
		.setInteractive()

		this.scrollablePanel = this.scene['rexUI'].add.scrollablePanel({
			x: Space.decklistPanelWidth - Space.deckPanelWidth,
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

		this.updateOnScroll(this.panel, this.scrollablePanel)

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
		this.scene.add.rectangle(0, 0, width, Space.windowHeight, Color.background)
		)

		return this.panel
	}

	private createHeader(startCallback: () => void): Phaser.GameObjects.GameObject {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			Space: {left: Space.pad, right: Space.pad}
		})

		// Add this deck's avatar
		let containerAvatar = new ContainerLite(this.scene, 0, 0, width, Space.avatarSize)
		this.avatar = new Buttons.Avatar(containerAvatar, 0, 0, 'Jules', this.onClickAvatar(), true)
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
		this.btnStart = new Buttons.Basic(containerButton, 0, 0, '0/15', startCallback)
		sizer.add(containerButton)

		return sizer
	}

	// Add the given card and return the created cardImage
	addCardToDeck(card: Card, panel = this.panel): boolean {
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
			if (cutout.name === card.name && !cutout.required) {
				cutout.increment()
				alreadyInDeck = true
			}
		})

		if (!alreadyInDeck) {
			// If it doesn't, create a new cutout
			let container = new ContainerLite(this.scene, 0, 0, Space.deckPanelWidth, Space.cutoutHeight) // TODO
			let cutout = new Cutout(container, card)
			cutout.setOnClick(this.removeCardFromDeck(cutout))

			// Add the container in the right position in the panel
			let index = this.addToPanelSorted(container, card, panel)

			this.scrollablePanel.layout()

			this.deck.splice(index, 0, cutout)
		}
		
		// Update start button to reflect new amount of cards in deck
		this.updateText()

		return true
	}

	// Set the current deck, and return whether the given deck was valid
	setDeck(deckCode: string | Card[], panel = this.panel): boolean {
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
				this.addCardToDeck(card, panel)
			}

			// Scroll to the top of the page
			this.scrollablePanel.t = 0

			return true
		}
	}

	setAvatar(id: number): DeckRegion {
		// TODO Require all decks to have an avatar
		id = id === undefined ? 0 : id

		this.avatarNumber = id

		this.avatar.setQuality(id)
		.enable()

		return this
	}

	setName(name: string): DeckRegion {
		this.txtDeckName.setText(name)

		return this
	}

	// Set the deck's to be the given premade deck
	setPremade(id: number): DeckRegion {
		this.txtDeckName.setText(`${avatarNames[id]}`)
		this.setAvatar(id)
		this.setDeck(premadeDecklists[id])

		// Disable cards from being removed from the deck
		this.deck.forEach(cutout => {
			cutout.setRequired()
		})

		// Disable the avatar from changing / changing name
		this.avatar.disable()

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
	// NOTE This is implemented by removing everything from the header
	// then populating it with the required cards
	addRequiredCards(cards: string): void {
		let header = this.scrollablePanel.getElement('header')

		// Remove everything from the header
		this.avatar.destroy()
		header.removeAll()

		// Add in a hint and list of cards
		const amt = cards.match(/\:/g).length + 1
		let txtRequired = this.scene.add.text(0, 0, `Required Cards: ${amt}`, Style.basic).setOrigin(0.5)
		let containerRequired = new ContainerLite(this.scene, 0, 0, width, txtRequired.height)
		header.add(containerRequired.add(txtRequired))

		// Add in a scrollable panel of the required cards
		header.add(this.createRequiredCardList(cards))

		// Hint for the cards user's can choose to complete the deck
		this.txtChoice = this.scene.add.text(0, 0, `Chosen Cards: 0/${Mechanics.deckSize - amt}`, Style.basic).setOrigin(0.5, 0)
		let containerChoice = new ContainerLite(this.scene, 0, 0, width, this.txtChoice.height)
		header.add(containerChoice.add(this.txtChoice))

		// Panel should move over since decklist region doesn't exist
		this.scrollablePanel.x = 0

		this.scrollablePanel.layout()
	}

	// Create a scrollable panel with all of the given required cards
	private createRequiredCardList(cards: string) {
		// Create the sizer that contains the cards
		let sizer = this.scene['rexUI'].add.fixWidthSizer().addBackground(
			this.scene.add.rectangle(0, 0, width, 0, 0xF44FFF)
		)
		
		// Create the scrolling panel that contains it
		// const height = Math.min(Space.windowHeight/2, 800)
		// let panel = this.scene['rexUI'].add.scrollablePanel({
		// 	height: height,
		// 	panel: {
		// 		child: sizer
		// 	},
		// })

		this.setDeck(cards, sizer)

		this.deck.forEach(cutout => {
			cutout.setRequired()
		})

		return sizer
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
					const cutoutI = that.deck[i]
					if (cutoutI.id === cutout.id && !cutoutI.required) {
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
		let choiceCount = 0
		this.deck.forEach(cutout => {
			totalCount += cutout.count

			// This is a chosen card if not required
			if (!cutout.required) {
				choiceCount += cutout.count
			}
		})

		// Display amount of chosen cards
		if (this.txtChoice !== undefined) {
			this.txtChoice.setText(`Chosen Cards: ${choiceCount}/${Mechanics.deckSize - totalCount + choiceCount}`)
		}

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
	private updateOnScroll(panel, scrollablePanel) {
		let that = this

		this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
			// Return if the pointer is outside of the panel
			if (!panel.getBounds().contains(pointer.x, pointer.y)) {
				return
			}

			// Scroll panel down by amount wheel moved
			scrollablePanel.childOY -= dy

			// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
			scrollablePanel.t = Math.max(0, scrollablePanel.t)
			scrollablePanel.t = Math.min(0.999999, scrollablePanel.t)
		})
	}

	private addToPanelSorted(child: ContainerLite, card: Card, panel): number {
		// Keep track of how many of these cards are required, to insert in the right index
		let requiredAmt = 0

		for (let i = 0; i < this.deck.length; i++) {
			const cutout = this.deck[i]
			if (cutout.required) {
				requiredAmt += 1
				continue
			}

			if ((cutout.card.cost > card.cost) ||
				((cutout.card.cost === card.cost) &&
					(cutout.card.name > card.name))
				)
			{
				panel.insert(i - requiredAmt, child)
				return i - requiredAmt
			}
		}

		// Default insertion is at the end, if it's not before any existing element
		panel.insert(this.deck.length - requiredAmt, child)
		return this.deck.length - requiredAmt
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

	hidePanel(): void {
		this.scene.tweens.add({
			targets: this.scrollablePanel,
			x: Space.decklistPanelWidth - Space.deckPanelWidth - Space.pad,
			duration: Time.builderSlide(),
		})
	}

	showPanel(): void {
		this.scene.tweens.add({
			targets: this.scrollablePanel,
			x: Space.decklistPanelWidth,
			duration: Time.builderSlide(),
		})
	}
}

