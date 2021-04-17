import "phaser"
import { StyleSettings, Space } from "../settings"


// TODO Incorporate cardInfo into this class
var music: Phaser.Sound.BaseSound

export default class BaseScene extends Phaser.Scene {
	constructor(args) {
		super(args)
	}

	create(): void {
		// Add music if it doesn't exist
		if (music === undefined) {
			music = this.sound.add('background', {volume: 0.5, loop: true})
			music.play()
		}

		// Mute icon
		let s = music.isPlaying ? '♪' : '-'
		let btnMute = this.add.text(Space.windowWidth - Space.pad/2, 0, s, StyleSettings.button).setOrigin(1, 0)
		btnMute.setInteractive()
		btnMute.on('pointerdown', this.doMute(btnMute))
	}

	private doMute(btn: Phaser.GameObjects.Text): () => void {
		return function() {
			if (music.isPlaying) {
				music.pause()

				btn.setText('-')
			}
			else {
				music.resume()

				btn.setText('♪')
			}
		}
		
	}
}