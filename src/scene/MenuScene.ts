import "phaser"

import { Style, Color, Space } from "../settings/settings"
import OptionsMenu from "./menus/optionsMenu"

// TODO Describe

// If active, the menu that is visible atop any other scene
export default class MenuScene extends Phaser.Scene {
	constructor() {
		super({
			key: "MenuScene"
		})
	}

	create(params): void {
		this.addBackground()

		this.addTitle(params.title)

		this.addMessage(params.message)

		this.addContents()

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
		const x = Space.windowWidth/2
		const y = Space.windowHeight/2

		// Invisible background rectangles, stops other containers from being clicked
		let invisBackground = this.add.rectangle(x, y, Space.windowWidth, Space.windowHeight, 0x000000, 0.2)
		invisBackground.setInteractive()
		invisBackground.on('pointerdown', () => this.scene.stop())

		// Visible background, which does nothing when clicked
		let visibleBackground = this.add['rexRoundRectangle'](x, y, 1000, 600, 30, Color.menuBackground,
		).setAlpha(0.95)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, Color.menuBorder, 1)
	}

	private addContents() {
		new OptionsMenu(this)
	}
}
