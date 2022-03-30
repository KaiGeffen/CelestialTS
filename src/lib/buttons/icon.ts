import "phaser"
import { Space, Style, Color } from '../../settings/settings'

import Button from './button'


// Exported buttons
export class IButtonOptions extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Options',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class IButtonX extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'X',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}