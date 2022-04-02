import "phaser"

import { Style, Color, Space } from "../settings/settings"
import { createMenu } from "./menu/menu"


// The scene which shows whichever menu is open, if any
// on top of the other scenes
export default class MenuScene extends Phaser.Scene {
	constructor() {
		super({
			key: "MenuScene"
		})
	}

	// Open the menu specified by string
	static open(s: string): void {
		// TODO if (s not in names) ....
		// Check if the specified menu exists, if not, throw

		// If a menu is already open, call its onClose
		
		// Open the given menu

	}

	create(params): void {
		this.addBackground()

		createMenu(this, params.menu, params)

		// this.addTitle(params.title)

		// this.addMessage(params.message)

		// this.addContents(params.menu)

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
			Style.basic).setOrigin(0.5)
	}

	private addBackground() {
		const x = Space.windowWidth / 2
		const y = Space.windowHeight / 2

		// Invisible background rectangles, stops other containers from being clicked
		let invisBackground = this.add.rectangle(x, y, Space.windowWidth, Space.windowHeight, 0x000000, 0.2)
		invisBackground.setInteractive()
		invisBackground.on('pointerdown', () => this.scene.stop())

		// Visible background, which does nothing when clicked
		// let visibleBackground = this.add['rexRoundRectangle'](x, y, 1000, 600, 30, Color.menuBackground,
		// ).setAlpha(0.95)
		// visibleBackground.setInteractive()
		// visibleBackground.setStrokeStyle(10, Color.menuBorder, 1)
	}
}
