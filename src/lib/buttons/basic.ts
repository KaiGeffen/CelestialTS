import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export default class BasicButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		text: string,
		f: () => void = function() {},
		playSound: boolean = true
		)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'Button',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
