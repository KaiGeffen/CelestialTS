import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';
import MenuScene from '../menuScene'


const width = 500

export default class ConfirmMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		let callback = params.callback
		let hint = params.hint
		this.createContent(callback, hint)

		this.layout()
	}

	private createContent(callback: () => void, hint: string) {
		this.createHeader('Confirm')

		const s = `Are you sure you want to ${hint}?`
		this.createText(s)

		this.sizer.add(this.createButtons(this.scene, callback))
	}

	// Create the buttons at the bottom
	private createButtons(scene: Phaser.Scene, callback: () => void) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel(scene))
		.addSpace()
		.add(this.createOkay(scene, callback))

		return sizer
	}

	private createCancel(scene: Phaser.Scene): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Cancel', () => {
			this.close()
		})

		return container
	}

	private createOkay(scene: Phaser.Scene, callback: () => void): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Okay', () => {
			callback()
			this.close()
		})

		return container
	}
}
