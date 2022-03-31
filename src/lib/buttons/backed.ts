import "phaser"
import { Space, Style, Color } from '../../settings/settings'

import Button from './button'


// Exported buttons
export class AButtonSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
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
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
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
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
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
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
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

// TODO Temporary
export class ButtonCustomDeck extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			// text: {
			// 	text: text,
			// 	interactive: false
			// },
			icon: {
				name: 'CustomDeck',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
