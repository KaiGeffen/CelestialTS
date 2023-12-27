import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'
import BaseScene from '../scene/baseScene'
import { allCards, getCard } from '../catalog/catalog'
import { Keyword, keywords } from '../catalog/keywords'


export default class Hint {
	scene: Phaser.Scene

	element: HTMLElement
	
	// The X position to position flush to, or undefined if no pin
	leftPin: number

	// Time in milliseconds that user has waited without moving cursor
	waitTime = 0
	skipWait = false

	constructor(scene: Phaser.Scene) {
		this.scene = scene
		this.element = document.getElementById('hint')

		// Copy mouse position and show a hint when over a hinted object
		scene.input.on('pointermove', () => {
			if (!this.skipWait) {
				this.element.style.opacity = "0"
				this.waitTime = 0
			}
			this.orientText()
		})
		scene.events.on('update', (time, delta) => {
			if (this.waitTime < Time.hint && !this.skipWait) {
				this.waitTime += delta
			}
			else {
				this.element.style.opacity = "1"
			}
		})
	}

	hide(): Hint {
		this.element.style.display = "none"

		// Reset the pin, since the next hovered item might not pin
		this.leftPin = undefined

		return this
	}

	show(): Hint {
		this.orientText()
		this.element.style.display = 'flex'

		return this
	}

	showCard(card: Card | string): Hint {
		this.show()

		// Explain any keywords within the card
		if (typeof card === 'string') {
			card = getCard(card)
		}
		
		// Text
		let hintText = card.getHintText()
		this.showText(hintText)

		// Images
		let cardImages = document.createElement('div')

		// Add this card's image
		let img = document.createElement('img')
		img.src = `assets/cards/${card.name}.webp`
		cardImages.append(img)

		// Add any references cards images
		card.getReferencedCards().forEach(refCard => {
			let img = document.createElement('img')
			img.src = `assets/cards/${refCard.name}.webp`
			img.style.marginLeft = '10px'
			cardImages.append(img)
		})

		// Add all of the 
		this.element.prepend(cardImages)

		return this
	}

	showText(s: string): void {
		if (s !== '') {
			this.show()
		}

		this.element.textContent = s
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
		const pointer = this.scene.game.input.activePointer

		// Unless there is a left pin, center and hover above the mouse position
		if (this.leftPin === undefined) {
			this.element.style.left = `${pointer.position.x}px`
			this.element.style.top = `${pointer.position.y - Space.pad}px`
			this.element.style.transform = 'translate(-50%, -100%)'

			// this.txt.setX(pointer.position.x)
			// .setOrigin(0.5, 1)
			// .setY(pointer.position.y - Space.pad)
		}
		// If there is a pin, go just to the right of that
		else {
			this.element.style.left = `${this.leftPin + Space.pad}px`
			this.element.style.top = `${pointer.position.y}px`
			this.element.style.transform = 'translate(0%, -50%)'

			// this.txt.setX(this.leftPin + Space.pad)
			// .setOrigin(0, 0.5)
			// .setY(pointer.position.y)
		}
		return
		
		// TODO
		this.ensureOnScreen()
	}

	// Ensure that the hint is within the screen bounds, if possible
	// private ensureOnScreen(): void {
	// 	let txt = this.txt

	// 	let bounds = txt.getBounds()

	// 	let dx = 0
	// 	if (bounds.left < 0) {
	// 		dx = -bounds.left
	// 	}
	// 	else if (bounds.right > Space.windowWidth) {
	// 		dx = Space.windowWidth - bounds.right
	// 	}

	// 	let dy = 0
	// 	if (bounds.top < 0) {
	// 		dy = -bounds.top
	// 	}
	// 	else if (bounds.bottom > Space.windowHeight) {
	// 		dy = Space.windowHeight - bounds.bottom
	// 	}

	// 	txt.setPosition(txt.x + dx, txt.y + dy)
	// }
}