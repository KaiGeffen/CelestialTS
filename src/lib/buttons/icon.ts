import "phaser"
import { Space, Style, Color } from '../../settings/settings'

import Button from './button'


// TODO This could just extend phaser icons, also generally not dry / bad api

class IconButton extends Button {
	scene: Phaser.Scene
	icon: Phaser.GameObjects.Image

	// If this button is currently selected
	isSelected = false

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true,
		imageName: string) {

		// TODO Don't inherit like this
		super(within, x, y, '', f, playSound)
		
		if (within instanceof Phaser.Scene) {
			this.scene = within
		}
		else if (within instanceof Phaser.GameObjects.Container) {
			this.scene = within.scene
		}		

		// Create the objects that make up the button
		this.icon = this.scene.add.image(x, y, imageName)
		.setInteractive()

		// Call the function, either with a sound or not
		if (playSound) {
			this.icon.on('pointerdown', this.sfxThenDo(f))
		} else {
			this.icon.on('pointerdown', f, this.scene)
		}

		this.icon.on('pointerover', () => {
			this.icon.setTint(Color.buttonHighlight)
			this.scene.sound.play('hover')
		}, this)
		this.icon.on('pointerout', () => this.icon.clearTint(), this)
		this.scene.input.on('gameout', () => this.icon.clearTint(), this)

		// If within a container, add the objects to that container
		if (within instanceof Phaser.GameObjects.Container) {
			within.add([this.icon])
		}
	}

	// Set the on click function for this button, removing any previous functions
	setOnClick(f: () => void, removeListeners = false): Button {
		if (removeListeners) {
      		this.icon.removeAllListeners('pointerdown')
      	}

		this.icon.on('pointerdown', f)

		return this
	}

	setOnHover(f: () => void, fExit: () => void = () => {}): Button {
	    this.icon.on('pointerover', f)
	    this.icon.on('pointerout', fExit)

	    return this
	}

	enable() {
		this.icon.input.enabled = true
	}
	
	disable() {
		this.icon.input.enabled = true
	}
	private sfxThenDo(f: () => void): () => void {
		let scene = this.scene

		return function() {
			scene.sound.play('click')

			// Call the function with this scene as the context
			f.call(scene)
		}
	}








	// Some functions emulating phaser functions
	setOrigin(...args): Button {
		// this.icon.setOrigin(...args)

		return this
	}

	setVisible(value): Button {
		this.icon.setVisible(value)

		return this
	}

	setDepth(value): Button {
		this.icon.setDepth(value)

		return this
	}

	emit(value): Button {
		this.icon.emit(value)

		return this
	}
}


// Exported buttons
export class IButtonOptions extends IconButton {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, f, playSound, 'icon-Options')
	}
}

export class IButtonX extends IconButton {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, f, playSound, 'icon-X')
	}
}