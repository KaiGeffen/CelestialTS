import { Style, Color } from '../../settings/settings'


// Base abstraction of all buttons within the game
// Each button is composed of either or both text and an image
// Each subclass of this specifies which of those exists
// Which accepts input, glows, etc


interface Config {
	text?: {
		text: string,
		interactive: boolean,
		style?: Phaser.Types.GameObjects.Text.TextStyle
	},
	icon?: {
		name: string,
		interactive: boolean,
		offset?: number,
	},
	callbacks?: {
		click?: () => void,
		hover?: () => void,		
		exit?: () => void,
	}
}


export default class Button {
	scene: Phaser.Scene

	txt: Phaser.GameObjects.Text
	icon: Phaser.GameObjects.Image

	// Enabled, Selected, Highlighted, etc
	// Callbacks
	// Callbacks for each event
	onClick: () => void
	onHover: () => void
	onExit: () => void

	constructor(
		// The scene or container that this button is located within
		within: Phaser.Scene | Phaser.GameObjects.Container,
		x: number,
		y: number,
		config: Config,
		)
	{
		// Define scene
		if (within instanceof Phaser.Scene) {
			this.scene = within
		}
		else if (within instanceof Phaser.GameObjects.Container) {
			this.scene = within.scene
		}

		// Create icon if it exists
		if (config.icon !== undefined) {
			let offset = config.icon.offset === undefined ? 0 : config.icon.offset
			
			this.icon = this.scene.add.image(x, y + offset, `icon-${config.icon.name}`)
			.on('pointerover', () => this.icon.setTint(Color.buttonHighlight), this)
			.on('pointerout', () => this.icon.clearTint(), this)

			// Set interactive
			if (config.icon.interactive) {
				this.icon.setInteractive()

				if (config.callbacks) {
					if (config.callbacks.click) {
						this.icon.on('pointerdown', config.callbacks.click)
					}

					if (config.callbacks.hover) {
						this.icon.on('pointerover', config.callbacks.hover)
					}
					
					if (config.callbacks.exit) {
						this.icon.on('pointerout', config.callbacks.exit)
					}
				}
			}
		}

		// Create text if it exists
		if (config.text !== undefined) {
			let style = config.text.style ? config.text.style : Style.button
			this.txt = this.scene.add.text(x, y, config.text.text, style).setOrigin(0.5)

			// Set interactive
			if (config.text.interactive) {
				this.txt.setInteractive()
				.on('pointerover', () => this.txt.setTint(Color.buttonHighlight), this)
				.on('pointerout', () => this.txt.clearTint(), this)

				if (config.callbacks) {
					if (config.callbacks.click) {
						this.txt.on('pointerdown', config.callbacks.click)
					}
					if (config.callbacks.hover) {
						this.txt.on('pointerover', config.callbacks.hover)
					}
					if (config.callbacks.exit) {
						this.txt.on('pointerout', config.callbacks.exit)
					}
				}
			}
		}

		// If within a container, add the objects to that container
		if (within instanceof Phaser.GameObjects.Container) {
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




	// TODO Remove or change
	glow() {}
	glowUntilClicked() {}
	stopGlow() {}









	// TODO
	setOnClick(f): Button {
		if (this.txt) {
			this.txt.on('pointerdown', f)
		}

		if (this.icon) {
			this.icon.on('pointerdown', f)
		}

		return this
	}

	setOnHover(hoverCallback, exitCallback) {} // TODO It might be that each subtype handles this in their own way
	// For example, maybe the map nodes 'dance' or until exited, but this function doesnt need to be exposed

	setText(s: string): Button {
		if (this.txt !== undefined) {
			this.txt.setText(s)
		}

		return this
	}

	enable() {}
	disable() {}

	highlight() {}
}