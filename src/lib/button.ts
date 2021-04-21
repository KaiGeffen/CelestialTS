import "phaser"
import { StyleSettings, ColorSettings } from '../settings'


// TODO There is a better way to do this where the object is defined within the Phaser Game Factor and can be added from that

export default class Button extends Phaser.GameObjects.Text {
	f: () => void

	constructor(scene: Phaser.Scene, x: number, y: number, text: string, f: () => void) {
		super(scene, x, y, text, StyleSettings.button)
		
		this.setInteractive()
		this.on('pointerdown', this.sfxThenDo(f))
		this.on('pointerover', this.onHover, this)
    	this.on('pointerout', this.onHoverExit, this)

		this.scene.add.existing(this)
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