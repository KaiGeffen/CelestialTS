import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'

import Menu from './menu'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import { SymmetricButtonSmall } from '../../lib/buttons/backed'
import { ButtonAvatarSmall } from '../../lib/buttons/avatarSelect'
import avatarNames from '../../lib/avatarNames'


const width = 430
const inputTextWidth = 200

export default class NewDeckMenu extends Menu {
	// The user inputted name for the deck
	name = ''

	// The user selected avatar number
	selectedAvatar: number

	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel, params.callback)

		panel.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width,
			// height: 500,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, createCallback: (name: string, avatar: number) => void) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createName(scene))
		.addNewLine()

		panel.add(this.createAvatar(scene))
		.addNewLine()

		panel.add(this.createButtons(scene, createCallback))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'New Deck', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
	}

	private createName(scene: Phaser.Scene) {
		let that = this

		let sizer = scene['rexUI'].add.sizer({width: width})

		// let txtHint = scene.add.text(0, 0, 'Name:', Style.basic)
		// sizer.add(txtHint)
		
		sizer.addSpace()

		let inputText = scene.add['rexInputText'](
			0, 0, inputTextWidth, 40, {
				type: 'text',
				text: '',
				placeholder: 'Name',
				tooltip: 'Name for the new deck.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				backgroundColor: Color.textboxBackground,
				maxLength: 10,
				selectAll: true,
				id: 'search-field'
			}).on('textchange', function(inputText) {
				that.name = inputText.text
			})


			sizer.add(inputText)
			.addSpace()

			return sizer
		}

		private createAvatar(scene: Phaser.Scene) {
			let that = this

			let fixSizer = scene['rexUI'].add.fixWidthSizer({
				width: width,
				space: { line: Space.pad },
			})

			let txtHint = scene.add.text(0, 0, 'Avatar:', Style.basic)
			fixSizer.add(txtHint)

			let sizer
			let avatars = []
			for (let i = 0; i < 6; i++) {
				if (i % 3 === 0) {
					sizer = scene['rexUI'].add.sizer({
						space: {item: Space.pad}
					})

					fixSizer.add(sizer)
					.addNewLine()
				}

				// Callback for when an avatar is clicked on
				// let name = ['Jules', 'Adonis', ] ...
				function callback() {
					avatars.forEach(a => a.deselect())
					avatar.select()

					that.selectedAvatar = i
				}

				let name = avatarNames[i]
				let avatar = new ButtonAvatarSmall(sizer, 0, 0, name, callback)
				avatars.push(avatar)

				// Select the first avatar, as a default
				if (i === 0) {
					avatar.select()
				}
			}

			return fixSizer
		}


		// Create the buttons at the bottom which navigate to other scenes/menus
		private createButtons(scene: Phaser.Scene, createCallback: (name: string, avatar: number) => void) {
			let sizer = scene['rexUI'].add.sizer({
				width: width,
				space: {
					item: Space.pad
				}
			})

			sizer
			.add(this.createCancel(scene))
			.addSpace()
			.add(this.createCreate(scene, createCallback))

			return sizer
		}

		private createCancel(scene: Phaser.Scene) {
			let container = new ContainerLite(scene, 0, 0, 100, 50)

			new SymmetricButtonSmall(container, 0, 0, 'Cancel', () => {
				scene.scene.stop()
			})

			return container
		}

		private createCreate(scene: Phaser.Scene, createCallback: (name: string, avatar: number) => void) {
			let that = this

			let container = new ContainerLite(scene, 0, 0, 100, 50)

			new SymmetricButtonSmall(container, 0, 0, 'Create', () => {
				createCallback(that.name, that.selectedAvatar)

				// Close this scene
				scene.scene.stop()
			})

			return container
		}
	}
