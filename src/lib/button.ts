import "phaser"
import { StyleSettings, ColorSettings } from '../settings'


// TODO There is a better way to do this where the object is defined within the Phaser Game Factor and can be added from that

export default class Button extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene, x: number, y: number, text: string,
		f: () => void = function() { },
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
		// this.removeAllListeners('pointerdown')
		this.on('pointerdown', f)
	}

	// Causes the button to glow until stopped
	glowTask: any
	glow(): void {
		var postFxPlugin = this.scene.plugins.get('rexGlowFilterPipeline')

		var pipeline = postFxPlugin['add'](this)

		this.glowTask = this.scene.tweens.add({
			targets: pipeline,
			intensity: 0.04,
			ease: 'Linear',
			duration: 800,
			repeat: -1,
			yoyo: true
		})
	}

	// Stop the button from glowing, if it is glowing
	stopGlow(): void {
		if (this.glowTask !== undefined) {
			var postFxPlugin = this.scene.plugins.get('rexGlowFilterPipeline')
			postFxPlugin['remove'](this)

			this.glowTask.stop()
			this.glowTask = undefined
		}
	}

	private sfxThenDo(f: () => void): () => void {
		let scene = this.scene

		return function() {
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