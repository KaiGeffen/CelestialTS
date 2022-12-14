import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';
import MenuScene from '../menuScene'


const width = 600

export default class DCMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		// let deck = params.deck
		this.createContent(activeScene)

		this.layout()
	}

	private createContent(activeScene: Phaser.Scene) {
		this.sizer.add(this.createHeader('Opponent Disconnected', width))
		.addNewLine()

		const padding = {space: {
			left: Space.pad/2,
			right: Space.pad/2,
		}}

		this.sizer.add(this.createHint(), padding)
		.addNewLine()

		this.sizer.add(this.createButtons(activeScene), padding)
	}

	private createHint() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txt = this.scene.add.text(0, 0, 'Your opponent disconnected, you win!', Style.basic)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	// Create the buttons at the bottom
	private createButtons(activeScene: Phaser.Scene) {
		let sizer = this.scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createReview())
		.addSpace()
		.add(this.createExit(activeScene))

		return sizer
	}

	private createReview(): ContainerLite {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Review', () => {
			this.close()
		})

		return container
	}

	private createExit(activeScene: Phaser.Scene): ContainerLite {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)

		new Buttons.Basic(container, 0, 0, 'Exit', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			this.scene.scene.start("HomeScene")
		})

		return container
	}
}
