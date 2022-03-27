import "phaser"
import BaseScene from "./baseScene"

import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"

import { Style, Time, Space } from "../settings/settings"


export default class ChoiceScene extends BaseScene {
	constructor() {
		super({
			key: "ChoiceScene"
		})
	}

	create(): void {
		super.precreate()

		// Create menu
		let menu = this.createChoiceMenu()

		// Create text
		let s = 
`Welcome to Celestial!
This digital card game has been a passion project of the last 2 years,
and continues to be regularly updated and developed.

This release contains 24 cards in the base set, with another
24 more experimental cards in an optional expansion.

Celestial is best when played against a friend, but can also be a fun
single-player experience, with lots of interesting decks to tinker with.

Press 'esc' to open the options menu, or click on the ⚙ above.

Check out some of the available starter decks!`
		// this.add.text(Space.pad, Space.pad, s, Style.catalog)
		let txt = this.rexUI.add['textBox']({
			x: Space.pad,
			y: Space.pad,
			text: this.add['rexBBCodeText'](0, 0, '', Style.basic)
		}).setOrigin(0)

		txt.start('[stroke=black]' + s + '[/stroke]', Time.textSpeed())

		// Create a button to open menu
	    let btnChoices = new Button(this, Space.windowWidth/2, Space.windowHeight - 50, "Starter Decks", () => {menu.open()}).setOrigin(0.5)
		
		super.create()
	}

	private createChoiceMenu(): Menu {
		let that = this

		let menu = new Menu(
	      this,
	      800,
	      Space.iconSeparation * 3,
	      false,
	      30)

		let x = -300
		let xTxt = x + Space.iconSeparation*2/3
		let y = Space.cardSize/4

	    new Icon(this, menu, x, y - Space.iconSeparation, 'Anubis', function() {
	      that.scene.start("AnubisCatalogScene")
	    })
	    let iconRobots = new Icon(this, menu, x, y, 'Robots', function() {
	      that.scene.start("RobotsCatalogScene")
	    })
	    let iconStalker = new Icon(this, menu, x, y + Space.iconSeparation, 'Stalker', function() {
	      that.scene.start("StalkerCatalogScene")
	    })

	    // Explanations
	    let s = 
`Aggressively win early rounds and fill
up your discard pile to pull off
powerful combos before you shuffle!`
	    menu.add(this.add.text(xTxt, -Space.iconSeparation, s, Style.basic).setOrigin(0, 0.5))

	    s = 
`Build huge robots while removing
weaker cards from your deck in
order to dominate the late game!`
	    menu.add(this.add.text(xTxt, 0, s, Style.basic).setOrigin(0, 0.5))

	    s = 
`Control your opponent's hand and
reset their points before stealing
rounds with deadly ease!`
	    menu.add(this.add.text(xTxt, Space.iconSeparation, s, Style.basic).setOrigin(0, 0.5))

	    return menu
	}
}