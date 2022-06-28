import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'

import Icons from './icons'


// TODO Temporary
export default class DecklistButton extends Button {
	btnX: Button

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
				interactive: false,
				offsetX: -45,
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
		this.btnX = new Icons.SmallX(within, x - 70, y, xCallback)
		this.txt.setOrigin(0, 0.5)
	}

	setDepth(value: number): Button {
		let result = super.setDepth(value)

		// Ensure that the x also has depth set after the component behind it
		this.btnX.setDepth(value)

		return result
	}
}
