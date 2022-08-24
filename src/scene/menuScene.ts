import "phaser"

import { Style, Color, Space, Time } from "../settings/settings"
import { createMenu } from "./menu/menu"


// The scene which shows whichever menu is open, if any
// on top of the other scenes
export default class MenuScene extends Phaser.Scene {
	constructor() {
		super({
			key: "MenuScene"
		})
	}

	// TODO Create this api? See if what we have works
	// Open the menu specified by string
	static open(s: string): void {
		// TODO if (s not in names) ....
		// Check if the specified menu exists, if not, throw

		// If a menu is already open, call its onClose
		
		// Open the given menu

	}

	create(params): void {
		this.sound.play('open')

		this.addBackground()

		let menu = createMenu(this, params.menu, params)

		// When esc is pressed, close this scene
		let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.on('down', () => {menu.close()})

		this.scene.bringToTop()

		this.transitionIn()
	}

	// Play a transition as this menu opens
	transitionIn(): void {
		const camera = this.cameras.main

		this.tweens.add({
			targets: camera,
			alpha: 1,
			duration: Time.menuTransition,
			onStart: () => {camera.alpha = 0}
		})
	}

	private addTitle(s: string) {
		this.add.text(
			Space.windowWidth / 2,
			Space.windowHeight / 2 - 150,
			s,
			Style.menuTitle).setOrigin(0.5)
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
		let invisBackground = this.add.rectangle(x, y, Space.windowWidth, Space.windowHeight, 0x000000, 0.7)
		invisBackground.setInteractive()
		invisBackground.on('pointerdown', this.endScene())

		// Visible background, which does nothing when clicked
		// let visibleBackground = this.add['rexRoundRectangle'](x, y, 1000, 600, 30, Color.menuBackground,
		// ).setAlpha(0.95)
		// visibleBackground.setInteractive()
		// visibleBackground.setStrokeStyle(10, Color.menuBorder, 1)
	}

	// NOTE This is a fix for sizer objects not deleting properly in all cases
	endScene(): () => void {
		let that = this

		return () => {
			let top = this.children.getByName('top')
			if (top !== null) {
				top.destroy()
			}

			this.tweens.add({
				targets: this.cameras.main,
				alpha: 0,
				duration: Time.menuTransition,
				onStart: () => {this.sound.play('close')},
				onComplete: () => {this.scene.stop()},
			})
		}
			
	}
}
