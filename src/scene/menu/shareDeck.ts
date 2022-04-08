import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import avatarNames from '../../lib/avatarNames';
import { ButtonAvatarSmall } from '../../lib/buttons/avatarSelect';
import { SymmetricButtonSmall } from '../../lib/buttons/backed';
import { Color, Space, Style, Mechanics } from '../../settings/settings';
import Menu from './menu';


const width = 430
const inputTextWidth = 400

export default class ShareDeckMenu extends Menu {
	// The user inputted name for the deck
	name = ''

	// The user selected avatar number
	selectedAvatar: number

	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel, params.callback, params.currentDeck)

		panel.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene,
		panel,
		textChangeCallback: (inputText) => void,
		currentDeck: string)
	{
		panel.add(this.createTitle(scene))
		.addNewLine()

		// Add hint
		let txtHint = scene.add.text(0, 0, 'Copy or paste your deck code here:', Style.basic)
		panel.add(txtHint)
		.addNewLine()

		panel.add(this.createField(scene, textChangeCallback, currentDeck))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Share Deck', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createField(scene: Phaser.Scene, textChangeCallback: (inputText) => void, currentDeck: string) {
		let that = this

		let sizer = scene['rexUI'].add.sizer({width: width})
		sizer.addSpace()

		let inputText = scene.add['rexInputText'](
			0, 0, inputTextWidth, 40, {
				type: 'text',
				text: currentDeck,
				placeholder: 'Deck code',
				tooltip: 'Copy/paste deck codes here.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: 4 * Mechanics.deckSize,
				selectAll: true,
			}).on('textchange', textChangeCallback)

		sizer.add(inputText)
		.addSpace()

		return sizer
	}
}
