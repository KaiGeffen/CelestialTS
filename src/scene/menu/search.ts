import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Buttons from '../../lib/buttons/buttons'
import { Color, Space, Style } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'


// TODO Update to use the new header method

const width = 400

export default class SearchMenu extends Menu {
	// The textbox
	textboxSearch

	constructor(scene: MenuScene, params) {
		super(scene)

		let panel = this.createSizer(scene)

		let callback = params.callback
		let start = params.start
		this.createContent(scene, panel, callback, start)

		panel.layout()
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			space: {
				left: Space.pad/2,
				right: Space.pad/2,
				top: Space.pad/2,
				bottom: Space.pad/2,
				line: Space.pad,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, callback: (string) => void, start: string) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createSearch(scene, start))
		.addNewLine()

		panel.add(this.createButtons(scene, callback))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Search', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createSearch(scene: Phaser.Scene, start: string) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		this.textboxSearch = this.scene.add['rexInputText'](
			215, 40, 308, 40, {
				type: 'text',
				text: start,
				placeholder: 'Search',
				tooltip: 'Search for cards by text.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.searchBackground,
				maxLength: 40,
				selectAll: true,
				id: 'search-field'
			})

		sizer.addSpace()
		.add(this.textboxSearch)
		.addSpace()

		return sizer
	}

	// Create the buttons at the bottom
	private createButtons(scene: Phaser.Scene, callback: (string) => void) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel(scene))
		.addSpace()
		.add(this.createOkay(scene, () => {
			callback(this.textboxSearch.text)
		}))

		return sizer
	}

	private createCancel(scene: Phaser.Scene): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Cancel', () => {
			this.close()
		})

		return container
	}

	private createOkay(scene: Phaser.Scene, callback: () => void): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Okay', () => {
			callback()
			this.close()
		})

		return container
	}
}
