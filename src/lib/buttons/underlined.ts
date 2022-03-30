import "phaser"
import Button from './button'


export class UButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: true
			},
			icon: {
				name: 'Underline',
				interactive: false,
				offset: 20
			},
			callbacks: {
				click: f
			}
		})
	}
}
