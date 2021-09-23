import 'phaser'
import BaseScene from "./baseScene"

import Card from "../lib/card"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { CardImage } from "../lib/cardImage"
import { decodeDeck } from "../lib/codec"
import Button from "../lib/button"
import prebuiltDecks from "../catalog/prebuiltDecks"


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
		super.precreate()
    
		// Instructional text
		let txt = "Below are just a few of the cards that you can use in Celestial.\nClick on them to see explanations and advice.\nClick 'Next' to move on to the deck-builder."
		this.add.text(Space.pad, Space.pad, txt, StyleSettings.catalog)

		// Highlight for selected card
		let size = Space.cardSize + Space.pad
		this.highlight = this.add.rectangle(0, 0, size, size, ColorSettings.catalogHighlight, 1)
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
				this.highlight.copyPosition(card.container)
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
		image.on('pointerdown', this.onClick(card, cardImage.container))

		return cardImage
	}

	private getCardPosition(index: number): [number, number] {
		let pageNumber = Math.floor(index / Space.cardsPerPage)
		index = index % Space.cardsPerPage

		let col = index
		let xPad = (1 + col) * Space.pad
		let x = col * Space.cardSize + xPad + Space.cardSize / 2

		let row = 0
		let yPad = (1 + row) * Space.pad
		let y = row * Space.cardSize + yPad + Space.cardSize / 2

		return [x, y]
	}

	private onClick(card: Card, container: Phaser.GameObjects.Container): () => void {
	    let that = this
	    return function() {
	      that.sound.play('click')

	      // Move the highlight to behind card
	      that.highlight.setPosition(container.x, container.y)
	      that.highlight.setVisible(true)

	      that.txtDescription.setText(card.catalogText)
	    }
  	}

  	private goNext(): void {
  		this.scene.start("TutorialBuilderScene",
  			{cardpool: this.pool,
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
	defaultDeck: string = prebuiltDecks.get('Anubis')
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
	pool: Card[] = decodeDeck("2™4™8™11™10™15™18™22")
	defaultDeck: string = prebuiltDecks.get('Robots')
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
	defaultDeck: string = prebuiltDecks.get('Stalker')
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
	defaultDeck: string = prebuiltDecks.get('Crypt')
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
	defaultDeck: string = prebuiltDecks.get('Bastet')
	name = "Bastet"
	deckDescription: string = 
`survives the early game, trading rounds
by spending Nourish and empowering Bastets. It seeks to replay
the strongest Bastet often using Raise Dead and the shuffle.`

	constructor() {
		super({
			key: "BastetCatalogScene"
		})
	}
}

export class HorusCatalogScene extends CatalogScene {
	pool: Card[] = decodeDeck("27™28™31™32™39™11™13™45")
	defaultDeck: string = prebuiltDecks.get('Horus')
	name = "Horus"
	deckDescription: string = 
`only occasionally wins rounds in the early
game with Sine, opting instead to fill up the opponent's hand with
Cameras, ensuring knowledge it uses to reset or play free Horus's.`

	constructor() {
		super({
			key: "HorusCatalogScene"
		})
	}
}

