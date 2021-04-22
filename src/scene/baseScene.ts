import "phaser"
import { StyleSettings, ColorSettings, Space } from "../settings"
import { addCardInfoToScene, cardInfo } from "../lib/cardImage"
import Button from "../lib/button"


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

		// Make sure that cardInfo is above everything else
		addCardInfoToScene(this).setDepth(15)

		// Mute button
		let s = music.isPlaying ? '♪' : '-'
		let btnMute = new Button(this, Space.windowWidth - Space.pad/2, 0, s).setOrigin(1, 0)
		btnMute.setOnClick(this.doMute(btnMute))

		// Exit button ⚙
		let btnExit = new Button(this, Space.windowWidth - Space.pad/2, 50, '<', this.confirmExit).setOrigin(1, 0)

		// Exit confirmation container
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0xffffff, 0).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.exitConfirmation, this)

		let visibleBackground = this.add.rectangle(Space.windowWidth/2, Space.windowHeight/2, 500, 200, ColorSettings.menuBackground, 0.95)
		visibleBackground.setInteractive()

		let txtHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Exit to main menu?', StyleSettings.announcement).setOrigin(0.5, 0.5)

		let btnYes = new Button(this, Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', this.doExit).setOrigin(1, 0.5)
		let btnNo = new Button(this, Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', this.exitConfirmation).setOrigin(0, 0.5)

		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)
		this.confirmationContainer.add([invisibleBackground, visibleBackground, txtHint, btnYes, btnNo])
	}

	private doMute(btn: Button): () => void {
		let that = this
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
      	this.sound.play('open')

		this.confirmationContainer.setVisible(true)
	}

	private doExit(): void {
		this.beforeExit()
		this.scene.start("WelcomeScene")
	}

	private exitConfirmation(): void {
		this.sound.play('close')

		this.confirmationContainer.setVisible(false)
	}
}
