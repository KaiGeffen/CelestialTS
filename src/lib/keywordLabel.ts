import 'phaser'

import { Keyword, keywords } from '../catalog/keywords'


export default class KeywordLabel extends Phaser.GameObjects.Image {
	constructor(scene: Phaser.Scene, name) {
		const s = `kw-${name}`

		super(scene, 0, 0, s)
		scene.add.existing(this)

		// On hover this should show the correct hint
		this.setInteractive()
		.on('pointerover', this.onHover())
		.on('pointerout', this.onHoverExit())
	}

	private onHover(): () => void {
		const s = 'Help me uwu'
		let hint = this.scene['hint']

		return () => { hint.showText(s) }
	}

	private onHoverExit(): () => void {
		let hint = this.scene['hint']

		return () => { hint.hide() }
	}
}
