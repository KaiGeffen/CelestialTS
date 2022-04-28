import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'
import Button from './button'
import Card from '../card'


// Exported buttons
export default class Cutout extends Button {
	name: string
	id: number
	count: number

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		card: Card,
		x: number = 0, y: number = 0,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false,
				style: Style.cardCount,
			},
			icon: {
				name: `cutout-${card.name}`,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})

		this.name = card.name
		this.id = card.id
		this.count = 1
	}

	// Increment the count of this card
	increment(): Cutout {
		this.count += 1

		this.updateText()

		return this
	}

	// Decrement the count of this card, and delete if we reach 0
	decrement(): Cutout {
		this.count -= 1

		if (this.count === 0) {
			this.destroy()
		}
		else {
			this.updateText()
		}

		return this
	}

	private updateText(): Cutout {
		this.setText(`                       X${this.count}`)

		return this
	}
}
