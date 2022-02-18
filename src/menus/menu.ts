import "phaser"

export default class Menu {
	contents: Phaser.GameObjects.GameObject[]

	constructor(scene: Phaser.Scene) { }

	// Function for what happens when menu closes
	onClose(): void { }
}

import OptionsMenu from "./optionsMenu"

const menus = {
	'options': OptionsMenu
}

export function createMenu(scene: Phaser.Scene, title: string) {
	// Check if the given menu exists, if not throw
	if (!(title in menus)) {
		throw `Given menu ${title} is not in list of implemented menus.`
	}

	new menus[title](scene)
}
