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
		super(scene, width)

		let callback = params.callback
		let start = params.start
		this.createContent(callback, start)

		this.layout()
	}

	private createContent(callback: (string) => void, start: string) {
		this.sizer.add(this.createTitle())
		.addNewLine()

		this.sizer.add(this.createSearch(start))
		.addNewLine()

		this.sizer.add(this.createButtons(callback))
	}

	private createTitle() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txt = this.scene.add.text(0, 0, 'Search', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createSearch(start: string) {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

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
	private createButtons(callback: (string) => void) {
		let sizer = this.scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel())
		.addSpace()
		.add(this.createOkay(() => {
			callback(this.textboxSearch.text)
		}))

		return sizer
	}

	private createCancel(): ContainerLite {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Cancel', () => {
			this.close()
		})

		return container
	}

	private createOkay(callback: () => void): ContainerLite {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Okay', () => {
			callback()
			this.close()
		})

		return container
	}
}
