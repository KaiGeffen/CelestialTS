import "phaser"

import { Style, Color, Space } from "../settings/settings"

// TODO Describe

// If active, the menu that is visible atop any other scene
export default class MenuScene extends Phaser.Scene {
	constructor() {
		super({
			key: "MenuScene"
		})
	}

	create(params): void {
		this.addTitle(params.title)

		this.addMessage(params.message)

		this.addBackground()

		this.scene.bringToTop()
	}

	private addTitle(s: string) {
		this.add.text(
			Space.windowWidth / 2,
			Space.windowHeight / 2 - 150,
			s,
			Style.title).setOrigin(0.5)
	}

	private addMessage(s: string) {
		this.add.text(
			Space.windowWidth / 2,
			Space.windowHeight / 2,
			s,
			Style.title).setOrigin(0.5)
	}


	private addBackground() {
		// Invisible background rectangles, stops other containers from being clicked
		let invisBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0.5)
		invisBackground.setInteractive()
		invisBackground.on('pointerdown', () => this.scene.stop())

		// Visible background, which does nothing when clicked
		let visibleBackground = this.add['rexRoundRectangle'](0, 0, 300, 200, 30, Color.menuBackground,
		).setAlpha(0.95).setOrigin(0.5)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, Color.menuBorder, 1)
	}
}
