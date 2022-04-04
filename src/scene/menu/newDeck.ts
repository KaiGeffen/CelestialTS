import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'

import Menu from './menu'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import { SymmetricButtonSmall } from '../../lib/buttons/backed'


const width = 430
const inputTextWidth = 200

export default class NewDeckMenu extends Menu {
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

	private createContent(scene: Phaser.Scene, panel) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createName(scene))
		.addNewLine()

		panel.add(this.createAvatar(scene))
		.addNewLine()

		panel.add(this.createButtons(scene))
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
        })
		sizer.add(inputText)
		.addSpace()

		return sizer
	}

	private createAvatar(scene: Phaser.Scene) {
		let fixSizer = scene['rexUI'].add.fixWidthSizer({
			width: width,
			space: { line: Space.pad },
		})

		let txtHint = scene.add.text(0, 0, 'Avatar:', Style.basic)
		fixSizer.add(txtHint)

		// TODO One for each character with callbacks
		let sizer
		for (let i = 0; i < 6; i++) {
			if (i % 3 === 0) {
				sizer = scene['rexUI'].add.sizer({
					space: {item: Space.pad}
				})
				
				fixSizer.add(sizer)
				.addNewLine()
			}

			let image = scene.add.image(0, 0, 'avatar-Jules')
			sizer.add(image)
		}

		return fixSizer
	}


	// Create the buttons at the bottom which navigate to other scenes/menus
	private createButtons(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createCancel(scene))
		.addSpace()
		.add(this.createCreate(scene))

		return sizer
	}

	private createCancel(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'Cancel', () => {
			scene.scene.stop()
		})

		return container
	}

	private createCreate(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'Create', () => {
			scene.scene.start('MenuScene', {menu: 'credits'})
		})

		return container
	}
}
