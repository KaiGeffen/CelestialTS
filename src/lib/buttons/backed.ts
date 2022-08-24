import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export default class BackedButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		text: string,
		image: string,
		f: () => void = function() {},
		playSound: boolean = true
		)
	{
		super(within, x, y, 
		{
			text: {
				text: text.toUpperCase(),
				interactive: false,
				offset: -4,
			},
			icon: {
				name: image,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}

	setText(s: string): Button {
		return super.setText(s.toUpperCase())
	}
}
