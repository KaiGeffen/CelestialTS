import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';
import MenuScene from '../menuScene'


const width = 600

export default class DCMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene)

		let panel = this.createSizer(scene)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		// let deck = params.deck
		this.createContent(scene, panel, activeScene)

		panel.layout()
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			space: {
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

	private createContent(scene: Phaser.Scene, panel, activeScene: Phaser.Scene) {
		panel.add(this.createHeader('Opponent Disconnected', width))
		.addNewLine()

		const padding = {space: {
			left: Space.pad/2,
			right: Space.pad/2,
		}}

		panel.add(this.createHint(scene), padding)
		.addNewLine()

		panel.add(this.createButtons(scene, activeScene), padding)
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Disconnect', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createHint(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Your opponent disconnected, you win!', Style.basic)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	// Create the buttons at the bottom
	private createButtons(scene: Phaser.Scene, activeScene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createReview(scene))
		.addSpace()
		.add(this.createExit(scene, activeScene))

		return sizer
	}

	private createReview(scene: Phaser.Scene): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Review', () => {
			this.close()
		})

		return container
	}

	private createExit(scene: Phaser.Scene, activeScene: Phaser.Scene): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Exit', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("HomeScene")
		})

		return container
	}
}
