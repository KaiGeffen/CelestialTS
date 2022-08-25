import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'
import { Color, Space, Style, Mechanics } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'


const width = 500
const inputTextWidth = 400

export default class PasteMenu extends Menu {
	deckCode: string

	constructor(scene: MenuScene, params) {
		super(scene)

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
		panel.add(this.createHeader('Paste Deck Code', width))
		.addNewLine()

		const padding = {space: {
			left: Space.pad,
			right: Space.pad,
		}}

		// Add hint
		let txtHint = scene.add.text(0, 0, 'Paste your deck code here:', Style.basic)
		panel.add(txtHint, padding)
		.addNewLine()

		panel.add(this.createField(scene), padding)
		.addNewLine()

		panel.add(this.createButtons(scene, createCallback), padding)
	}

	private createField(scene: Phaser.Scene) {
		let that = this

		let sizer = scene['rexUI'].add.sizer({width: width})
		sizer.addSpace()

		let inputText = scene.add['rexInputText'](
			0, 0, inputTextWidth, 40, {
				type: 'text',
				text: '',
				placeholder: 'Deck code',
				tooltip: 'Copy/paste deck codes here.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: 4 * Mechanics.deckSize,
				selectAll: true,
			}).on('textchange', function(inputText) {
   				// Set the deck code to the given string
   				that.deckCode = inputText.text
   			})

		sizer.add(inputText)
		.addSpace()

		return sizer
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
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Create', () => {
			createCallback('PASTED', 0, this.deckCode)

			// Close this scene
			scene.scene.stop()
		})

		return container
	}
}
