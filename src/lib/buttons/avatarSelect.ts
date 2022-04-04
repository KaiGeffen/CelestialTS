import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'
import Button from './button'


export class ButtonAvatarFull extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		name: string,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: `avatar-${name}Full`,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})

		this.txt.setY(-400)
	}
}

export class ButtonAvatarSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		name: string,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			icon: {
				name: `avatar-${name}`,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
