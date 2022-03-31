import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'

import Button from './button'
import { IButtonSmallX } from './icon'


// TODO Temporary
export class ButtonDecklist extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		mainCallback: () => void = function() {},
		xCallback: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				style: Style.basic,
				interactive: false
			},
			icon: {
				name: 'CustomDeck',
				interactive: true
			},
			callbacks: {
				click: mainCallback
			}
		})

		// Adjust the font 

		// Also add an x button on top
		new IButtonSmallX(within, x - 70, y, xCallback)
	}
}
