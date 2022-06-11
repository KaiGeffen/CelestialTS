import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import { Style } from '../../settings/settings'


export default class NewDeckButton extends Button {
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
