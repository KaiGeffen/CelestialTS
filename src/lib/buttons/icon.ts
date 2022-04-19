import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color } from '../../settings/settings'

import Button from './button'


// Exported buttons
export class IButtonOptions extends Button {
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

export class IButtonX extends Button {
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

export class IButtonSmallX extends Button {
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

export class IButtonPremade extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Premade',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class IButtonShare extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
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

// TODO Not really an icon, move somewhere else?
export class IButtonPass extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Pass',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}