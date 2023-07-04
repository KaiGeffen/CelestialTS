import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color, Time, Flags } from '../../settings/settings'
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
				// On mobile, interactive through scrollable panel
				interactive: !Flags.mobile,
				noGlow: true,
			},
			callbacks: {
				click: Flags.mobile ? () => {
					this.scene.scene.launch('MenuScene', {
						menu: 'focus',
						card: card,
						cost: undefined,
						btnString: 'Remove',
						closeOnClick: () => {
							return this.count === 0
						},
						callback: f,
					})
				} : f,
				// When hovered, show the given cards
				hover: () => {
					hint.leftPin = this.icon.getRightCenter().x
					hint.showCard(card).disableWaitTime()
					this.icon.setTint(Color.buttonSelected)
				},
				exit: () => {
					hint.hide().enableWaitTime()
					this.icon.clearTint()
				}
			},
			sound: {
				mute: Flags.mobile,
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

		this.updateText()
	}

	setOnClick(f: () => void): Cutout {
		if (Flags.mobile) {
			super.setOnClick(() => {
				this.scene.scene.launch('MenuScene', {
						menu: 'focus',
						card: this.card,
						cost: undefined,
						btnString: 'Remove',
						closeOnClick: () => {
							return this.count === 0
						},
						callback: f,
					})
			})
		}
		else {
			super.setOnClick(f)
		}

		return this
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

		this.onClick = () => {
			this.scene['signalError']("Can't remove a required card.")
		}

		return this
	}

	// Set that this card is a part of a premade deck
	setPremade(): Cutout {
		this.onClick = () => {
			this.scene['signalError']("Can't make changes to premade decks.")
		}

		return this
	}

	tween: Phaser.Tweens.Tween
	stopFlash(): void {
		if (this.tween) {
			this.tween.stop()
		}
	}

	private updateText(): Cutout {	
		const char = 'x'
		
		this.setText(`${char}${this.count}`)

		this.stopFlash()
		this.tween = this.scene.tweens.add({
			targets: this.txt,
			alpha: 0,
			duration: Time.flash,
			yoyo: true,
			onStart: () => {
				this.txt.alpha = 1
			}
		})

		return this
	}
}
