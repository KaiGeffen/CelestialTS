import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';


const width = 500

export default class ConfirmMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		let panel = this.createSizer(scene)

		let callback = params.callback
		let hint = params.hint
		this.createContent(scene, panel, callback, hint)

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

	private createContent(scene: Phaser.Scene, panel, callback: () => void, hint: string) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createHint(scene, hint))
		.addNewLine()

		panel.add(this.createButtons(scene, callback))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Confirm', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createHint(scene: Phaser.Scene, hint: string) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, `Are you sure you want to ${hint}?`, Style.basic)

		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
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
