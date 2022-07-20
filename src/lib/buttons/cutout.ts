import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'
import Button from './button'
import Card from '../card'
import Hint from '../hint'


// Exported buttons
export default class Cutout extends Button {
	name: string
	id: number
	card: Card
	count: number
	container: ContainerLite

	// Whether this card is required for the current mission
	required = false

	constructor(within: ContainerLite,
		card: Card,
		x: number = 0, y: number = 0,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false,
				style: Style.cardCount,
				offsetX: 150,
			},
			icon: {
				name: `cutout-${card.name}`,
				interactive: true,
				noGlow: true,
			},
			callbacks: {
				click: f,
				// When hovered, show the given cards
				hover: () => {
					this.scene.sound.play('hover')
					
					hint.leftPin = this.icon.getRightCenter().x
					hint.showCard(card).disableWaitTime()
					this.icon.setTint(Color.buttonSelected)
				},
				exit: () => {
					hint.hide().enableWaitTime()
					this.icon.clearTint()
				}
			}
		})

		// The base scene's hint text object
		let hint: Hint = within.scene['hint']


		// Set variables
		this.name = card.name
		this.id = card.id
		this.card = card
		
		this.count = 1
		this.container = within

		// Update the displayed text (TODO Temporary until the images show appropriate cards)
		this.updateText()
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

		this.updateText()

		return this
	}

	destroy(): Cutout {
		// Must do exit method so that hover doesn't persist		
		this.onExit()

		this.container.destroy()

		return this
	}

	// Set that this card cannot have more/fewer copies
	setRequired(): Cutout {
		this.required = true

		// Ensure that a lock is used instead of the X
		this.updateText()

		this.onClick = () => {
			this.scene['signalError']("Can't remove a required card.")
		}
		return this
	}

	private updateText(): Cutout {	
		const char = this.required ? '🔒' : 'x'
		// this.setText(`             ${this.name} ${char}${this.count}`)
		this.setText(`${char}${this.count}`)

		return this
	}
}
