import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';


const width = 550

export default class ModeMenu extends Menu {
	password: string

	avatar: number

	constructor(scene: Phaser.Scene, params) {
		super(scene)

		this.avatar = params.avatar

		let panel = this.createSizer(scene)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		let deck = params.deck
		this.createContent(scene, panel, activeScene, deck)

		panel.layout()
	}

	private createSizer(scene: Phaser.Scene): any {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,

			align: 'center',
			space: {
				bottom: Space.padSmall,
				line: Space.pad * 2,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, activeScene: Phaser.Scene, deck: string) {
		panel.add(this.createHeader('Game Mode', width))
		.addNewLine()

		panel.add(this.createPasswordEntry(scene))
		.addNewLine()

		panel.add(this.createButtons(scene, activeScene, deck))
	}

	// TODO Replace background with a prerendered visual?
	private createPasswordEntry(scene: Phaser.Scene) {
		let that = this

		let inputText = scene.add['rexInputText'](
			0, 0, width - Space.pad * 2, 40, {
				type: 'text',
				text: '', // Retain the last password
				placeholder: 'Password',
				tooltip: 'Password for PWD mode.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: 10,
				selectAll: true,
				id: 'search-field'
			}).on('textchange', function(inputText) {
				that.password = inputText.text
			})

			return inputText
	}

	// Create the buttons at the bottom
	private createButtons(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string) {
		let sizer = scene['rexUI'].add.sizer({width: width - Space.pad*2})

		sizer
		.add(this.createAI(scene, activeScene, deck))
		.addSpace()
		.add(this.createPVP(scene, activeScene, deck))
		.addSpace()
		.add(this.createPWD(scene, activeScene, deck))

		return sizer
	}

	private createAI(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'AI', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					mmCode:'ai',
					avatar: this.avatar,
				}
			)
		})

		return container
	}

	private createPVP(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'PVP', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					avatar: this.avatar,
				}
			)
		})

		return container
	}

	private createPWD(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string): ContainerLite {
		let that = this
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'PWD', () => {
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					mmCode: that.password,
					avatar: this.avatar,
				}
			)
		})//.disable()

		return container
	}
}
