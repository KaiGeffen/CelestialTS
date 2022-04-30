import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'
import BaseScene from '../scene/baseScene'


export default class Hint {
	txt: RexUIPlugin.BBCodeText

	constructor(scene: BaseScene) {
		this.txt = scene.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.hint)
		.setOrigin(0.5)
		.setDepth(40)
		.setVisible(false)
		.setAlign('center')

		// Copy mouse position
		let that = this
		scene.input.on('pointermove', (pointer) => {
			this.txt.copyPosition(pointer.position)
		})
	}

	hide(): Hint {
		this.txt.setVisible(false)

		return this
	}

	show(): Hint {
		this.txt.setVisible(true)

		return this
	}

	showCard(card: Card): void {
		this.show()

		this.txt.setText(`[img=${card.name}]`)
		.setFixedSize(Space.cardWidth + Space.padSmall*2, Space.cardHeight + Space.padSmall*2)
		.setOrigin(0, 0.5)
	}

	showText(s: string): void {
		if (s !== '') {
			this.show()			
		}

		this.txt.setText(s)
		.setFixedSize(0, 0)
		
		// Center the text so it stays on screen
		let ratio = this.txt.x / Space.windowWidth
		this.txt.setOrigin(ratio, 1)
	}
}