import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import { Color, Mechanics, Space, Style, UserSettings, Mobile, Scroll } from "../../settings/settings"


const width = Space.decklistPanelWidth

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
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background)
		.setInteractive()

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
				top: Space.filterBarHeight + Space.pad,
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
					top: 10,
					bottom: 10,
					line: 10,
				}}).addBackground(
				this.scene.add.rectangle(0, 0, width, Space.windowHeight, Color.background)
				)

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

	selectDeck(index: number): void {
		this.decklistBtns[index].onClick()
	}

	// Set the currently selected deck name to the given name
	setName(name: string): void {
		if (this.savedDeckIndex === undefined) {
			throw 'Tried to set the deck name but no deck is selected.'
		}

		this.decklistBtns[this.savedDeckIndex].setText(name)
	}
	
	private createHeader(): Phaser.GameObjects.GameObject {
		let sizer = this.scene.rexUI.add.fixWidthSizer({
			space: {
				top: Space.pad,
				left: Space.pad,
				right: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			}
		})

		let container = new ContainerLite(this.scene, 0, 0, width - Space.pad*2, Space.largeButtonHeight)
		this.btnPremade = new Buttons.Premade(container, 0, 0,
			() => {
				// TODO Hand this to a class instead of calling ourselves
				this.scene.scene.launch('MenuScene', {
					menu: 'choosePremade',
					callback: this.premadeCallback()
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

		return sizer
	}

	// Callback for when a premade avatar is clicked on
	premadeCallback(): (i: number) => () => void {
		let that = this
		return function(i: number) {
			return function() {
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

		// Set the on click for this button
		btn.setOnClick(this.decklistOnClick(btn, i))

		this.decklistBtns.push(btn)

		return container
	}

	private decklistOnClick(btn: Button, i: number) {
		let that = this

		// Set btn as active, select self and deselect other buttons, set the deck
		return function() {
			// Deselect all other buttons
			that.decklistBtns.forEach(b => {
				if (b !== btn) b.deselect()
			})
			that.btnPremade.deselect()

			// If it's already selected, deselect it
			if (btn.selected) {
				that.scene.deselect()
			}
			// Otherwise select this button
			else {
				that.savedDeckIndex = i
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
		this.scene.setDeck([])
		
		this.decklistBtns.forEach(b => {
			b.deselect()
		})
	}

	// Create a button for each deck that user has created
	private createDecklistPanel() {
		let panel = this.scrollablePanel.getElement('panel')

		// Remove any existing content in this panel
		panel.removeAll(true)

		// Create the 'New' button
		panel['add'](this.createNewButton(panel))

		// Instantiate list of deck buttons
		this.decklistBtns = []

		// Create the preexisting decks
		for (var i = 0; i < UserSettings._get('decks').length; i++) {
			panel.add(this.createDeckBtn(i))
		}
	}

	// Create the "New" button which prompts user to make a new deck
	private createNewButton(panel): ContainerLite {
		let that = this
		let scene = this.scene

		// Callback for when 'Create' is hit in the menu
		function createCallback(name: string, avatar: number): void {
			// Create the deck in storage
			UserSettings._push('decks', {
				name: name,
				value: scene.getDeckCode(),
				avatar: avatar,
			})

			// Create a new button
			let newBtn = that.createDeckBtn(that.decklistBtns.length)
			panel.add(newBtn)
			that.scrollablePanel.layout()

			// Select that deck
			let index = that.decklistBtns.length - 1
			that.decklistBtns[index].onClick()

			// Scroll down to show the new deck
			that.scrollablePanel.t = 1
		}

		function openNewDeckMenuCallback() {
			// If user already has 9 decks, signal error instead
			if (UserSettings._get('decks').length >= Mechanics.maxDecks) {
				scene.signalError(`Reached max number of decks (${Mechanics.maxDecks}).`)
			}
			else {
				scene.scene.launch('MenuScene', {
					menu: 'newDeck',
					callback: createCallback,
				})
			}
		}

		// TODO Width and height constants
		let container = new ContainerLite(this.scene, 0, 0, width - Space.pad*2, 50)

		let btn = new Buttons.NewDeck(container, 0, 0, 'New Deck', openNewDeckMenuCallback)
		.setDepth(2)

		return container
	}

	// Callback for deleting deck with given index
	private deleteDeck(deckIndex: number, container: ContainerLite): () => void {
		let that = this
		let callback = () => {
			that.savedDeckIndex = undefined
			
			// Adjusted the saved user data
			UserSettings._pop('decks', deckIndex)

			// Adjust values stored in this deck region
			that.scene.deselect()

			// Refresh the decklist panel
			that.createDecklistPanel()

			// Format panel, then ensure we aren't below the panel
			that.scrollablePanel.layout()
			that.scrollablePanel.t = Math.min(1, that.scrollablePanel.t)
		}

		return function() {
			that.scene.scene.launch('MenuScene', {
				menu: 'confirm',
				callback: callback,
				hint: 'delete this deck'
			})
		}
	}
}
