import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export default class BasicButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		text: string,
		f: () => void = () => {},
		muteClick: boolean = false
		)
	{
		super(within, x, y, 
		{
			text: {
				text: text.toUpperCase(),
				interactive: false,
			},
			icon: {
				name: 'Button',
				interactive: true
			},
			callbacks: {
				click: f
			},
			sound: {
				mute: muteClick,
			},
		})
	}

	setText(s: string): Button {
		return super.setText(s.toUpperCase())
	}

	// Button is a spritesheet with different states
	enable(): this {
		super.enable()
		this.icon.setFrame(0)

		return this
	}
	disable(): this {
		super.disable()
		this.icon.setFrame(1)

		return this
	}

	// Button is a spritesheet with different states
	glow(): this {
		this.icon.setFrame(2)

		return this
	}
	stopGlow(): this {
		this.icon.setFrame(0)

		return this
	}
}
