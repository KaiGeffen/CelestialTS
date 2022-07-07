import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

// TODO Remove, use Buttons namespace
import { ButtonAvatarFull } from '../../lib/buttons/avatarSelect'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'

import Menu from './menu'
import { Style, Space, Color } from '../../settings/settings'
import avatarNames from '../../lib/avatarNames'


export default class ChoosePremade extends Menu {
	avatarFull: Phaser.GameObjects.Image
	txtName: Phaser.GameObjects.Text
	txtSurname: Phaser.GameObjects.Text
	txtDescription: Phaser.GameObjects.Text

	constructor(scene: Phaser.Scene, params) {
		let callback: (number) => () => void = params.callback
		super(scene)

		this.createSizer()
	}

	private createSizer(): void {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			width: Space.windowWidth,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			}
		}).setOrigin(0)

		sizer.add(this.createHeader())
		.addNewLine()
		.add(this.createPanel())

		sizer.layout().layout()
	}

	private createHeader(): any {
		let panel = this.scene['rexUI'].add.sizer({
			width: Space.windowWidth
		})

		// Add each of the avatars
		for (let i = 0; i < avatarNames.length; i++) {
			let container = new ContainerLite(this.scene, 0, 0, Space.avatarSize, Space.avatarSize)
			let avatarSmall = new Buttons.Avatar(container, 0, 0, i, () => {
				this.avatarFull.setTexture(`avatar-${avatarNames[i]}Full`)
				this.txtName.setText(`${avatarNames[i]}`)
			})
			
			panel.add(container)
			.addSpace()
		}

		return panel
	}

	// Create all of the content about the selected character
	private createPanel(): void {
		let panel = this.scene['rexUI'].add.sizer({
			// width: Space.windowWidth,
			space: {
				// left: 200,
				item: Space.pad,
			},
			align: 'top',
		})

		// TODO Set when opening
		this.avatarFull = this.scene.add.image(0, 0, `avatar-${avatarNames[0]}Full`)
		
		// Scale to fit in the window
		let space = Space.windowHeight - Space.pad * 3 - Space.avatarSize
		let ratio = space / this.avatarFull.height
		this.avatarFull.setScale(ratio)

		panel.add(this.avatarFull)
		.add(this.createText(), {align: 'top'})

		return panel
	}

	private createText(): any {
		let panel = this.scene['rexUI'].add.fixWidthSizer()

		// TODO i
		this.txtName = this.scene.add.text(0, 0, avatarNames[0], Style.announcement)
		this.txtSurname = this.scene.add.text(0, 0, 'Dove boi does bird things', Style.surname)
		const s = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet malesuada massa. Nulla eget dolor tortor. `
		this.txtDescription = this.scene.add.text(0, 0, s, Style.basic)

		// Add all this text to the panel
		panel.add(this.txtName)
		.addNewLine()
		.add(this.txtSurname, {expand: true})
		.addNewLine()
		.add(this.txtDescription)

		return panel
	}

	private createButtons(): any {
		let panel = this.scene['rexUI'].add.sizer({
			space: {
				item: Space.pad,
			}
		})

		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
		let btn = new Buttons.Basic(container, 0, 0, 'hewwo')
		panel.add(container)

		let c2 = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
		let btn2 = new Buttons.Basic(c2, 0, 0, 'hewwo')
		panel.add(c2)

		return panel
	}
}
