import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'
import BaseScene from '../scene/baseScene'
import { allCards } from '../catalog/catalog'


export default class Hint {
	txt: RexUIPlugin.BBCodeText

	// TODO
	leftPin: number

	constructor(scene: BaseScene) {
		this.txt = scene.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.hint)
		.setOrigin(0.5, 1)
		.setDepth(40)
		.setVisible(false)
		.setAlign('center')

		// Copy mouse position and show a hint when over a hinted object
		this.copyMousePosition(scene)
	}

	hide(): Hint {
		this.txt.setVisible(false)

		// Reset the pin, since the next hovered item might not pin
		this.leftPin = undefined

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
			this.txt.setText(`[img=${card.name}]\n\n\n\n\n\n\n\n\n\n\n\n\n${hintText}`)
			.setFixedSize(Space.maxTextWidth + Space.pad, 0)
		}
		else {
			this.txt.setText(`[img=${card.name}]`)
			.setFixedSize(Space.cardWidth + Space.pad, Space.cardHeight + Space.pad)
		}
	}

	showText(s: string): void {
		if (s !== '') {
			this.show()			
		}

		this.txt.setText(s)
		.setFixedSize(0, 0)
	}

	private copyMousePosition(scene: BaseScene): void {
		scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			// Unless there is a left pin, center and hover above the mouse position
			if (this.leftPin === undefined) {
				this.txt.setX(pointer.position.x)
				.setOrigin(0.5, 1)
				.setY(pointer.position.y - Space.pad)
			}
			// If there is a pin, go just to the right of that
			else {
				this.txt.setX(this.leftPin + Space.pad)
				.setOrigin(0, 0.5)
				.setY(pointer.position.y)
			}
			
			this.ensureOnScreen()
		})
	}

	// Ensure that the hint is within the screen bounds, if possible
	private ensureOnScreen(): void {
		let txt = this.txt

		let bounds = txt.getBounds()

		let dx = 0
		if (bounds.left < 0) {
			dx = -bounds.left
		}
		else if (bounds.right > Space.windowWidth) {
			dx = Space.windowWidth - bounds.right
		}

		let dy = 0
		if (bounds.top < 0) {
			dy = -bounds.top
		}
		else if (bounds.bottom > Space.windowHeight) {
			dy = Space.windowHeight - bounds.bottom
		}

		txt.setPosition(txt.x + dx, txt.y + dy)
	}
}