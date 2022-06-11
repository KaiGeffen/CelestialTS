import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';


export default class PremadeButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Premade',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
