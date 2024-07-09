import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'
import BaseScene from '../scene/baseScene'
import { allCards, getCard } from '../catalog/catalog'
import { Keyword, keywords } from '../catalog/keywords'


export default class Hint {
	txt: RexUIPlugin.BBCodeText

	// The X position to position flush to, or undefined if no pin
	leftPin: number

	// Time in milliseconds that user has waited without moving cursor
	waitTime = 0
	skipWait = false

	constructor(scene: Phaser.Scene) {
		this.txt = scene['rexUI'].add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.hint)
		.setOrigin(0.5, 1)
		.setDepth(40)
		.setVisible(false)
		.setAlign('center')

		// Copy mouse position and show a hint when over a hinted object
		scene.input.on('pointermove', () => {
			this.orientText()
			if (!this.skipWait) {
				this.txt.setAlpha(0)
				this.waitTime = 0
			}
		})
		scene.events.on('update', (time, delta) => {
			if (this.waitTime < Time.hint && !this.skipWait) {
				this.waitTime += delta
			}
			else {
				this.txt.setAlpha(1)
			}
		})
	}

	hide(): Hint {
		this.txt.setVisible(false)

		// Reset the pin, since the next hovered item might not pin
		this.leftPin = undefined

		return this
	}

	show(): Hint {
		this.orientText()
		this.txt.setVisible(true)

		return this
	}

	showCard(card: Card | string): Hint {
		this.show()

		// Explain any keywords within the card
		if (typeof card === 'string') {
			card = getCard(card)
		}
		
		let hintText = card.getHintText()
		const referencedImages = card.getReferencedCards().map((card) => {
			return ` [img=${card.name}]`
		}).join()
		if (hintText !== '') {
			this.showText(hintText)

			// NOTE This is a hack because of a bug where card image renders with a single line's height
			this.txt
			.setText(`[img=${card.name}]`)
			.appendText(`[color=grey]${referencedImages}[/color]`)
			.appendText('\n\n\n\n\n\n\n\n\n\n\n\n')
			.appendText(`\n${hintText}`)
			.setFixedSize(0, 0)
		}
		else {
			const width = card.getReferencedCards().length > 0 ? Space.maxTextWidth + Space.pad : Space.cardWidth + Space.pad
			this.txt.setText(`[img=${card.name}]`)
			.appendText(`${referencedImages}`)
			.setFixedSize(
				width,
				Space.cardHeight + Space.pad
				)
		}

		return this
	}

	showText(s: string): void {
		if (s !== '') {
			this.show()
		}

		this.txt.setText(s)
		.setFixedSize(0, 0)
	}

	// TODO Use in more places, instead of forming a string then passing to showText
	showKeyword(name: string): void {
		keywords.forEach(keyword => {
			if (keyword.key === name) {
				let s = keyword.text

				if (keyword.x) {
					s = s.replace(' X', '')
				}

				this.showText(s)
				return
			}
		})
	}

	enableWaitTime(): void {
		this.skipWait = false
	}

	disableWaitTime(): void {
		this.skipWait = true
	}

	// Orient the text to be in the right position relative to the mouse
	private orientText(): void {
		const pointer = this.txt.scene.game.input.activePointer

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