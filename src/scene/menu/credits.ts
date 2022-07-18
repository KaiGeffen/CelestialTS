import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'

import Menu from './menu'
import { Space, Color, Style, UserSettings } from '../../settings/settings'


// TODO Change width
export default class CreditsMenu extends Menu {
	// TODO This is a fix to an issue with GetAllChildrenSizers not working
	// in the sizer child of scrollable panel, which is called when trying to destroy
	// that object as the scene ends

	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel)

		// Add panel to a scrollable panel
		let scrollable = this.createScrollablePanel(scene, panel)
		scrollable.layout()

		// this.contents = scrollable
	}

	// onClose() {
	// 	this.contents.destroy()
	// }

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,

			space: {
				left: Space.pad/2,
				right: Space.pad/2,
				top: Space.pad/2,
				bottom: Space.pad/2,
				item: Space.pad/2,
				line: Space.pad/2,
			},
		}
		)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel) {
		let txt = scene.add.text(0, 0, creditsString, Style.basic)

		panel.add(txt)
	}

	private createScrollablePanel(scene: Phaser.Scene, panel) {
		let background = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background)
		.setInteractive()

		let scrollable = scene['rexUI'].add.scrollablePanel({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: 50,
			height: Space.windowHeight - Space.pad * 2,
			
			header: this.createHeader('Credits', Space.maxTextWidth),
			
			panel: {
				child: panel.setDepth(1)
			},
			background: background,

			mouseWheelScroller: {
				speed: 1
			},
		})

		// NOTE This is a fix for sizer objects not deleting properly in all cases
		scrollable.name = 'top'

		return scrollable
	}
}

const creditsString = 
`UI Design: Alina Onishchenko
Game Development / Programming: Kai Geffen
Art: Kiva Singh

Cardback by Susan Arnsten-Russell
Original score and music design by Ian Riley: www.ianrileymusic.tech
All icons are from game-icons.net under CC BY 3.0

Delapouite: https://delapouite.com/
Stars, Spy, Swift, Crypt, Fishing Boat, Factory, Mine, Chimney, Uprising, Sarcophagus, Anubis, Horus, Enrage, Camera, Butterfly, Bandit, Wanted Poster, Night Vision, Bastet, Stable, Pelican, Beehive, Eagle, Icarus, Ecology, Scarab, Kneel, Desert, Generator, Conquer, Cornucopia, Paramountcy, Sunflower, Gentle Rain, PVP icon, Draft icon, Exit icon, Retry icon

Lorc: https://lorcblog.blogspot.com/
Bone Knife, Cog, Crossed Bones, Dove, Juggle, Drown, Gears, Dash, Cosmos, Fruiting, Gift, Paranoia, Hurricane, Dinosaur Bones, Lotus, Oak, Cardback, Broken Bone, Robot, Bee, Disintegrate, Imprison, Fish Bones, Bounty, Anvil, Nightmare, Sickness, Cogsplosion, Phoenix, Symbiosis, Sun, Carrion, Hollow, Basics icon, Review icon

Lord Berandas: https://www.deviantart.com/berandas
Sine, AI

Dark Zaitzev: https://www.deviantart.com/darkzaitzev
Stalker

Cathelineau:
Tumulus, Occupation

Skoll:
Unearth, Pocket Watch, Password icon

Caro Asercion:
Boar, Axolotl, Heron`
