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

class Edit extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Edit',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Distribution extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Distribution',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Paste extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Paste',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class New extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'New',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Recap extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Recap',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Skip extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Skip',
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
				style: Style.pass,
				offsetX: 7,
				offset: 9,
			},
			icon: {
				name: 'Sun',
				interactive: true,
				circular: true,
			},
			callbacks: {
				click: f
			}
		})

		// Show a hint when hovered
		// const s = 'Pass priority.\nOnce both players have passed in a row, the round ends.'
		// super.makeHintable(s)
	}

	enable() {
		// For the tutorial, disable pass button
		if (this.tutorialSimplifiedPass) {
			this.icon.setAlpha(1)
			return this
		}

		this.setText('PASS')
		super.enable()

		return this
	}

	disable() {
		// TODO Have this be on a cloud instead
		// this.setText('THEIR\nTURN')
		this.setText('')
		super.disable()

		return this
	}

	// Used in the tutorial to reduce the functionality while player is learning
	tutorialSimplifiedPass = false
}

class Moon extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false,
				style: Style.moon,
			},
			icon: {
				name: 'Moon',
				interactive: true,
				circular: true,
			},
			callbacks: {
				click: f
			}
		})

		// Rotate 180 since moon always viewed upside down
		this.txt.setRotation(Math.PI)
		.setAlign('center')
	}
}

// The search bar on Mobile
class Search extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'SearchMobile',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

class Discord extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Discord',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

// Export all of the available icons, which are subtype of buttons
export default class Icons {
	static Options = Options
	static X = X
	static SmallX = SmallX
	static Share = Share
	static Edit = Edit
	static Distribution = Distribution
	static New = New
	static Paste = Paste
	static Recap = Recap
	static Skip = Skip
	static Arrow = Arrow
	static Pass = Pass
	static Moon = Moon
	static Search = Search
	static Discord = Discord
}
