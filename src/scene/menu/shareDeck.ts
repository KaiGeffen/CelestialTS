import 'phaser'
import { Color, Mechanics, Space, Style } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'


const width = 430
const inputTextWidth = 400

export default class ShareDeckMenu extends Menu {
	// The user inputted name for the deck
	name = ''

	// The user selected avatar number
	selectedAvatar: number

	constructor(scene: MenuScene, params) {
		super(scene, width)

		this.createContent(params.callback, params.currentDeck)

		this.layout()
	}

	onClose(): void {
		
	}

	// private createSizer(scene: Phaser.Scene)  {
	// 	let panel = scene['rexUI'].add.fixWidthSizer(
	// 	{
	// 		x: Space.windowWidth/2,
	// 		y: Space.windowHeight/2,
	// 		width: width,

	// 		align: 'center',
	// 		space: {
	// 			bottom: Space.pad,
	// 			line: Space.pad,
	// 		},
	// 	}
	// 	)

	// 	// Add background
	// 	let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
	// 	panel.addBackground(rect)

	// 	return panel
	// }

	private createContent(textChangeCallback: (inputText) => void, currentDeck: string) {
		this.sizer.add(this.createHeader('Share Deck', width))
		.addNewLine()

		const padding = {space: {
			left: Space.pad/2,
			right: Space.pad/2,
		}}

		// Add hint
		let txtHint = this.scene.add.text(0, 0, 'Copy or paste your deck code here:', Style.basic)
		this.sizer.add(txtHint, padding)
		.addNewLine()

		this.sizer.add(this.createField(textChangeCallback, currentDeck), padding)
	}

	private createField(textChangeCallback: (inputText) => void, currentDeck: string) {
		let sizer = this.scene['rexUI'].add.sizer({width: width})
		sizer.addSpace()

		let inputText = this.scene.add['rexInputText'](
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
