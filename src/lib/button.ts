import "phaser"
import { Space, StyleSettings, ColorSettings } from '../settings'


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
			this.on('pointerdown', f, scene)
		}

		this.on('pointerover', this.onHover, this)
		this.on('pointerout', this.onHoverExit, this)
		this.scene.input.on('gameout', this.onHoverExit, this)

		this.scene.add.existing(this)
	}

	// Set the on click function for this button, removing any previous functions
	setOnClick(f: () => void, removeListeners = false): void {
		if (removeListeners) {
      		this.removeAllListeners('pointerdown')
      	}

		this.on('pointerdown', f)
	}

	// Causes the button to glow until stopped
	outline: Phaser.GameObjects.Text
	outlineTween: Phaser.Tweens.Tween
	glow(): void {
		// First stop any glow that's already happening to not amplify
		this.stopGlow()

		this.outline = this.scene.add.text(this.x, this.y, this.text, this.style)
			.setOrigin(this.originX, this.originY)
			.setDepth(this.depth - 1)
			.setAlpha(0)

		// Add to parent container if it exists
		if (this.parentContainer !== null) {
			this.parentContainer.add(this.outline)
		}
		
		var postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')

		let pipeline = postFxPlugin['add'](this.outline,
        	{thickness: 3,
          	outlineColor: ColorSettings.buttonBorder})

		this.outlineTween = this.scene.tweens.add({
			targets: this.outline,
			alpha: 0.5,
			ease: 'Linear',//'Sine.easeInOut',
			duration: 1200,
			repeat: -1,
			yoyo: true
		})
	}

	glowUntilClicked(): void {
		this.glow()
		this.setOnClick(() => this.stopGlow())
	}

	// Stop the button from glowing, if it is glowing
	stopGlow(): void {
		if (this.isGlowing()) {
			// NOTE Must remove the tween so that it doesn't stop state changes
			this.outlineTween.remove()
			this.outlineTween = undefined

			this.outline.destroy()
			this.outline = undefined
		}
	}

	// Return if the button is glowing
	isGlowing(): boolean {
		return this.outline !== undefined
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