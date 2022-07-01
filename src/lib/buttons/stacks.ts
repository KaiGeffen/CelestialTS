import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import { Color } from '../../settings/settings'


export class DeckButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false
			},
			icon: {
				name: 'Deck',
				interactive: true
			},
		})
	}
}


export class DiscardButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false
			},
			icon: {
				name: 'Discard',
				interactive: true
			},
		})
	}
}
