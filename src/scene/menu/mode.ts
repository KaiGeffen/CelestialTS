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
		super(scene, width)

		this.avatar = params.avatar

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		let deck = params.deck
		this.createContent(activeScene, deck)

		this.layout()
	}

	private createContent(activeScene: Phaser.Scene, deck: string) {
		this.sizer.add(this.createHeader('Game Mode', width))
		.addNewLine()
		.add(this.createAI(activeScene, deck))
		.addNewLine()
		.add(this.createPVP(activeScene, deck))
		.addNewLine()
		.add(this.createPWD(activeScene, deck))
		.addNewLine()
		.add(this.createPasswordEntry())
		.addNewLine()
	}

	// TODO Replace background with a prerendered visual?
	private createPasswordEntry() {
		let that = this

		let inputText = this.scene.add['rexInputText'](
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

	private createAI(activeScene: Phaser.Scene, deck: string) {
		let sizer = this.scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = this.scene.add.text(0, 0, 'Versus computer opponent', Style.basic)

		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)
		new Buttons.Basic(container, 0, 0, 'AI', () => {
			activeScene.scene.stop()

			this.scene.scene.start("StandardGameScene",
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

	private createPVP(activeScene: Phaser.Scene, deck: string) {
		let sizer = this.scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = this.scene.add.text(0, 0, 'Versus human opponent', Style.basic)

		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)
		new Buttons.Basic(container, 0, 0, 'PVP', () => {
			activeScene.scene.stop()

			this.scene.scene.start("StandardGameScene",
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

	private createPWD(activeScene: Phaser.Scene, deck: string) {
		let sizer = this.scene['rexUI'].add.sizer({width: width - Space.pad*2})

		const txt = this.scene.add.text(0, 0, 'Versus same password', Style.basic)

		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)
		this.btnPwd = new Buttons.Basic(container, 0, 0, 'PWD', () => {
			activeScene.scene.stop()

			// Start the home scene
			this.scene.scene.start("StandardGameScene",
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
