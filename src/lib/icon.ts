import "phaser"
import { StyleSettings, ColorSettings, Space } from '../settings'


// TODO There is a better way to do this where the object is defined within the Phaser Game Factor and can be added from that

export default class Icon {
	constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, x: number, y: number, text: string, f: () => void) {
		let btn = scene.add.image(x, y, 'icon-' + text)

		btn.setInteractive()

		btn.on('pointerdown', () => {
			scene.sound.play('click')
			f()
		})
		btn.on('pointerover', () => {
			btn.setTint(ColorSettings.cardHighlight)
		})
		btn.on('pointerout', () => {
			btn.clearTint()
		})

		// Add a label above the icon
		let yDelta = Space.cardSize - Space.pad
    	let lbl = scene.add.text(x, y - yDelta, text, StyleSettings.announcement).setOrigin(0.5)

    	// Add both to the container
    	container.add([btn, lbl])
	}

}