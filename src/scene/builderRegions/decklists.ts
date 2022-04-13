import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import premadeDecklists from '../../catalog/premadeDecklists';
import avatarNames from '../../lib/avatarNames';
import { ButtonNewDeck } from '../../lib/buttons/backed';
import Button from '../../lib/buttons/button';
import { ButtonDecklist } from '../../lib/buttons/decklist';
import { IButtonPremade, IButtonShare } from '../../lib/buttons/icon';
import { Color, Mechanics, Space, Style, UserSettings } from "../../settings/settings";


const width = Space.iconSeparation + Space.pad

// Region of the deck builder which contains all the decklists
export default class DecklistsRegion {  
	scene
	container: ContainerLite

	deckPanel
	width: number

	// The index of the currently selected deck
	savedDeckIndex: number

	// List of buttons for user-defined decks
	decklistBtns: Button[]

	// Image of the current avatar
	avatar: Phaser.GameObjects.Image

	// Create the are where player can manipulate their decks
	create(scene) {
		this.scene = scene
		this.container = new ContainerLite(scene).setDepth(10)

		// Create the main panel, and get the subpanel where lists go
		this.deckPanel = this.createDeckpanel()
		this.container.add(this.deckPanel)
		let panel = this.deckPanel.getElement('panel')

		// Update panel when mousewheel scrolls
		// TODO Should be a part of the above creation of deck panel
		this.updateOnScroll(panel)

		// Add a NEW button
		panel['add'](this.createNewButton(panel))

		// Add each of the decks
		this.createDeckButtons(panel)

		this.deckPanel.layout()

		this.width = this.deckPanel.width

		return this
	}

	// Update the currently selected deck
	updateSavedDeck(deckCode: string): void {
		let index = this.savedDeckIndex
		if (index !== undefined) {
			let deck = UserSettings._get('decks')[index]

			let newDeck = {
				name: deck['name'],
				value: deckCode,
				avatar: deck['avatar']
			}

			UserSettings._setIndex('decks', index, newDeck)
		}
	}

	selectDeck(index: number): void {
		this.decklistBtns[index].onClick()
	}

	getSelectedDeckIndex(): number {
		return this.savedDeckIndex
	}

	// Create and return the scrollable panel where premade decks go
	private createDeckpanel() { // TODO Return type
		let background = this.scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF).setInteractive()

		let panel = this.scene.rexUI.add.scrollablePanel({
			x: 0,
			y: 0,
			width: width,
			height: Space.windowHeight,

			background: background,

			panel: {// TODO Create panel method
				child: this.scene.rexUI.add.fixWidthSizer({space: {
					left: Space.pad,
					right: Space.pad,
					top: 10,
					bottom: 10,
					line: 10,
				}}).addBackground(
				this.scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF)
				)
			},

			header: this.createHeader(),

			space: {
				right: 10,
				// bottom: Space.pad,
			}
		}).setOrigin(0)

		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})

		return panel
	}

	private createHeader(): Phaser.GameObjects.GameObject {
		let sizer = this.scene.rexUI.add.fixWidthSizer({
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.filterBarHeight + Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			}
		})

		this.avatar = this.scene.add.image(0, 0, 'avatar-Jules')
		sizer.add(this.avatar, {padding: {left: 35}}) // TODO

		let callback = this.premadeCallback()
		let btn = new IButtonPremade(this.scene, 0, 0,
			() => {
				// TODO Hand this to a class instead of calling ourselves
				this.scene.scene.launch('MenuScene', {
					menu: 'choosePremade',
					callback: callback
				})
			}
			).setOrigin(0, 0.5)
		sizer.add(btn.icon)

		let line = this.scene.add.line(0, 0, 0, 0, Space.iconSeparation + Space.pad, 0, Color.line)
		sizer.add(line)

		let hintSizer = this.scene['rexUI'].add.sizer({width: width})
		sizer.add(hintSizer)

		let txtHint = this.scene.add.text(0, 0, 'My Decks:', Style.header)
		hintSizer.add(txtHint)
		.addSpace()

		// Add a share button that allows user to copy/paste their deck code
		new IButtonShare(hintSizer, 0, 0, this.shareCallback())

		return sizer
	}

	// Callback for when a premade avatar is clicked on
	private premadeCallback(): (i: number) => () => void {
		let that = this
		return function(i: number) {
			return function() {
				that.savedDeckIndex = undefined

				// Deselect decklist buttons
				that.decklistBtns.forEach(btn => btn.deselect())
				
				// Set the current deck to premade list
				that.scene.setDeck(premadeDecklists[i])

				// Load the approriate avatar TODO
			}
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

	// Update the panel when user scrolls with their mouse wheel
	private updateOnScroll(panel) {
		let that = this

		this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
			// Return if the pointer is outside of the panel
			if (!panel.getBounds().contains(pointer.x, pointer.y)) {
				return
			}

			// Scroll panel down by amount wheel moved
			that.deckPanel.childOY -= dy

			// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
			that.deckPanel.t = Math.max(0, that.deckPanel.t)
			that.deckPanel.t = Math.min(0.999999, that.deckPanel.t)
		})
	}

	// Create a button for a new user-made deck at the given index
	// Add it to the list of deck buttons, and return it
	private createDeckBtn(i: number): ContainerLite {
		let deck = UserSettings._get('decks')[i]

		let name = deck === undefined ? '' : deck['name']

		let container = new ContainerLite(this.scene, 0, 0, 200, 50)
		let btn = new ButtonDecklist(container, 0, 0, name, () => {console.log('hi')}, this.deleteDeck(i, container))

		// Highlight this deck, if it's selected
		// if (this.savedDeckIndex === i) {So that layout happens correctly setTimeout(() => btn.select(), 4)}

		// Set as active, select self and deselect other buttons, set the deck
		let that = this
		btn.setOnClick(() => {
			// Deselect all other buttons
			that.decklistBtns.forEach(b => {if (b !== btn) b.deselect()})

			// If it's already selected, deselect it
			if (btn.selected) {
				console.log('Deselecting')
				that.savedDeckIndex = undefined
				that.scene.setDeck([])
				btn.deselect()
			}
			// Otherwise select this button
			else {
				console.log('Selecting')
				that.savedDeckIndex = i
				btn.select()

				that.scene.setDeck(UserSettings._get('decks')[i]['value'])

				// Set the displayed avatar to this deck's avatar
				that.setAvatar(UserSettings._get('decks')[i]['avatar'])
			}
		})

		this.decklistBtns.push(btn)

		return container
	}

	// Create a button for each deck that user has created
	private createDeckButtons(panel) {
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
			that.deckPanel.layout()

			// Select that deck
			let index = that.decklistBtns.length - 1
			that.decklistBtns[index].onClick()

			// Scroll down to show the new deck
			that.deckPanel.t = 1
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
		let container = new ContainerLite(this.scene, 0, 0, 200, 50)

		let btn = new ButtonNewDeck(container, 0, 0, 'New Deck', openNewDeckMenuCallback)

		return container
	}

	// Callback for deleting deck with given index
	private deleteDeck(i: number, container: ContainerLite): () => void {
		let that = this

		return function() {
			// Adjusted the saved user data
			UserSettings._pop('decks', i)

			// Adjust values stored in this deck region
			that.decklistBtns.splice(i)
			that.savedDeckIndex = undefined
			that.scene.setDeck([])

			// Destroy the object itself
			container.destroy()

			// Format panel, then ensure we aren't below the panel
			that.deckPanel.layout()
			that.deckPanel.t = Math.min(1, that.deckPanel.t)
		}
	}


	// Change the displayed avatar to the given avatar
	private setAvatar(id: number) {
		// TODO Require all decks to have an avatar
		id = id === undefined ? 0 : id

		this.avatar.setTexture(`avatar-${avatarNames[id]}`)
	}
}
