import 'phaser'

import { Keyword, keywords } from '../catalog/keywords'
import { Style } from '../settings/settings'
import { getCard } from "../catalog/catalog"
import Card from "../lib/card"


export class KeywordLabel extends Phaser.GameObjects.Image {
	keyword: Keyword

	// The X value of the keyword, if any
	value: number

	constructor(scene: Phaser.Scene, name, x, y, value?) {
		const s = value === undefined ? `kw-${name}` : `kw-${name} ${value}`

		super(scene, x, y, s)
		scene.add.existing(this)

		// Set keyword for this
		keywords.forEach(keyword => {
			if (keyword.key === name) {
				this.keyword = keyword
				this.value = value
			}
		})

		// On hover this should show the correct hint
		this.setInteractive()
		.on('pointerover', this.onHover())
		.on('pointerout', this.onHoverExit())
	}

	private onHover(): () => void {
		let s = this.keyword.text

		// If this keyword has an X, replace all occurences with its value
		if (this.value !== undefined) {
			s = s.replace(/X/g, this.value.toString())
		}

		let hint = this.scene['hint']

		return () => {
			hint.showText(s)
		}
	}

	private onHoverExit(): () => void {
		let hint = this.scene['hint']

		return () => {
			hint.hide()
		}
	}
}

export class ReferenceLabel extends Phaser.GameObjects.Text {
	card: Card

	constructor(scene: Phaser.Scene, name: string, x: number, y: number) {
		super(scene, x, y, name, Style.reference)
		scene.add.existing(this)

		this.card = getCard(name)

		// Set origin
		this.setOrigin(0.5)

		// On hover this should show the correct hint
		this.setInteractive()
		.on('pointerover', this.onHover())
		.on('pointerout', this.onHoverExit())
	}

	private onHover(): () => void {
		let hint = this.scene['hint']

		return () => {
			hint.showCard(this.card)
		}
	}

	private onHoverExit(): () => void {
		let hint = this.scene['hint']

		return () => {
			hint.hide()
		}
	}
}
