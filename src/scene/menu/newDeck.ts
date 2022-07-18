import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'
import { Color, Space, Style } from '../../settings/settings'
import Menu from './menu'


const width = 500
const inputTextWidth = 200

class AlterDeckMenu extends Menu {
	// The user inputted name for the deck
	name: string

	// The user selected avatar number
	selectedAvatar: number

	// The names for different elements, which differ in different menus
	titleString: string
	confirmString: string

	btnConfirm: Button

	constructor(scene: Phaser.Scene, params, titleString, confirmString, deckName = '') {
		super(scene)

		this.name = params.deckName
		this.selectedAvatar = params.selectedAvatar === undefined ? 0 : params.selectedAvatar
		this.titleString = titleString
		this.confirmString = confirmString

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel, params.callback)

		panel.layout()
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width,

			align: 'center',
			space: {
				bottom: Space.padSmall,
				line: Space.pad,

			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, createCallback: (name: string, avatar: number) => void) {
		panel.add(this.createHeader(this.titleString, width))
		.addNewLine()

		const padding = {space: {
			left: Space.pad,
			right: Space.pad,
		}}

		panel.add(this.createName(scene), padding)
		.addNewLine()

		panel.add(this.createAvatar(scene), padding)
		.addNewLine()

		panel.add(this.createButtons(scene, createCallback), padding)
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, this.titleString, Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createName(scene: Phaser.Scene) {
		let that = this

		let sizer = scene['rexUI'].add.sizer({width: width - Space.pad * 2})
		sizer.addSpace()

		let inputText = scene.add['rexInputText']
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
			if (inputText.text.length === 0) {
				that.btnConfirm.disable()
			} else {
				that.btnConfirm.enable()
			}
			that.name = inputText.text
		})

		sizer.add(inputText)
		.addSpace()

		return sizer
	}

	private createAvatar(scene: Phaser.Scene) {
		let that = this

		let fixSizer = scene['rexUI'].add.fixWidthSizer({
			width: Space.avatarSize * 3 + Space.pad * 2,
			space: { line: Space.pad },
		})

		let txtHint = scene.add.text(0, 0, 'Deck Avatar:', Style.basic)
		fixSizer.add(txtHint)

		let sizer
		let avatars = []
		for (let i = 0; i < 6; i++) {
			if (i % 3 === 0) {
				sizer = scene['rexUI'].add.sizer({
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
			}
		}

		return fixSizer
	}


	// Create the buttons at the bottom which navigate to other scenes/menus
	private createButtons(scene: Phaser.Scene, createCallback: (name: string, avatar: number) => void) {
		let sizer = scene['rexUI'].add.sizer({
			width: width - Space.pad * 2,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel(scene))
		.addSpace()
		.add(this.createConfirm(scene, createCallback))

		return sizer
	}

	private createCancel(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Cancel', () => {
			scene.scene.stop()
		})

		return container
	}

	private createConfirm(scene: Phaser.Scene, createCallback: (name: string, avatar: number) => void) {
		let that = this

		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		this.btnConfirm = new Buttons.Basic(container, 0, 0, this.confirmString, () => {
			createCallback(that.name, that.selectedAvatar)

			// Close this scene
			scene.scene.stop()
		})

		// Can't create deck if it doesn't have a name
		if (!this.name) {
			this.btnConfirm.disable()
		}

		return container
	}
}

export class NewDeckMenu extends AlterDeckMenu {
	constructor(scene: Phaser.Scene, params) {
		super(scene, params, 'New Deck', 'Create')
	}
}

export class EditDeckMenu extends AlterDeckMenu {
	constructor(scene: Phaser.Scene, params) {
		super(scene, params, 'Update Deck', 'Update')
	}
}
