import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'
import { Color, Space, Style, Mechanics } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'


const width = 500
const inputTextWidth = 200

class AlterDeckMenu extends Menu {
	// The user inputted name for the deck
	name: string

	// The user selected avatar number
	selectedAvatar: number

	// The deck code for this deck, if any
	deckCode = ''

	// The names for different elements, which differ in different menus
	titleString: string
	confirmString: string

	btnConfirm: Button

	constructor(scene: MenuScene, params, titleString, confirmString, deckName = '') {
		super(scene, width)

		this.name = params.deckName
		this.selectedAvatar = params.selectedAvatar === undefined ? 0 : params.selectedAvatar
		this.titleString = titleString
		this.confirmString = confirmString

		this.createContent(params.callback)

		this.layout()
	}

	private createContent(createCallback: (name: string, avatar: number, deckCode: string) => void) {
		this.createHeader(this.titleString, width)

		const padding = {space: {
			left: Space.pad,
			right: Space.pad,
		}}

		this.sizer.add(this.createName(), padding)
		.addNewLine()
		.add(this.createAvatar(), padding)
		.addNewLine()
		.add(this.createImport(), padding)
		.addNewLine()
		.add(this.createButtons(createCallback), padding)
	}

	private createTitle() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txt = this.scene.add.text(0, 0, this.titleString, Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createName() {
		let that = this

		let sizer = this.scene['rexUI'].add.sizer({width: width - Space.pad * 2})
		sizer.addSpace()

		let inputText = this.scene.add['rexInputText']
		(
			0, 0, inputTextWidth, 40, {
				type: 'text',
				text: that.name,
				placeholder: 'Deck Name',
				tooltip: 'Name for the new deck.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: 10,
				selectAll: true,
				id: 'search-field'
			}
		).on('textchange', function(inputText) {
			that.name = inputText.text
		})

		sizer.add(inputText)
		.addSpace()

		return sizer
	}

	private createAvatar() {
		let that = this

		let fixSizer = this.scene['rexUI'].add.fixWidthSizer({
			width: Space.avatarSize * 3 + Space.pad * 2,
			space: { line: Space.pad },
		})

		let txtHint = this.scene.add.text(0, 0, 'Deck Avatar:', Style.basic)
		fixSizer.add(txtHint)

		let sizer
		let avatars = []
		for (let i = 0; i < 6; i++) {
			if (i % 3 === 0) {
				sizer = this.scene['rexUI'].add.sizer({
					space: {item: Space.pad}
				})

				fixSizer.add(sizer)
				.addNewLine()
			}

			let name = avatarNames[i]
			let avatar = new Buttons.Avatar(sizer, 0, 0, name, () => {
				// Deselect all avatars, then select this one, remember which is selected
				avatars.forEach(a => a.deselect())
				avatar.select()

				that.selectedAvatar = i
			})
			avatars.push(avatar)

			// Select the right avatar
			if (i === this.selectedAvatar) {
				avatar.select()
			} else {
				avatar.deselect()
			}
		}

		return fixSizer
	}

	private createImport() {
		let sizer = this.scene['rexUI'].add.sizer({width: width - Space.pad * 2})
		sizer.addSpace()

		let inputText = this.scene.add['rexInputText']
		(
			0, 0, inputTextWidth, 40, {
				type: 'text',
				text: this.deckCode,
				placeholder: 'Import deck code',
				tooltip: 'Import a deck from clipboard.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: Mechanics.deckSize * 4,
				selectAll: true,
				id: 'search-field'
			}
		).on('textchange', (inputText) => {
			this.deckCode = inputText.text
		})

		sizer.add(inputText)
		.addSpace()

		return sizer
	}

	// Create the buttons at the bottom which navigate to other scenes/menus
	private createButtons(createCallback: (name: string, avatar: number, deckCode: string) => void) {
		let sizer = this.scene['rexUI'].add.sizer({
			width: width - Space.pad * 2,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel())
		.addSpace()
		.add(this.createConfirm(createCallback))

		return sizer
	}

	private createCancel() {
		let container = new ContainerLite(this.scene, 0, 0, Space.buttonWidth, Space.buttonHeight)

		new Buttons.Basic(container, 0, 0, 'Cancel', () => {
			this.scene.scene.stop()
		})

		return container
	}

	private createConfirm(createCallback: (name: string, avatar: number, deckCode: string) => void) {
		let container = new ContainerLite(this.scene, 0, 0, Space.buttonWidth, Space.buttonHeight)

		this.btnConfirm = new Buttons.Basic(container, 0, 0, this.confirmString, () => {
			createCallback(this.name, this.selectedAvatar, this.deckCode)

			// Close this scene
			this.scene.scene.stop()
		})

		return container
	}
}

export class NewDeckMenu extends AlterDeckMenu {
	constructor(scene: MenuScene, params) {
		super(scene, params, 'New Deck', 'Create')
	}
}

export class EditDeckMenu extends AlterDeckMenu {
	constructor(scene: MenuScene, params) {
		super(scene, params, 'Update Deck', 'Update')
	}
}
