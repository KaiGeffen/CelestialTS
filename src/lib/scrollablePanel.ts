import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import ScrollablePanel from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel'
import FixWidthSizer from 'phaser3-rex-plugins/templates/ui/fixwidthsizer/FixWidthSizer'

import { Color, Flags } from '../settings/settings'


export default function newScrollablePanel(
	scene: Phaser.Scene,
	config?: ScrollablePanel.IConfig,
	): ScrollablePanel
{
	let panel = new ScrollablePanel(scene, config)

	const childPanel = config.panel.child as FixWidthSizer
	if (!childPanel) {
		throw new Error('Scrollable panel must have a panel inside it.')
	}
	if (Flags.mobile) {
		// On mobile, allow scrolling to not be stopped by children
		enableMobileScroll(panel, childPanel)
	}
	else {
		// Update this panel's scroll on mouse-wheel
		updateOnScroll(panel, childPanel)
	}

	// Add a shadow effect to the background if present
	if (config.background && (config.background instanceof Phaser.GameObjects.Rectangle)) {
		addShadowEffect(panel, config.background)
	}

	// Default to origin 0
	panel.setOrigin(0)

	// Layout this panel
	panel.layout()

	return panel
}

// Update this panel when user scrolls with their mouse wheel
function updateOnScroll(panel: ScrollablePanel, childPanel: FixWidthSizer): void {
	panel.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) => {
		// Return if the pointer is outside of the panel
		if (!childPanel.getBounds().contains(pointer.x, pointer.y)) {
			return
		}

		// Scroll panel down by amount wheel moved
		panel.childOY -= dy

		// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
		panel.t = Math.max(0, panel.t)
		panel.t = Math.min(0.999999, panel.t)
	})
}


// Allow clicks that hit children to scroll the panel
function enableMobileScroll(panel: ScrollablePanel, childPanel: FixWidthSizer): void {
	// Allows scroll unless children are tapped
	panel.setChildrenInteractive({
		targets: [childPanel],
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

function addShadowEffect(panel: ScrollablePanel, background: Phaser.GameObjects.Rectangle): void {
	panel.addBackground(background)

	panel.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
		distance: 3,
		shadowColor: 0x000000,
	})
}
