import "phaser"
import Button from './button'

import { Style, Color } from '../../settings/settings'


export class UButton extends Button {
	selected: boolean = false

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: true,
				style: Style.textButton,
				hitArea: [new Phaser.Geom.Rectangle(-10, -5, 35, 40), Phaser.Geom.Rectangle.Contains]
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

	// Toggle this button on or off and return its new value
	toggle(): boolean {
		this.selected = !this.selected

		if (this.selected) {
			this.icon.setTint(Color.buttonSelected)
		}
		else {
			this.icon.clearTint()
		}

		return this.selected
	}

	toggleOff(): void {
		this.selected = false
		this.icon.clearTint()
	}
}
