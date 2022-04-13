import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


import Menu from './menu'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import { SymmetricButtonSmall } from '../../lib/buttons/backed'


const width = 400

export default class ModeMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		let panel = this.createSizer(scene)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		let deck = params.deck
		this.createContent(scene, panel, activeScene, deck)

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
				item: Space.pad/2,
				line: Space.pad/2,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, activeScene: Phaser.Scene, deck: string) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createButtons(scene, activeScene, deck))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Choose a Mode', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	// Create the buttons at the bottom
	private createButtons(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createAI(scene, activeScene, deck))
		.addSpace()
		.add(this.createPVP(scene, activeScene, deck))
		.addSpace()
		.add(this.createPWD(scene, activeScene, deck))

		return sizer
	}

	private createAI(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'AI', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("GameScene",
			{
					isTutorial: false,
					deck: deck,
					mmCode:'ai',
				}
			)
		})

		return container
	}

	private createPVP(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'PVP', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("GameScene",
			{
					isTutorial: false,
					deck: deck,
				}
			)
		})

		return container
	}

	private createPWD(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'PWD', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("GameScene",
			{
					isTutorial: false,
					deck: deck,
					// TODO Use the usersetting password, add that as a field in this sizer
				}
			)
		})

		return container
	}
}
