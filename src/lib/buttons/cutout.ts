import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'
import Button from './button'


// Exported buttons
export default class Cutout extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		name: string,
		x: number = 0, y: number = 0,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: `                       X${Math.round(Math.random() * 9)}`,
				interactive: false,
				style: Style.cardCount,
			},
			icon: {
				name: `cutout-${name}`,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})


	}

	// Method to increment the count
}
