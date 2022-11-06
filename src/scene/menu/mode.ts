import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Button from '../../lib/buttons/button';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';
import MenuScene from '../menuScene'


const width = 550

export default class ModeMenu extends Menu {
	password: string

	avatar: number

	// Password button
	btnPwd: Button

	constructor(scene: MenuScene, params) {
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
		.add(this.createAI(scene, activeScene, deck))
		.addNewLine()
		.add(this.createPVP(scene, activeScene, deck))
		.addNewLine()
		.add(this.createPWD(scene, activeScene, deck))
		.addNewLine()
		.add(this.createPasswordEntry(scene))
		.addNewLine()
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

				if (inputText.text === '') {
					that.btnPwd.disable()
				}
				else {
					that.btnPwd.enable()
				}
			})

			return inputText
	}

	private createAI(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string) {
		let sizer = scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = scene.add.text(0, 0, 'Versus computer opponent', Style.basic)

		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)
		new Buttons.Basic(container, 0, 0, 'AI', () => {
			activeScene.scene.stop()

			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					mmCode:'ai',
					avatar: this.avatar,
				}
			)
		})
		
		// Add the objects with correct spacing
		sizer.add(txt)
		.addSpace()
		.add(container)

		return sizer
	}

	private createPVP(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string) {
		let sizer = scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = scene.add.text(0, 0, 'Versus human opponent', Style.basic)

		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)
		new Buttons.Basic(container, 0, 0, 'PVP', () => {
			activeScene.scene.stop()

			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					avatar: this.avatar,
				}
			)
		})
		
		// Add the objects with correct spacing
		sizer.add(txt)
		.addSpace()
		.add(container)

		return sizer
	}

	private createPWD(scene: Phaser.Scene, activeScene: Phaser.Scene, deck: string) {
		let sizer = scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = scene.add.text(0, 0, 'Versus same password', Style.basic)

		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)
		this.btnPwd = new Buttons.Basic(container, 0, 0, 'PWD', () => {
			activeScene.scene.stop()

			// Start the home scene
			scene.scene.start("StandardGameScene",
			{
					isTutorial: false,
					deck: deck,
					mmCode: this.password,
					avatar: this.avatar,
				}
			)
		}).disable()
		
		// Add the objects with correct spacing
		sizer.add(txt)
		.addSpace()
		.add(container)

		return sizer
	}

}
