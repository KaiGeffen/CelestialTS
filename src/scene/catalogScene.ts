import 'phaser'
import BaseScene from "./baseScene"

import Card from "../lib/card"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { CardImage } from "../lib/cardImage"
import { decodeDeck } from "../lib/codec"
import Button from "../lib/button"


class CatalogScene extends BaseScene {
	container: Phaser.GameObjects.Container
	highlight: Phaser.GameObjects.Rectangle
	txtDescription: Phaser.GameObjects.Text

	// Defined in subclasses
	pool: Card[]
	defaultDeck: string
	name: string
	deckDescription: string

	init(params: any): void {
		this.container = this.add.container(0, 140)
	}

	create(): void {
		// Instructional text
		let txt = "Below are just a few of the cards that you can use in Celestial.\nClick on them to see explanations and advice.\nClick 'Next' to move on to the deck-builder."
		this.add.text(Space.pad, Space.pad, txt, StyleSettings.catalog)

		// Highlight for selected card
		let size = Space.cardSize + Space.pad
		this.highlight = this.add.rectangle(0, 0, size, size, ColorSettings.mulliganHighlight, 1)
		this.container.add(this.highlight)

		// Description of the selected card
		this.txtDescription = this.add.text(Space.pad, 280, '', StyleSettings.catalog)

		// Next button
		let [x, y] = this.getCardPosition(6)
		x += Space.cardSize/2
		y += 50
		new Button(this, x, y, 'Next', this.goNext).setOrigin(1, 0.5)

		// Cards
		for (var i = 0; i < this.pool.length; i++) {
			let card = this.addCard(this.pool[i], i)

			if (i === 0) {
				this.highlight.copyPosition(card.image)
				this.txtDescription.setText(card.card.catalogText)
			}
		}

		super.create()
	}

	beforeExit(): void {
		// TODO Remember current location?
	}

	private addCard(card: Card, index: number): CardImage {
		let cardImage = new CardImage(card, this.container)

		cardImage.setPosition(this.getCardPosition(index))

		let image = cardImage.image

		image.setInteractive()
		image.on('pointerdown', this.onClick(card, image))

		return cardImage
	}

	private getCardPosition(index: number): [number, number] {
		let pageNumber = Math.floor(index / Space.cardsPerPage)
		index = index % Space.cardsPerPage

		let col = index % Space.cardsPerRow
		let xPad = (1 + col) * Space.pad
		let x = col * Space.cardSize + xPad + Space.cardSize / 2
		x += pageNumber * Space.pageOffset

		let row = Math.floor(index / Space.cardsPerRow)
		let yPad = (1 + row) * Space.pad
		let y = row * Space.cardSize + yPad + Space.cardSize / 2

		return [x, y]
	}

	private onClick(card: Card, image: Phaser.GameObjects.Image): () => void {
	    let that = this
	    return function() {
	      that.sound.play('click')

	      // Move the highlight to behind card
	      that.highlight.setPosition(image.x, image.y)
	      that.highlight.setVisible(true)

	      that.txtDescription.setText(card.catalogText)
	    }
  	}

  	private goNext(): void {
  		this.scene.start("BuilderScene",
  			{isTutorial: true,
  				cardpool: this.pool,
  				defaultDeck: this.defaultDeck,
  				lastScene: this.name + "CatalogScene",
  				deckDescription: this.deckDescription,
  				tutorialName: this.name
  			}
  			)
  	}
}


export class AnubisCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("0™3™6™12™14™17™20™21")
	defaultDeck: string = "21:20:20:14:14:14:14:3:3:3:3:3:0:0:0"
	name = "Anubis"
	deckDescription: string = 
`wins early rounds with Crossed Bones,
plays Anubis for free in later rounds, then uses Sarcophagus
to put him back on top of the deck to wrap up the match.`

	constructor() {
		super({
			key: "AnubisCatalogScene"
		})
	}
}

export class RobotsCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("0™2™3™8™12™10™15™22")
	defaultDeck: string = "22:22:15:10:12:12:8:8:3:3:2:2:2:2:0"
	name = "Robots"
	deckDescription: string = 
`spends early rounds building large robots.
It seeks to use Mine to remove weaker cards, then settle into
a powerful final state of playing cheap AI for points and card draw.`

	constructor() {
		super({
			key: "RobotsCatalogScene"
		})
	}
}

export class StalkerCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("1™12™11™13™16™19™20™23")
	defaultDeck: string = "23:20:19:19:19:19:13:11:12:1:1:1:1:1:1"
	name = "Stalker"
	deckDescription: string = 
`attacks the opponent's hand with multiple
copies of Bone Knife, then steals rounds with cheap Stalkers.
It ends with strong and consistent high-cost cards like Oak.`

	constructor() {
		super({
			key: "StalkerCatalogScene"
		})
	}
}

export class CryptCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("0™1™35™36™12™15™19™20")
	defaultDeck: string = "20:19:19:19:15:12:12:36:36:36:35:1:1:1:0"
	name = "Crypt"
	deckDescription: string = 
`attacks your opponent's hand in the early
game, then transforms Stalker into Sarcophagus and Crypt into
Imprison in the late game to control and overwhelm your opponent.`

	constructor() {
		super({
			key: "CryptCatalogScene"
		})
	}
}

export class BastetCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("0™28™25™3™33™34™11™23")
	defaultDeck: string = "11:11:11:11:34:34:34:33:33:33:3:3:28:28:0"
	name = "Bastet"
	deckDescription: string = 
`TODO

`

	constructor() {
		super({
			key: "BastetCatalogScene"
		})
	}
}

export class HorusCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("27™28™31™32™39™11™13™45")
	defaultDeck: string = "45:45:13:13:11:39:39:32:31:31:28:27:27:27:27"
	name = "Horus"
	deckDescription: string = 
`

TODO`

	constructor() {
		super({
			key: "HorusCatalogScene"
		})
	}
}

