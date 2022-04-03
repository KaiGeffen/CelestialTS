import 'phaser'

import Menu from './menu'
import { Space, Color, Style } from '../../settings/settings'

const width = 600

export default class OptionsMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel)

		panel.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			// width: width,
			// height: 500,
			// space: {
			// 	left: Space.pad,
			// 	right: Space.pad,
			// 	top: Space.pad,
			// 	bottom: Space.pad,
			// 	item: Space.pad,
			// 	line: Space.pad,
			// },
		}
		)

		panel.addBackground(
			scene.add.rectangle(0, 0, panel.width, panel.height, Color.background, 1).setInteractive()
			)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel) {
		panel.add(this.createVolume(scene))
		.addNewLine()

		panel.add(this.createMusic(scene))
		.addNewLine()

		panel.add(this.createSpeed(scene))
		.addNewLine()
		
		panel.add(this.createAutopass(scene))
		.addNewLine()

		panel.add(this.createReadRulebook(scene))
		.addNewLine()

		panel.add(this.createExit(scene))
		.addNewLine()
	}

	private createVolume(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Volume:', Style.announcement)
		sizer.add(txtVolumeHint)
		sizer.addSpace()
		let txt = scene.add.text(0, 0, 'eeeaaaa', Style.announcement)
		sizer.add(txt)

		return sizer
	}

	private createMusic(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Music:', Style.announcement)
		sizer.add(txtVolumeHint)
		sizer.addSpace()
		let txt = scene.add.text(0, 0, 'ii', Style.announcement)
		sizer.add(txt)

		return sizer
	}

	private createSpeed(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtSpeedHint = scene.add.text(0, 0, 'Speed:', Style.announcement)
		sizer.add(txtSpeedHint)
		sizer.addSpace()
		let txt = scene.add.text(0, 0, 'ii', Style.announcement)
		sizer.add(txt)

		return sizer
	}

	private createAutopass(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Autopass:', Style.announcement)
		sizer.add(txtVolumeHint)
		sizer.addSpace()
		let txt = scene.add.text(0, 0, 'Yes!', Style.announcement)
		sizer.add(txt)

		return sizer
	}

	private createReadRulebook(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtRulebook = scene.add.text(0, 0, 'Read the Rulebook', Style.announcement)
		sizer.addSpace()
		sizer.add(txtRulebook)
		sizer.addSpace()
		// let txt = scene.add.text(0, 0, 'Yes!', Style.announcement)
		// sizer.add(txt)

		return sizer
	}

	private createExit(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtExitHint = scene.add.text(0, 0, 'Exit to main menu?', Style.announcement)
		sizer.add(txtExitHint)
		sizer.addSpace()
		let txt = scene.add.text(0, 0, 'Yes!', Style.announcement)
		sizer.add(txt)

		return sizer
	}
}