import { Style, Color } from '../../settings/settings'


// Base abstraction of all buttons within the game
// Each button is composed of either or both text and an image
// Each subclass of this specifies which of those exists
// Which accepts input, glows, etc


interface Config {
	text?: {
		text: string,
		interactive: boolean,
	},
	icon?: {
		name: string,
		interactive: boolean,
	},
	callbacks?: {
		click?: () => {},
		hover?: () => {},		
		exit?: () => {},
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

		// Create text if it exists
		if (config.text !== undefined) {
			this.txt = this.scene.add.text(x, y, config.text.text, Style.basic).setOrigin(0.5)

			// Set interactive
			if (config.text.interactive) {
				this.txt.setInteractive()
				// .on('pointerdown', config.callbacks.click)
				// .on('pointerover', config.callbacks.hover)
				// .on('pointerout', config.callbacks.exit)
			}

		}

		// Create icon if it exists
		if (config.icon !== undefined) {
			this.icon = this.scene.add.image(x, y, `icon-${config.icon.name}`)

			// Set interactive
			if (config.icon.interactive) {
				this.icon.setInteractive()
				// .on('pointerdown', config.callbacks.click)
				// .on('pointerover', config.callbacks.hover)
				// .on('pointerout', config.callbacks.exit)
			}
		}
	}









	// TODO
	setOnClick(f) {}
	setOnHover(hoverCallback, exitCallback) {} // TODO It might be that each subtype handles this in their own way
	// For example, maybe the map nodes 'dance' or until exited, but this function doesnt need to be exposed

	enable() {}
	disable() {}

	highlight() {}
}