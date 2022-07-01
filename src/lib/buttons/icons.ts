import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { Space, Style, Color } from '../../settings/settings'
import Button from './button'


// Exported buttons
class Options extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Options',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

// TODO Is this used?
class X extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'X',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class SmallX extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			icon: {
				name: 'SmallX',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Share extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Share',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Arrow extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		theta: number, // In 90 degree increments from north
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Arrow',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})

		this.icon.setRotation(theta * Math.PI/2)
	}
}

// TODO Not really an icon, move somewhere else?
class Pass extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: 'PASS',
				interactive: false,
				style: Style.huge,
			},
			icon: {
				name: 'Pass',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}

	enable() {
		this.setText('PASS')
		super.enable()

		return this
	}

	disable() {
		this.setText('THEIR\nTURN')
		super.disable()

		return this
	}
}


// Export all of the available icons, which are subtype of buttons
export default class Icons {
	static Options = Options
	static X = X
	static SmallX = SmallX
	static Share = Share
	static Arrow = Arrow
	static Pass = Pass
}
