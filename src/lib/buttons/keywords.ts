import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { Style } from '../../settings/settings'


export class InspireButton extends Button {
	constructor(within: Phaser.GameObjects.Container,
		x: number, y: number,
		text: string = '',
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false,
				style: Style.basic,
			},
			icon: {
				name: `Inspire`,
				interactive: true,
			},
			callbacks: {
				click: f,
			}
		})

		this.txt.setPosition(x + 40, y + 5).setOrigin(0.5)
	}
}

export class NourishButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		text: string = '',
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false,
				style: Style.basic,
			},
			icon: {
				name: `Nourish`,
				interactive: true
			},
			callbacks: {
				click: f,
			}
		})

		this.txt.setPosition(x + 40, y + 5).setOrigin(0.5)
	}
}
