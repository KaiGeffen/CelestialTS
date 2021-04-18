import "phaser"
import { StyleSettings, ColorSettings, Space } from "../settings"


// TODO Incorporate cardInfo into this class
var music: Phaser.Sound.BaseSound

export default class BaseScene extends Phaser.Scene {
	confirmationContainer: Phaser.GameObjects.Container

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

		// Exit icon
		let btnExit = this.add.text(Space.windowWidth - Space.pad/2, 50, '<', StyleSettings.button).setOrigin(1, 0)
		btnExit.setInteractive()
		btnExit.on('pointerdown', this.confirmExit, this)

		// Confirmation container
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0xffffff, 0).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.exitConfirmation, this)

		let visibleBackground = this.add.rectangle(Space.windowWidth/2, Space.windowHeight/2, 500, 200, ColorSettings.menuBackground, 0.95)
		visibleBackground.setInteractive()

		let txtHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Exit to main menu?', StyleSettings.announcement).setOrigin(0.5, 0.5)

		let btnYes = this.add.text(Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', StyleSettings.button).setOrigin(1, 0.5)
		btnYes.setInteractive().on('pointerdown', this.doExit, this)
		let btnNo = this.add.text(Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', StyleSettings.button).setOrigin(0, 0.5)
		btnNo.setInteractive().on('pointerdown', this.exitConfirmation, this)

		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)
		this.confirmationContainer.add([invisibleBackground, visibleBackground, txtHint, btnYes, btnNo])
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

	// Overwritten by the scenes that extend this
	beforeExit(): void {
		return
	}

	private confirmExit(): void {
		this.confirmationContainer.setVisible(true)
	}

	private doExit(): void {
		this.beforeExit()
		this.scene.start("WelcomeScene")
	}

	private exitConfirmation(): void {
		this.confirmationContainer.setVisible(false)
	}
}
