import 'phaser'
import {default as SP} from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel'

import { Color, Flags } from '../settings/settings'


export default class ScrollablePanel extends SP {
	// TODO
	panel: any
	constructor(scene: Phaser.Scene, config?: SP.IConfig) {
		super(scene, config)

		// On mobile, allow scrolling to not be stopped by children
		if (Flags.mobile) {
			this.enableMobileScroll()
		}
		else {
			// Update this panel's scroll on mouse-wheel
			this.updateOnScroll()
		}

		// Add a shadow effect
		this.addShadowEffect()

		// Default to origin 0
		this.setOrigin(0)

		// Layout this panel
		this.layout()

		return this
	}

	// Update this panel when user scrolls with their mouse wheel
	private updateOnScroll(): void {
		this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
			// Return if the pointer is outside of the panel
			if (!this.panel.getBounds().contains(pointer.x, pointer.y)) {
				return
			}

			// Scroll panel down by amount wheel moved
			this.childOY -= dy

			// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
			this.t = Math.max(0, this.t)
			this.t = Math.min(0.999999, this.t)
		})
	}


	// 
	private enableMobileScroll(): void {
		// Allows scroll unless children are tapped
		this.setChildrenInteractive({
			targets: [this.panel],
			tap: {tapInterval: 0},
		})
		.on('child.click', (child) => {
      		// Tap on any images in the container
			if (child instanceof ContainerLite) {
				child.getChildren().filter((o) => {
					return o instanceof Phaser.GameObjects.Image
				}).forEach(image => {
					image.emit('pointerdown')
				})
			}
		})
	}

	private addShadowEffect(): void {
		let background = this.scene.add.rectangle(0, 0, 1, 1, Color.backgroundLight)
		this.addBackground(background)

		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})
	}
}
