import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'
import Button from './button'


// Exported buttons
export class AButtonSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'ButtonA1',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class AButtonLarge extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'ButtonA2',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class SymmetricButtonSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'Button1',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class SymmetricButtonLarge extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'Button2',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class ButtonNewDeck extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				style: Style.basic,
				interactive: false
			},
			icon: {
				name: 'CustomDeck', // TODO Temporary, make and use a different icon
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class AvatarSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		text: string,
		name: string,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: `avatar-${name}`,
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class ButtonInspire extends Button {
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

export class ButtonNourish extends Button {
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
