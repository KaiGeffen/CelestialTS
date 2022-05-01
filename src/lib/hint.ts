import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'
import BaseScene from '../scene/baseScene'
import { allCards } from '../catalog/catalog'


export default class Hint {
	txt: RexUIPlugin.BBCodeText

	constructor(scene: BaseScene) {
		this.txt = scene.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.hint)
		.setOrigin(0, 1)
		.setDepth(40)
		.setVisible(false)
		.setAlign('center')

		// Copy mouse position
		let that = this
		scene.input.on('pointermove', (pointer) => {
			this.txt.copyPosition(pointer.position)
			this.ensureOnScreen()
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

		// Explain any keywords within the card
		let hintText = card.getHintText()
		if (hintText !== '') {
			this.showText(hintText)

			// NOTE This is a hack because of a bug where card image renders with a single line's height
			this.txt.setText(`[img=${card.name}]\n\n\n\n\n\n\n\n\n\n\n${hintText}`)
			.setFixedSize(Space.maxTextWidth + Space.pad, 0)
		}
		else {
			this.txt.setText(`[img=${card.name}]`)
			.setFixedSize(Space.cardWidth + Space.pad, Space.cardHeight + Space.pad)
		}

		

		// 
		// let width = Math.max(bounds.width, Space.cardWidth + Space.padSmall*2)
		// let height = bounds.height + Space.cardHeight

		// this.txt.setFixedSize(width, height)
	}

	showText(s: string): void {
		if (s !== '') {
			this.show()			
		}

		this.txt.setText(s)
		.setFixedSize(0, 0)
	}

	// Ensure that the hint is within the screen bounds, if possible
	private ensureOnScreen(): void {
		let txt = this.txt

		let bounds = txt.getBounds()

		// Default to going left and up from the cursor
		// If the right side of txt is beyond right side of window, move left that much
		if (txt.x + bounds.width > Space.windowWidth) {
			txt.setX(Space.windowWidth - bounds.width)
		}

		// If above the top of the screen, lower by that amount
		if (txt.y - bounds.height < 0) {
			txt.setY(bounds.height)
		}
	}
}