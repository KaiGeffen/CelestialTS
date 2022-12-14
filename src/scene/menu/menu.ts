import "phaser"
import { Style, Color, Space } from '../../settings/settings'
import MenuScene from '../menuScene'


export default class Menu {
	// The scene which contains only this menu
	scene: MenuScene

	// The callback for when this menu is closed
	exitCallback: () => void

	// The width of this menu
	width: number

	// The main panel for this menu
	sizer: any

	constructor(scene: MenuScene,
		width: number = Space.windowWidth - Space.pad*2,
		params?
		) {
		this.scene = scene

		this.width = width

		if (params) {
			this.exitCallback = params.exitCallback
		}

		// Create the basic sizer
		this.createSizer()
	}

	close() {
		if (this.exitCallback) {
			this.exitCallback()
		}

		this.scene.endScene()()
	}

	protected layout(): void {
		this.sizer.layout()
	}

	// Create the menu header
	protected createHeader(s: string, width: number = this.width): any {
		let background = this.scene.add.rectangle(0, 0, 1, 1, Color.background2)
		
		let sizer = this.scene['rexUI'].add.sizer({width: width})
		.addBackground(background)

		let txt = this.scene.add.text(0, 0, s, Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		// Add a drop shadow going down from the background
		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			angle: -90,
			shadowColor: 0x000000,
		})

		return sizer
	}

	protected createSizer(): void {
		this.sizer = this.scene['rexUI'].add.fixWidthSizer({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: this.width,

			align: 'center',

			space: {
				// left: Space.pad,
				// right: Space.pad,
				bottom: Space.pad,
				line: Space.pad,
			}
		})

		// Add background
		let rect = this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		this.sizer.addBackground(rect)

	}

	// Return a sizer with the given text
	protected createText(s: string): void {

	}
}


import OptionsMenu from "./optionsMenu"
import ChoosePremade from "./choosePremade"
import CreditsMenu from "./credits"
import RulebookMenu from "./rulebook"
// TODO Rename since it includes both
import { NewDeckMenu, EditDeckMenu } from "./newDeck"
import ShareDeckMenu from "./shareDeck"
import PasteMenu from "./paste"
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
	'paste': PasteMenu,
	'mode': ModeMenu,
	'editDeck': EditDeckMenu,
	'disconnect': DCMenu,
	'confirm': ConfirmMenu,
	'search': SearchMenu,
	'distribution': DistributionMenu,
}

// Function exposed for the creation of custom menus
export function createMenu(scene: Phaser.Scene, title: string, params): Menu {
	// Check if the given menu exists, if not throw
	if (!(title in menus)) {
		throw `Given menu ${title} is not in list of implemented menus.`
	}

	return new menus[title](scene, params)
}
