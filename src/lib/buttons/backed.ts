import "phaser"
import { Space, Style, Color } from '../../settings/settings'

import Button from './button'


class BackedButton {
	scene: Phaser.Scene
	txt: Phaser.GameObjects.Text
	background: Phaser.GameObjects.Image

	// If this button is currently selected
	isSelected = false

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true,
		imageName: string) {
		// super(within, x, y, text, f, playSound)
		
		if (within instanceof Phaser.Scene) {
			this.scene = within
		}
		else if (within instanceof Phaser.GameObjects.Container) {
			this.scene = within.scene
		}
		

		// Create the objects that make up the button
		this.background = this.scene.add.image(x, y, imageName)
		this.txt = this.scene.add.text(x, y, text, Style.button).setOrigin(0.5)

		this.background.setInteractive()

		// Call the function, either with a sound or not
		if (playSound) {
			this.background.on('pointerdown', this.sfxThenDo(f))
		} else {
			this.background.on('pointerdown', f, this.scene)
		}

		this.background.on('pointerover', () => {
			this.background.setTint(Color.buttonHighlight)
			this.scene.sound.play('hover')
		}, this)
		this.background.on('pointerout', () => this.background.clearTint(), this)
		this.scene.input.on('gameout', () => this.background.clearTint(), this)

		// If within a container, add the objects to that container
		if (within instanceof Phaser.GameObjects.Container) {
			within.add([this.background, this.txt])
		}
	}

	// Set the on click function for this button, removing any previous functions
	setOnClick(f: () => void, removeListeners = false): BackedButton {
		if (removeListeners) {
      		this.background.removeAllListeners('pointerdown')
      	}

		this.background.on('pointerdown', f)

		return this
	}

	setOnHover(f: () => void, fExit: () => void = () => {}): BackedButton {
	    this.background.on('pointerover', f)
	    this.background.on('pointerout', fExit)

	    return this
	}

	// Highlight this button
	highlight(): BackedButton {
		this.stopGlow()

		this.isSelected = true

		this.scene.plugins.get('rexOutlinePipeline')['add'](this.background,
        	{thickness: 3,
          	outlineColor: Color.buttonBorder})

		return this
	}

	// Causes the button to glow until stopped, if doAnimate, it will fade in/out
	outline: Phaser.GameObjects.Text
	outlineTween: Phaser.Tweens.Tween
	glow(doAnimate = true): BackedButton {
		// TODO Clarify what a button does and how it displays visually that it's selected, be consistent to that
		if (!doAnimate) {
			return this.highlight()
		}

		// First stop any glow that's already happening to not amplify
		this.stopGlow()

		let txt = this.txt

		this.outline = this.scene.add.text(txt.x, txt.y, txt.text, txt.style)
			.setOrigin(txt.originX, txt.originY)
			.setDepth(txt.depth - 1) // TODO issue wiht background

		// Add to parent container if it exists
		if (txt.parentContainer !== null) {
			txt.parentContainer.add(this.outline)
		}
		
		var postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')

		let pipeline = postFxPlugin['add'](this.outline,
        	{thickness: 3,
          	outlineColor: Color.buttonBorder})


		// Animate the outline glowing from 0 to 1 alpha
		if (doAnimate) {
			this.outline.setAlpha(0)

			this.outlineTween = this.scene.tweens.add({
				targets: this.outline,
				alpha: 0.5,
				ease: 'Linear',//'Sine.easeInOut',
				duration: 1200,
				repeat: -1,
				yoyo: true
			})
		}

		return this
	}

	glowUntilClicked(): void {
		this.glow()
		this.setOnClick(() => this.stopGlow())
	}

	// Stop the button from glowing
	stopGlow(): void {
		// NOTE Must remove the tween so that it doesn't stop state changes
		if (this.outlineTween !== undefined) {
			this.outlineTween.remove()
			this.outlineTween = undefined
		}

		if (this.outline !== undefined) {
			this.outline.destroy()
			this.outline = undefined
		}

		this.isSelected = false

		// Remove this object's highlight, if it has one
		if (this.scene.plugins.get('rexOutlinePipeline')['get'](this.txt).length > 0) {
			this.scene.plugins.get('rexOutlinePipeline')['remove'](this.txt)		
		}
	}

	// Return if the button is glowing
	isGlowing(): boolean {
		return this.outline !== undefined
	}

	// Return if the button is highlighted
	isHighlighted(): boolean {
		return this.isSelected
	}

	enable() {
		this.background.input.enabled = true
	}
	
	disable() {
		this.background.input.enabled = true
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
	setOrigin(...args): BackedButton {
		// this.txt.setOrigin(...args)
		// this.background.setOrigin(...args)

		return this
	}

	setVisible(value): BackedButton {
		this.txt.setVisible(value)
		this.background.setVisible(value)

		return this
	}

	setDepth(value): BackedButton {
		this.txt.setDepth(value)
		this.background.setDepth(value)

		return this
	}

	emit(value): BackedButton {
		this.background.emit(value)

		return this
	}

	setFontSize(value: number): BackedButton {
		this.txt.setFontSize(value)

		return this
	}

	setText(value: string): BackedButton {
		this.txt.setText(value)

		return this
	}
}


// Exported buttons
export class AButtonSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'ButtonA1',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class AButtonLarge extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'ButtonA2',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class SymmetricButtonSmall extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'Button1',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}

export class SymmetricButtonLarge extends Button {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number, y: number, text: string,
		f: () => void = function() {},
		playSound: boolean = true)
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false
			},
			icon: {
				name: 'Button2',
				interactive: true
			},
			callbacks: {
				click: f
			}
		})
	}
}
