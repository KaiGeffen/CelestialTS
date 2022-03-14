import "phaser"

import { Space, Color } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from "../../catalog/catalog"


export class HandRegion {
	create (scene: Phaser.Scene): HandRegion {
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		let container = scene.add.container(0, Space.windowHeight - height)

		// Make a container
		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.menuBackground, 1
			).setOrigin(0)

		let avatar = scene.add.image(Space.pad, Space.pad, 'avatar-Jules').setOrigin(0)

		// Recap button
		let btnRecap = new Button(scene,
			Space.windowWidth - Space.pad,
			height / 3,
			'Recap'
			).setOrigin(1, 0.5)

		// Pass button
		let btnPass = new Button(scene,
			Space.windowWidth - Space.pad,
			height * 2 / 3,
			'Pass'
			).setOrigin(1, 0.5)

		// Add each of these objects to container
		container.add([
			background,
			avatar,
			btnRecap,
			btnPass,
			])

		// TEMP
		let cardImage = new CardImage(cardback, container)
		cardImage.setPosition([400, 110])
		new CardImage(cardback, container).setPosition([500, 100 - (200 - height)])
		new CardImage(cardback, container).setPosition([600, 110])
		new CardImage(cardback, container).setPosition([700, 110])
		new CardImage(cardback, container).setPosition([800, 110])
		new CardImage(cardback, container).setPosition([900, 110])

		return this
	}
}