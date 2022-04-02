import "phaser"

export default class Menu {
	constructor(scene: Phaser.Scene) {}
}


// import OptionsMenu from "./optionsMenu"
import ChoosePremade from "./choosePremade"

const menus = {
	// 'options': OptionsMenu,
	'choosePremade': ChoosePremade
}

// Allows for the creation and storing of custom menus not specified 
// in separate ts files
export function createMenu(scene: Phaser.Scene, title: string) {
	// Check if the given menu exists, if not throw
	if (!(title in menus)) {
		throw `Given menu ${title} is not in list of implemented menus.`
	}

	new menus[title](scene)
}


// export default class Menu {
// 	contents: Phaser.GameObjects.GameObject[]

// 	constructor(scene: Phaser.Scene) { }

// 	// Function for what happens when menu closes
// 	onClose(): void { }
// }

// import OptionsMenu from "./optionsMenu"
// import PremadeDecks from "./premadeDecks"


// const menus = {
// 	'options': OptionsMenu,
// 	'premadeDecks': PremadeDecks
// }

// // Allows for the creation and storing of custom menus not specified 
// // in separate ts files
// export function createMenu(scene: Phaser.Scene, title: string) {
// 	// Check if the given menu exists, if not throw
// 	if (!(title in menus)) {
// 		throw `Given menu ${title} is not in list of implemented menus.`
// 	}

// 	new menus[title](scene)
// }
