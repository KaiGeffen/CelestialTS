import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';

import { Style, Color } from '../../settings/settings'


// Base abstraction of all buttons within the game
// Each button is composed of either or both text and an image
// Each subclass of this specifies which of those exists
// Which accepts input, glows, etc


interface Config {
	text?: {
		text: string,
		interactive: boolean,
		style?: Phaser.Types.GameObjects.Text.TextStyle,
		offset?: number,
		offsetX?: number,
		hitArea?: any // TODO
	},
	icon?: {
		name: string,
		interactive: boolean,
		offset?: number,
		noGlow?: boolean,
	},
	callbacks?: {
		click?: () => void,
		hover?: () => void,		
		exit?: () => void,
	}
}

const ConfigDefaults = {
	text: {
		text: '',
		interactive: false,
		style: Style.basic,
		hitArea: undefined,
		offset: 0,
		offsetX: 0,
		noGlow: false,
	},
	icon: {
		name: '',
		interactive: false,
		offset: 0,
	},
	callbacks: {
		click: () => {},
		hover: () => {},		
		exit: () => {},
	}
}

export default class Button {
	scene: Phaser.Scene

	txt: Phaser.GameObjects.Text
	icon: Phaser.GameObjects.Image

	selected = false

	// Enabled, Selected, Highlighted, etc
	// Callbacks
	// Callbacks for each event
	onClick: () => void
	onHover: () => void
	onExit: () => void

	constructor(
		// The scene or container that this button is located within
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		config: Config,
		)
	{
		let that = this

		// Define scene
		if (within instanceof Phaser.Scene) {
			this.scene = within
		}
		else if (within instanceof Phaser.GameObjects.Container || within instanceof ContainerLite) {
			this.scene = within.scene
		}

		// Create icon if it exists
		if (config.icon !== undefined) {
			let offset = config.icon.offset === undefined ? 0 : config.icon.offset
			
			let filename = config.icon.name.includes('-') ? config.icon.name : `icon-${config.icon.name}`
			this.icon = this.scene.add.image(x, y + offset, filename)
			
			if (!config.icon.noGlow) {
				this.icon.on('pointerover', () => this.glow())
				.on('pointerout', () => this.stopGlow())
			}
			// TODO Add a config option to clear glow (Useful if a menu is opening onclick)
			// .on('pointerdown', () => this.icon.clearTint(), this)

			// Set interactive
			if (config.icon.interactive) {
				this.icon.setInteractive()

				if (config.callbacks) {
					this.icon.on('pointerdown', () => {that.onClick()})
					this.icon.on('pointerover', () => {that.onHover()})
					this.icon.on('pointerout', () => {that.onExit()})
				}
			}
		}

		// Create text if it exists
		if (config.text !== undefined) {
			let offsetX = config.text.offsetX === undefined ? 0 : config.text.offsetX
			let offset = config.text.offset === undefined ? 0 : config.text.offset

			let style = config.text.style ? config.text.style : Style.button
			this.txt = this.scene.add.text(x + offsetX, y + offset, config.text.text, style).setOrigin(0.5)

			// Set interactive
			if (config.text.interactive) {
				this.txt.setInteractive(...config.text.hitArea)
				.on('pointerover', () => this.txt.setTint(Color.buttonHighlight), this)
				.on('pointerout', () => this.txt.clearTint(), this)

				if (config.callbacks) {
					this.txt.on('pointerdown', () => {that.onClick()})
					this.txt.on('pointerover', () => {that.onHover()})
					this.txt.on('pointerout', () => {that.onExit()})
				}
			}
		}

		// Set the callbacks separate from the objects
		if (config.callbacks) {
			// Add default callbacks if not specified
			this.onClick = config.callbacks.click ? () => {
				config.callbacks.click()
				this.scene.sound.play('click')
				} : () => {}
			this.onHover = config.callbacks.hover ? config.callbacks.hover : () => {}
			this.onExit = config.callbacks.exit ? config.callbacks.exit : () => {}
		}

		// If within a container, add the objects to that container
		if (within instanceof Phaser.GameObjects.Container || within instanceof ContainerLite) {
			if (this.icon) {
				within.add(this.icon)
			}
			if (this.txt) {
				within.add(this.txt)
			}
		}
	}

	// Emulating phaser gameobject functions
	setOrigin(...args): Button {
		if (this.txt) {
			this.txt.setOrigin(...args)
		}
		if (this.icon) {
			this.icon.setOrigin(...args)
		}

		return this
	}

	setVisible(value): Button {
		if (this.txt) {
			this.txt.setVisible(value)
		}
		if (this.icon) {
			this.icon.setVisible(value)
		}

		return this
	}

	isVisible(): boolean {
		if (this.txt) {
			return this.txt.visible
		}
		if (this.icon) {
			this.icon.visible
		}
	}


	select(): Button {
		this.icon.setTint(Color.buttonSelected)
		if (this.txt) {
			this.txt.setColor(Color.buttonTxtSelected)
		}

		this.selected = true
		
		return this
	}

	deselect(): Button {
		this.icon.clearTint()
		if (this.txt) {
			this.txt.setStyle(Style.basic)
		}

		this.selected = false

		return this
	}

	getText(): string {
		if (this.txt === undefined) {
			return ''
		}
		else {
			return this.txt.text
		}
	}

	destroy() {
		if (this.txt) {
			this.txt.destroy()
		}
		if (this.icon) {
			this.icon.destroy()
		}
	}




	// The glow effect button has while hovered
	glow() {
		let plugin = this.scene.plugins.get('rexOutlinePipeline')
		plugin['add'](this.icon || this.txt, {
			thickness: 3,
			outlineColor: Color.outline,
			quality: 0.3,
		})
		
		return this
	}
	stopGlow() {
		let plugin = this.scene.plugins.get('rexOutlinePipeline')
		plugin['remove'](this.icon || this.txt)

		return this
	}








	// Set the on click callback for this button
	// If once, only perform this callback once, then disable the button
	setOnClick(f, once = false): Button {
		let that = this

		this.onClick = () => {
			this.scene.sound.play('click')
			f()
			if (once) {
				that.disable()
			}
		}

		return this
	}

	setOnHover(hoverCallback, exitCallback): Button {
		this.onHover = hoverCallback
		this.onExit = exitCallback

		return this
	}

	setText(s: string): Button {
		if (this.txt !== undefined) {
			this.txt.setText(s)
		}

		return this
	}

	setTexture(texture: string): Button {
		this.icon.setTexture(texture)

		return this
	}

	setDepth(value: number): Button {
		if (this.txt !== undefined) {
			this.txt.setDepth(value)
		}
		if (this.icon !== undefined) {
			this.icon.setDepth(value)
		}

		return this
	}

	enable() {
		// TODO Don't enable the element if it isn't set as interactive in its config
		// if (this.txt !== undefined) {
		// 	this.txt.setInteractive()
		// }
		if (this.icon !== undefined) {
			this.icon.setInteractive()
		}

		return this
	}
	disable() {
		// TODO Clarify if text interaction is supported
		if (this.txt !== undefined) {
			this.txt.disableInteractive()
			.emit('pointerout')
		}
		if (this.icon !== undefined) {
			this.icon.disableInteractive()
			.emit('pointerout')
		}

		return this
	}

	highlight() {}

	// Set the subtype's individual characteristic, implemented by some buttons
	setQuality(args): Button {
		throw `Button type ${typeof this} doesn't have a quality to set.`
	}

	// Set the object to not scroll with the camera
	setNoScroll(): Button {
		if (this.txt) {
			this.txt.setScrollFactor(0, 0)
		}

		if (this.icon) {
			this.icon.setScrollFactor(0, 0)
		}

		return this
	}

	// Enable a hint to show when this button is hovered
	makeHintable(s?): Button {
		if (s !== undefined) {
			this.setOnHover(() => {
				this.scene['hint'].showText(s)
			},
			() => {
				this.scene['hint'].hide()
			})
		}
		
		return this
	}
}