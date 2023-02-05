import 'phaser'
import Button from './button'
import { Style, Color } from '../../settings/settings'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export default class TextButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: true,
				style: Style.textButton,
				hitArea: [
					new Phaser.Geom.Rectangle(0, 0, 100, 60),
					Phaser.Geom.Rectangle.Contains
					]
			},
			callbacks: {
				click: f
			}
		})
	}
}
