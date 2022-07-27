import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import premadeDecklists from '../../catalog/premadeDecklists';
import avatarNames from '../../lib/avatarNames';
import Button from '../../lib/buttons/button';
import Buttons from '../../lib/buttons/buttons';
import Cutout from '../../lib/buttons/cutout';
import Icons from '../../lib/buttons/icons';
import Card from '../../lib/card';
import { decodeCard } from '../../lib/codec';
import { Color, Mechanics, Space, Style, Time, Mobile, Scroll, Ease } from '../../settings/settings';


const width = Space.deckPanelWidth// + Space.pad * 2

// Where the panel starts
const X_START = Mobile ? -Space.deckPanelWidth - Space.pad - Space.scrollWidth : Space.decklistPanelWidth - Space.deckPanelWidth - Space.pad

export default class DeckRegion {
	private scene

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
		let background = this.scene.add.image(0, 0, 'bg-Texture')
		background['resize'] = (w, h) => {
			const x = (background.displayWidth - w)/2
			const y = (background.displayHeight - h)/2
			
			background.setCrop(x, y, w, h)
			.setInteractive(new Phaser.Geom.Rectangle(x, y, w, h), Phaser.Geom.Rectangle.Contains)
		}

		this.scrollablePanel = this.scene['rexUI'].add.scrollablePanel({
			x: X_START,
			y: 0,
			width: width,
			height: Space.windowHeight,

			panel: {
				child: this.createPanel(startCallback)
			},

			slider: Mobile ? Scroll(this.scene) : undefined,
			
			header: Mobile ? undefined : this.createHeader(startCallback),
			background: background,

			space: {
				top: Space.filterBarHeight,
			},
			}).setOrigin(0)

		this.updateOnScroll(this.panel, this.scrollablePanel)

		// If on mobile, header scrolls with the rest of content
		if (Mobile) {
			this.panel.add(this.createHeader(startCallback), {
				padding: {bottom: Space.pad}
			})

			this.scrollablePanel.setDepth(2)
			// TODO
		}

		this.scrollablePanel.layout()

		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})

		return this.scrollablePanel
	}

	private createPanel(startCallback: () => void): Phaser.GameObjects.GameObject {
		this.panel = this.scene['rexUI'].add.fixWidthSizer({
			space: {
				top: Space.padSmall
			}
		})

		return this.panel
	}

	private createHeader(startCallback: () => void): Phaser.GameObjects.GameObject {
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background2)
		.setInteractive()

		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			space: {top: Space.padSmall, bottom: Space.padSmall},
		}).addBackground(background)

		// Sizer for the top of the header
		let sizerTop = this.scene['rexUI'].add.fixWidthSizer({
			width: width,
			align: Mobile ? 'left' : 'center',
		})
		sizer.add(sizerTop, {space: {top: 100}})

		// Add the deck's name
		this.txtDeckName = this.scene.add.text(0, 0, '', Style.announcement)
		.setOrigin(0.5)

		// If on mobile, add a back button
		if (Mobile) {
			let backContainer = new ContainerLite(this.scene, 0, 0, 40, this.txtDeckName.displayHeight)
			new Buttons.Text(backContainer, 0, 0, '<', () => {
				this.scene.deselect()
			}).txt.setFontSize(40)
			sizerTop.add(backContainer)

			this.txtDeckName.setOrigin(0, 0.5)
		}

		sizerTop.add(this.txtDeckName)
		.layout()

		// Add a share button that allows user to copy/paste their deck code
		let containerEdit = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth/3, Space.avatarSize/2)
		new Icons.Edit(containerEdit, 0, 0, this.openEditMenu())

		// Add a share button that allows user to copy/paste their deck code
		let containerShare = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth/3, Space.avatarSize/2)
		new Icons.Share(containerShare, 0, 0, this.shareCallback())

		// Add a graph button for showing the distribution of costs in the deck
		let containerDistribution = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth/3, Space.avatarSize/2)
		new Icons.Distribution(containerDistribution, 0, 0, this.distributionCallback())
		// TODO Remove if using a premade deck

		// Start button - Show how many cards are in deck, and enable user to start if deck is full
		let containerStart = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.avatarSize/2)
		this.btnStart = new Buttons.Basic(containerStart, 0, 0, '0/15', startCallback)
		
		// Make a container for all of the buttons
		let sizerButtons = this.scene['rexUI'].add.fixWidthSizer({
			width: width - (Space.avatarSize + Space.pad * 2),
			align: 'center',
		})
		sizerButtons.add([containerEdit, containerShare, containerDistribution, containerStart])
		sizer.add(sizerButtons)

		// Add this deck's avatar
		let containerAvatar = new ContainerLite(this.scene, 0, 0, Space.avatarSize + Space.pad, Space.avatarSize)
		this.avatar = new Buttons.Avatar(containerAvatar, 0, 0, 'Jules')['setEmotive']()
		sizer.add(containerAvatar)

		// Give the background a drop shadow
		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			angle: -90,
			shadowColor: 0x000000,
		})

		return sizer
	}

	// Add the given card and return the created cardImage
	addCardToDeck(card: Card, panel = this.panel): string {
		let totalCount = 0
		this.deck.forEach(cutout => {
			totalCount += cutout.count
		})

		if (totalCount  >= Mechanics.deckSize) {
			return 'Deck is full.'
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
			let container = new ContainerLite(this.scene, 0, 0, Space.deckPanelWidth, Space.cutoutHeight)
			let cutout = new Cutout(container, card)
			cutout.setOnClick(this.removeCardFromDeck(cutout))
			if (Mobile) {
				cutout.setDepth(2)
			}

			// Add the container in the right position in the panel
			let index = this.addToPanelSorted(container, card, panel)

			this.scrollablePanel.layout()

			this.deck.splice(index, 0, cutout)
		}
		
		// Update start button to reflect new amount of cards in deck
		this.updateText()

		return
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

	// Remove the card from deck which has given index
	private removeCardFromDeck(cutout: Cutout): () => void {
		let that = this
		return function() {
			// Decrement, if fully gone, remove from deck list
			if (cutout.decrement().count === 0) {

				// Find the index of it within the deck list, remove that after
				let index

				for (let i = 0; i < that.deck.length && index === undefined; i++) {
					const cutoutI = that.deck[i]
					if (cutoutI.id === cutout.id) {
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
		for (let i = 0; i < this.deck.length; i++) {
			const cutout = this.deck[i]

			if ((cutout.card.cost > card.cost) ||
				((cutout.card.cost === card.cost) &&
					(cutout.card.name > card.name))
				)
			{
				let index = i + (Mobile ? 1 : 0)
				panel.insert(index, child)
				return index
			}
		}

		// Default insertion is at the end, if it's not before any existing element
		let index = this.deck.length + (Mobile ? 1 : 0)
		panel.insert(index, child)
		return index
	}

	private openEditMenu(): () => void {
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

	private shareCallback(): () => void {
		let that = this

		return function() {
			that.scene.scene.launch('MenuScene', {
				menu: 'shareDeck',
				// Called when the text changes in the menu
				currentDeck: that.scene.getDeckCode(),
				callback: function(inputText) {
					that.scene.setDeck(inputText.text)
				}
			})
		}
	}

	private distributionCallback(): () => void {
		let that = this

		return function() {
			that.scene.scene.launch('MenuScene', {
				menu: 'distribution',
				// Used to form the graph
				currentDeck: that.deck,
			})
		}
	}

	hidePanel(): void {
		// this.scrollablePanel.setX(X_START)
		this.scene.tweens.add({
			targets: this.scrollablePanel,
			x: X_START,
			duration: Time.builderSlide(),
			ease: Ease.basic,
		})
	}

	showPanel(): void {
		const x = Mobile ? 0 : Space.decklistPanelWidth
		// this.scrollablePanel.x = x
		this.scene.tweens.add({
			targets: this.scrollablePanel,
			x: x,
			duration: Time.builderSlide(),
			ease: Ease.basic,
		})
	}
}

