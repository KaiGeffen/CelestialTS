import 'phaser'

import { Keyword, keywords } from '../catalog/keywords'


export default class KeywordLabel extends Phaser.GameObjects.Image {
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

		console.log(s)

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
