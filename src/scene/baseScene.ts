import "phaser"
import { StyleSettings, ColorSettings, Space } from "../settings"
import { addCardInfoToScene, cardInfo } from "../lib/cardImage"
import Button from "../lib/button"


var music: Phaser.Sound.BaseSound

export default class BaseScene extends Phaser.Scene {
	confirmationContainer: Phaser.GameObjects.Container
	sliderVolume: any

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

		// Exit button
		let btnExit = new Button(this, Space.windowWidth - Space.pad/2, 50, '⚙', this.confirmExit).setOrigin(1, 0)

		this.createMenu()
	}

	private createMenu(): void {
		// Invisible background, which closes menu when clicked
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0xffffff, 0).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.exitConfirmation, this)

		// Visible background, which does nothing when clicked
		let visibleBackground = this.add.rexRoundRectangle(Space.windowWidth/2, Space.windowHeight/2, 500, 400, 30, ColorSettings.menuBackground).setAlpha(0.95)
		visibleBackground.setInteractive()

		// Slider for music
		let y = Space.windowHeight/2 - 120
		let txtVolumeHint = this.add.text(Space.windowWidth/2 - 33, y, 'Volume:', StyleSettings.announcement).setOrigin(1, 0.5)

		let that = this
		this.sliderVolume = this.rexUI.add.slider({
			x: Space.windowWidth/2, y: y, width: 200, height: 20, orientation: 'x',
			value: this.sound.volume,

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, ColorSettings.background),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.background),

            valuechangeCallback: function (value) {
            	console.log(value)
                that.sound.volume = value
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag',
        }).setOrigin(0, 0.5)
        this.sliderVolume.layout()

		// Prompt asking users if they want to exit
		let txtExitHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Exit to main menu?', StyleSettings.announcement).setOrigin(0.5, 0.5)

		// Yes/No buttons
		let btnYes = new Button(this, Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', this.doExit).setOrigin(1, 0.5)
		let btnNo = new Button(this, Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', this.exitConfirmation).setOrigin(0, 0.5)

		// Menu container which is toggled visible/not
		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)
		// Custom rexUI sliders don't work in containers
		this.sliderVolume.setDepth(21).setVisible(false)
		this.confirmationContainer.add([invisibleBackground, visibleBackground, txtVolumeHint, txtExitHint, btnYes, btnNo])
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
		this.sliderVolume.setVisible(true)
	}

	private doExit(): void {
		this.beforeExit()
		this.scene.start("WelcomeScene")
	}

	private exitConfirmation(): void {
		this.sound.play('close')

		this.confirmationContainer.setVisible(false)
		this.sliderVolume.setVisible(false)
	}
}
