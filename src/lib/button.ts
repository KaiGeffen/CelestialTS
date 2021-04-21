import "phaser"
import { StyleSettings, ColorSettings } from '../settings'


// TODO There is a better way to do this where the object is defined within the Phaser Game Factor and can be added from that

export default class Button extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene, x: number, y: number, text: string,
		f: () => void = function () {},
		playSound: boolean = true) {
		super(scene, x, y, text, StyleSettings.button)
		
		this.setInteractive()

		// Call the function, either with a sound or not
		if (playSound) {
			this.on('pointerdown', this.sfxThenDo(f))
		} else {
			this.on('pointerdown', f)
		}

		this.on('pointerover', this.onHover, this)
    	this.on('pointerout', this.onHoverExit, this)
    	this.scene.input.on('gameout', this.onHoverExit, this)

		this.scene.add.existing(this)
	}

	// Set the on click function for this button, removing any previous functions
	setOnClick(f: () => void): void {
		this.removeAllListeners('pointerdown')
		this.on('pointerdown', this.sfxThenDo(f))
	}

	private sfxThenDo(f: () => void): () => void {
		let scene = this.scene

		return function () {
    		scene.sound.play('click')

    		// Call the function with this scene as the context
    		f.call(scene)
		}
	}

	private onHover(): void {
		this.setTint(ColorSettings.buttonHighlight)
	}

	private onHoverExit(): void {
		this.clearTint()
	}

}