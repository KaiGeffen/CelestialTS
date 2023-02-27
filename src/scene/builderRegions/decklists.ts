import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import Icons from '../../lib/buttons/icons'
import { Color, Mechanics, Space, Style, UserSettings, Mobile, Scroll } from "../../settings/settings"



const width = Space.decklistPanelWidth
const DEFAULT_DECK_NAME = 'Deck'

// Region of the deck builder which contains all the decklists
export default class DecklistsRegion {  
	scene
	container: ContainerLite

	scrollablePanel
	panel

	// The index of the currently selected deck
	savedDeckIndex: number

	// The index of the currently selected premade
	savedPremadeIndex: number

	// Button for user to select a premade deck
	btnPremade: Button

	// List of buttons for user-defined decks
	decklistBtns: Button[]

	// Image of the current avatar
	avatar: Phaser.GameObjects.Image

	// Create the are where player can manipulate their decks
	create(scene) {
		this.scene = scene
		this.container = new ContainerLite(scene)

		this.createScrollable()

		// NOTE Must be set after the elements are added
		this.scrollablePanel.setDepth(1)
		return this
	}

	// Move lower TODO
	private createScrollable() {
		let background = this.scene.add.image(0, 0, 'bg-Texture')
		background['resize'] = (w, h) => {
			const x = (background.displayWidth - w)/2
			const y = (background.displayHeight - h)/2
			
			background.setCrop(x, y, w, h)
			.setInteractive(new Phaser.Geom.Rectangle(x, y, w, h), Phaser.Geom.Rectangle.Contains)
		}

		this.scrollablePanel = this.scene['rexUI'].add.scrollablePanel({
			x: 0,
			y: 0,
			width: width,
			height: Space.windowHeight,

			background: background,

			panel: {
				child: this.createPanel()
			},

			header: this.createHeader(),

			slider: Mobile ? Scroll(this.scene) : undefined,

			space: {
				top: Space.filterBarHeight,
			},
			}).setOrigin(0)

		this.scrollablePanel.layout()

		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})

		// TODO This is populating the existing panel with necessary contents
		this.createDecklistPanel()

		this.scrollablePanel.layout()

		return this.scrollablePanel
	}

	private createPanel(): any {

		this.panel = this.scene.rexUI.add.fixWidthSizer({
					width: width,
					space: {
					left: Space.pad,
					right: Space.pad,
					top: Space.padSmall,
					bottom: Space.padSmall,
					line: Space.padSmall,
				}})

		this.updateOnScroll(this.panel)

		return this.panel
	}

	// Update the currently selected deck
	updateSavedDeck(deckCode?: string, deckName?: string, deckAvatar?: number): void {
		let index = this.savedDeckIndex
		if (index !== undefined) {
			let deck = UserSettings._get('decks')[index]

			const value = deckCode === undefined ? deck['value'] : deckCode
			const name = deckName === undefined ? deck['name'] : deckName
			const avatar = deckAvatar === undefined ? deck['avatar'] : deckAvatar

			let newDeck = {
				name: name,
				value: value,
				avatar: avatar,
			}

			UserSettings._setIndex('decks', index, newDeck)
		}
	}

	selectDeck(i: number): void {
		this.decklistOnClick(i)()
	}

	// Set the currently selected deck name to the given name
	setName(name: string): void {
		if (this.savedDeckIndex === undefined) {
			throw 'Tried to set the deck name but no deck is selected.'
		}

		this.decklistBtns[this.savedDeckIndex].setText(name)
	}
	
	private createHeader(): Phaser.GameObjects.GameObject {
		// Make a background with a drop shadow straight down
		let background = this.scene.add.rectangle(0, 0, 1, 1, Color.background2)
		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			angle: -90,
			shadowColor: 0x000000,
		})

		let sizer = this.scene.rexUI.add.fixWidthSizer({
			space: {
				top: Space.pad,
				left: Space.pad,
				right: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			}
		}).addBackground(background)

		let container = new ContainerLite(this.scene, 0, 0, width - Space.pad*2, Space.buttonHeight)
		this.btnPremade = new Buttons.Premade(container, 0, 0,
			() => {
				this.scene.setSearchVisible(false)
				this.scene.scene.launch('MenuScene', {
					menu: 'choosePremade',
					selected: this.savedPremadeIndex,
					callback: this.premadeCallback(),
					exitCallback: () => this.scene.setSearchVisible(true)
				})
			}
			)
		sizer.add(container)

		let line = this.scene.add.line(0, 0, 0, 0, Space.iconSeparation + Space.pad, 0, Color.line)
		sizer.add(line)

		let hintSizer = this.scene['rexUI'].add.sizer({width: width - Space.pad*2})
		sizer.add(hintSizer)

		let txtHint = this.scene.add.text(0, 0, 'My Decks:', Style.header)
		hintSizer.add(txtHint)
		.addSpace()

		let btnNew = new Icons.New(hintSizer, 0, 0, this.newDeckCallback())

		hintSizer.addSpace()

		let btnPaste = new Icons.Paste(hintSizer, 0, 0, this.pasteCallback())

		return sizer
	}

	// Callback for when a premade avatar is clicked on
	premadeCallback(): (i: number) => void {
		let that = this
		return function(i: number) {
			that.savedDeckIndex = undefined
			that.savedPremadeIndex = i

			// Deselect decklist buttons
			that.decklistBtns.forEach(btn => btn.deselect())

			// Select premade button (Ensure only selected once)
			that.btnPremade.deselect().select()
			
			// Set the current deck to premade list
			that.scene.setPremade(i)
		}
	}

	// When paste button is clicked
	private pasteCallback(): () => void {
		return () => {
			// If user already has MAX decks, signal error instead
			if (UserSettings._get('decks').length >= Mechanics.maxDecks) {
				this.scene.signalError(`Reached max number of decks (${Mechanics.maxDecks}).`)
			}
			else {
				this.scene.scene.launch('MenuScene', {
					menu: 'paste',
					callback: this.createCallback(),
				})
			}
		}
	}

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

			that.refreshBtns()
		})
	}

	// Create a button for a new user-made deck at the given index
	// Add it to the list of deck buttons, and return it
	private createDeckBtn(i: number): ContainerLite {
		let deck = UserSettings._get('decks')[i]

		let name = deck === undefined ? '' : deck['name']

		let container = new ContainerLite(this.scene, 0, 0, width - Space.pad*2, 50)
		let btn = new Buttons.Decklist(container, 0, 0, name, () => {}, this.deleteDeck(i, container))
		.setDepth(2)
		.setOnClick(this.decklistOnClick(i))

		this.decklistBtns.push(btn)

		return container
	}

	private decklistOnClick(i: number) {
		let that = this

		// Set btn as active, select self and deselect other buttons, set the deck
		return function() {
			let btn = that.decklistBtns[i]

			// Deselect all other buttons
			for (let j = 0; j < that.decklistBtns.length; j++) {
				if (i !== j) {
					that.decklistBtns[j].deselect()
				}
			}
			that.btnPremade.deselect()

			// If it's already selected, deselect it
			if (btn.selected) {
				that.scene.deselect()
			}
			// Otherwise select this button
			else {
				that.savedDeckIndex = i
				that.savedPremadeIndex = undefined

				btn.select()

				let deck = UserSettings._get('decks')[i]

				that.scene.setDeck(deck['value'])

				// Set the displayed avatar to this deck's avatar
				that.scene.setAvatar(deck['avatar'])
				.setName(deck['name'])
			}
		}
	}

	// Deselect whatever deck is currently selected
	deselect(): void {
		this.savedDeckIndex = undefined
		
		this.decklistBtns.forEach(b => {
			b.deselect()
		})
	}

	// Create a button for each deck that user has created
	private createDecklistPanel() {
		let panel = this.scrollablePanel.getElement('panel')

		// Remove any existing content in this panel
		panel.removeAll(true)

		// Instantiate list of deck buttons
		this.decklistBtns = []

		// Create the preexisting decks
		for (var i = 0; i < UserSettings._get('decks').length; i++) {
			panel.add(this.createDeckBtn(i))
		}
	}

	// Create the "New" button which prompts user to make a new deck
	private newDeckCallback(): () => void {
		return () => {
			// If user already has 9 decks, signal error instead
			if (UserSettings._get('decks').length >= Mechanics.maxDecks) {
				this.scene.signalError(`Reached max number of decks (${Mechanics.maxDecks}).`)
			}
			else {
				this.scene.scene.launch('MenuScene', {
					menu: 'newDeck',
					callback: this.createCallback(),
				})
			}
		}
	}

	// Return a callback for when a deck is created (From paste or new deck)
	createCallback(): (name: string, avatar: number, deckCode?: string) => void {
		return (name: string, avatar: number, deckCode?: string) => {
			// Use a default deck name if it's not specified
			if (name === undefined || name === '') {
				const number = this.decklistBtns.length + 1
				name = `${DEFAULT_DECK_NAME} ${number}`
			}

			// Create the deck in storage
			UserSettings._push('decks', {
				name: name,
				value: '',
				avatar: avatar === undefined ? 0 : avatar,
			})

			// Create a new button
			let newBtn = this.createDeckBtn(this.decklistBtns.length)
			this.panel.add(newBtn)
			this.scrollablePanel.layout()

			// Select this deck
			let index = this.decklistBtns.length - 1
			this.decklistBtns[index].onClick()

			// Scroll down to show the new deck
			this.scrollablePanel.t = 1

			// If a deck code was included, populate it
			if (deckCode !== undefined) {
				this.scene.setDeck(deckCode)
			}

			// Refresh each btn based on screen position
			this.refreshBtns()
		}
	}

	// Create a new deck for the user, return success status
	createEmptyDeck(): boolean {
		// If user already has MAX decks, signal error instead
		if (UserSettings._get('decks').length >= Mechanics.maxDecks) {
			return false
		}
		else {
			this.createCallback()(undefined, undefined, '')
			return true
		}
	}

	// Callback for deleting deck with given index
	private deleteDeck(deckIndex: number, container: ContainerLite): () => void {
		let callback = () => {
			// Adjust which deck index is now selected
			if (this.savedDeckIndex === deckIndex) {
				// Deselect the current deck, since it is being deleted
				this.scene.deselect()
			}
			else if (this.savedDeckIndex > deckIndex) {
				this.savedDeckIndex--
			}
			
			// Adjusted the saved user data
			UserSettings._pop('decks', deckIndex)

			// Refresh the decklist panel
			this.createDecklistPanel()

			// Format panel, then ensure we aren't below the panel
			this.scrollablePanel.layout()
			this.scrollablePanel.t = Math.min(1, this.scrollablePanel.t)

			// Refresh each btn based on screen position
			this.refreshBtns()

			// Select whichever deck is selected
			if (this.savedDeckIndex !== undefined) {
				this.selectDeck(this.savedDeckIndex)
			}
		}

		return () => {
			this.scene.scene.launch('MenuScene', {
				menu: 'confirm',
				callback: callback,
				hint: 'delete this deck'
			})
		}
	}

	// Refresh each decklist button so it's enabled iff it's entirely visible in the panel
	// NOTE Workaround for bug with scrollable panels
	private refreshBtns() {
		this.decklistBtns.forEach(btn => {
			// Stop hovering the button

			btn.stopGlow()

			// TODO 173 is the height of the header, but that could change so this needs to be generalized
			const headerBottom = 173 + Space.filterBarHeight

			if (btn.icon.getBounds().top < headerBottom) {
				btn.disable()
			}
			else {
				btn.enable()
			}
		})
	}
}
