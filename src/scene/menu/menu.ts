import "phaser"

export default class Menu {
	scene: Phaser.Scene
	exitCallback: () => void

	constructor(scene: Phaser.Scene, params?) {
		this.scene = scene

		if (params) {
			this.exitCallback = params.exitCallback
		}
	}

	close() {
		if (this.exitCallback) {
			this.exitCallback()
		}

		this.scene.scene.stop()
	}
}


import OptionsMenu from "./optionsMenu"
import ChoosePremade from "./choosePremade"
import CreditsMenu from "./credits"
import RulebookMenu from "./rulebook"
// TODO Rename since it includes both
import { NewDeckMenu, EditDeckMenu } from "./newDeck"
import ShareDeckMenu from "./shareDeck"
import ModeMenu from "./mode"
import DCMenu from './disconnect'
import ConfirmMenu from './confirm'
import SearchMenu from './search'
import DistributionMenu from './distribution'


const menus = {
	'options': OptionsMenu,
	'choosePremade': ChoosePremade,
	'credits': CreditsMenu,
	'rulebook': RulebookMenu,
	'newDeck': NewDeckMenu,
	'shareDeck': ShareDeckMenu,
	'mode': ModeMenu,
	'editDeck': EditDeckMenu,
	'disconnect': DCMenu,
	'confirm': ConfirmMenu,
	'search': SearchMenu,
	'distribution': DistributionMenu,
}

// Allows for the creation and storing of custom menus not specified 
// in separate ts files
export function createMenu(scene: Phaser.Scene, title: string, params): Menu {
	// Check if the given menu exists, if not throw
	if (!(title in menus)) {
		throw `Given menu ${title} is not in list of implemented menus.`
	}

	return new menus[title](scene, params)
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
