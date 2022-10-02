import "phaser"
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { Space, Style, Color } from '../../settings/settings'
import Button from './button'


// TODO Animate 2-frame

// Exported buttons
export default class MissionButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			icon: {
				name: 'Mission',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
