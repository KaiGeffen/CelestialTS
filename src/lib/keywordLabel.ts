import 'phaser'

import { Keyword, keywords } from '../catalog/keywords'


export default class KeywordLabel extends Phaser.GameObjects.Image {
	keyword: Keyword
	constructor(scene: Phaser.Scene, name, x, y) {
		const s = `kw-${name}`

		super(scene, x, y, s)
		scene.add.existing(this)

		// Set keyword for this
		keywords.forEach(keyword => {
			if (keyword.key === name) {
				this.keyword = keyword
			}
		})

		// On hover this should show the correct hint
		this.setInteractive()
		.on('pointerover', this.onHover())
		.on('pointerout', this.onHoverExit())
	}

	private onHover(): () => void {
		const s = this.keyword.text
		let hint = this.scene['hint']

		return () => { hint.showText(s) }
	}

	private onHoverExit(): () => void {
		let hint = this.scene['hint']

		return () => { hint.hide() }
	}
}
