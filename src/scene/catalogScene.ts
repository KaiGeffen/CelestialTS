import 'phaser'
import BaseScene from "./baseScene"

import { starterAnubis, starterRobot } from "../catalog/catalog"
import Card from "../lib/card"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { CardImage } from "../lib/cardImage"
import Button from "../lib/button"


class CatalogScene extends BaseScene {
	container: Phaser.GameObjects.Container
	highlight: Phaser.GameObjects.Rectangle
	txtDescription: Phaser.GameObjects.Text

	// Defined in subclasses
	pool: Card[]

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
  		this.scene.start("BuilderScene", {isTutorial: true})
  	}
}


export class AnubisCatalogScene extends CatalogScene {
	pool: Card[] = starterRobot//starterAnubis

	constructor() {
		super({
			key: "AnubisCatalogScene"
		})
	}
}

export class RobotCatalogScene extends CatalogScene {
	pool: Card[] = starterRobot

	constructor() {
		super({
			key: "RobotCatalogScene"
		})
	}
}