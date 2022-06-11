import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'


// Used when selected an avatar, when editing an avatar, and in a match
// These have different callbacks, and edit has an additional icon
// TODO Separate or clarify these roles
export default class AvatarButton extends Button {
	editIcon: Button

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		name: string | number,
		f: () => void = function() {},
		hasEditIcon = false)
	{
		// If an id was given instead of a string, get the string
		if (typeof name === 'number') {
			name = avatarNames[name]
		}

		super(within, x, y, 
		{
			icon: {
				name: `avatar-${name}`,
				interactive: true,
			},
			callbacks: {
				click: f
			}
		})

		if (hasEditIcon) {
			let edit = this.scene.add.image(x + 45, y + 45, 'icon-Edit')
			if (within instanceof Phaser.GameObjects.Container || within instanceof ContainerLite) {
				within.add(edit)
			}
		}
	}

	setQuality(num: number): Button {
		let name = avatarNames[num]
		this.setTexture(`avatar-${name}`)

		return this
	}
}
