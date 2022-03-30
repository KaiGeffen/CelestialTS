import "phaser"
import { Space, Style, Color } from '../../settings/settings'

import Button from './button'

// TODO Implement a hierarchy amongst these classes to keep things dry

class UnderlinedButton extends Button {
	scene: Phaser.Scene
	txt: Phaser.GameObjects.Text
	line: Phaser.GameObjects.Image

	// If this button is currently selected
	isSelected = false

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true) {
		super(within, x, y, text, f, playSound)
		
		if (within instanceof Phaser.Scene) {
			this.scene = within
		}
		else if (within instanceof Phaser.GameObjects.Container) {
			this.scene = within.scene
		}
		

		// Create the objects that make up the button
		this.txt = this.scene.add.text(x, y, text, Style.filterButton).setOrigin(0.5)
		.setInteractive()
		this.line = this.scene.add.image(x, y + 20, 'icon-Underline')

		// Call the function, either with a sound or not
		if (playSound) {
			this.txt.on('pointerdown', this.sfxThenDo(f))
		} else {
			this.txt.on('pointerdown', f, this.scene)
		}

		this.txt.on('pointerover', () => {
			this.txt.setTint(Color.buttonHighlight)
			this.scene.sound.play('hover')
		}, this)
		this.txt.on('pointerout', () => this.txt.clearTint(), this)
		this.scene.input.on('gameout', () => this.txt.clearTint(), this)

		// If within a container, add the objects to that container
		if (within instanceof Phaser.GameObjects.Container) {
			within.add([this.txt, this.txt])
		}
	}

	// Set the on click function for this button, removing any previous functions
	setOnClick(f: () => void, removeListeners = false): Button {
		if (removeListeners) {
      		this.txt.removeAllListeners('pointerdown')
      	}

		this.txt.on('pointerdown', f)

		return this
	}

	setOnHover(f: () => void, fExit: () => void = () => {}): Button {
	    this.txt.on('pointerover', f)
	    this.txt.on('pointerout', fExit)

	    return this
	}

	enable() {
		this.txt.input.enabled = true
	}
	
	disable() {
		this.txt.input.enabled = true
	}

	private sfxThenDo(f: () => void): () => void {
		let scene = this.scene

		return function() {
			scene.sound.play('click')

			// Call the function with this scene as the context
			f.call(scene)
		}
	}
}


// Exported buttons
export class UButton extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: true
			},
			icon: {
				name: 'Underline',
				interactive: false
			}
		})
	}
}
