import "phaser"
import { Space, ColorSettings } from '../settings'


export default class Menu {
	container: Phaser.GameObjects.Container

	constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, visible: boolean = true, depth: number = 0) {
		// Esc key closes all menus
		let esc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.on('down', () => this.container.setVisible(false))

		// Create a container for this menu
		this.container = scene.add.container(x, y).setVisible(visible).setDepth(depth)

		// Invisible background rectangles, stops other containers from being clicked
		let invisBackground = scene.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0.5)
		invisBackground.setInteractive()

		invisBackground.on('pointerdown', () => this.close())

		// Visible background, which does nothing when clicked
		let visibleBackground = scene.add['rexRoundRectangle'](0, 0, width, height, 30, ColorSettings.menuBackground,
			).setAlpha(0.95).setOrigin(0.5)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, ColorSettings.background, 1)

		this.container.add([invisBackground, visibleBackground])
	}

	// Add gameobject(s) to this menu
	add(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): void {
		this.container.add(child)
	}

	// Open this menu
	open(): void {
		this.container.scene.sound.play('open')
		this.container.setVisible(true)
	}

	// Close this menu
	close(): void {
		this.container.scene.sound.play('close')
		this.container.setVisible(false)
	}
}
