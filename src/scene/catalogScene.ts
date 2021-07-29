import 'phaser'
import BaseScene from "./baseScene"

import { starterAnubis, starterRobot } from "../catalog/catalog"
import Card from "../lib/card"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { CardImage } from "../lib/cardImage"
import Button from "../lib/button"


const anubisDescriptions = {
	'Stars': 
`
Stars costs no mana and gives you no points, but on the next round
you will have 1 extra mana.

The line at the bottom describes what the Inspire keyword means.

It's best if you have a plan for how to spend that mana next round,
otherwise it could go to waste.
`,
	'Crossed Bones':
`
Crossed Bones costs 1 mana for 2 points, which is very good value.

However, it has the drawback that it puts 2 bad cards (Broken Bones)
into your discard pile, which you may end up drawing later on.

This downside can be used to your advantage if you play cards that
care about having large discard piles, such as Tumulus or Anubis.
`,
	'Dash':
`
Dash costs 2 mana for 3 points, which means it beats most other 2
mana cards.

However, because of Flare, it will be worth 1 less point for every
card that was played before it in a round.

If you have more wins than your opponent, you will start the round
with priority, and can play Dash as your first card for maximum points.
`,
	'Gift':
`
Gift costs 3 mana for 3 points, and also makes both players draw 1.

If your opponent doesn't have enough room in their hand, they won't
end up drawing a card, and Gift becomes extra efficient.

Against certain combo decks, gift can also break up what they are
trying to do by drawing them a card at the wrong time.
`,
	'Dinosaur Bones':
`
Dinosaur Bones costs 4 mana for 5 points, which is excellent.

However, it has the drawback that it puts 3 bad cards (Broken Bones)
into your discard pile, which you may end up drawing later on.

This downside can be used to your advantage if you play cards that
care about having large discard piles, such as Tumulus or Anubis.
`,
	'Tumulus':
`
Tumulus costs 5 mana for 4 points, but is instead worth 6 points
if you have at least 8 cards in your discard pile.

To have 8 cards by round 5, you would have to play 2 cards each
round for the first 4 rounds, which is hard to pull off.

Also, after you've shuffled your discard pile, it will take some
time before you can get the full 6 points out of Tumulus.
`,
	'Sarcophagus':
`
Sarcophagus will put the most expensive card in your discard pile
back on top of your deck, and give you points equal to its cost.

This means you'll draw that card next round, which is great for
ensuring you don't run out of things to spend your mana on.

Putting a card on top of your deck also delays you shuffling your
discard pile, which is sometimes to your advantage.
`,
	'Anubis':
`
Anubis costs 7 mana for 7 points, but can be played for free if
your discard pile has at least 12 cards in it.

This is great for comboing with Sarcophagus, since you can get
14 points multiple rounds in a row.

Be careful not to play this if you don't need the points; winning
a round 2 to 0 is just as good as winning 9 to 0.

`
}

const robotDescriptions = {
	'Stars': 
`
Stars costs no mana and gives you no points, but on the next round
you will have 1 extra mana.

The line at the bottom describes what the Inspire keyword means.

It's best if you have a plan for how to spend that mana next round,
otherwise it could go to waste.
`,
	'Crossed Bones':
`
Crossed Bones costs 1 mana for 2 points, which is very good value.

However, it has the drawback that it puts 2 bad cards (Broken Bones)
into your discard pile, which you may end up drawing later on.

This downside can be used to your advantage if you play cards that
care about having large discard piles, such as Tumulus or Anubis.
`,
	'Dash':
`
Dash costs 2 mana for 3 points, which means it beats most other 2
mana cards.

However, because of Flare, it will be worth 1 less point for every
card that was played before it in a round.

If you have more wins than your opponent, you will start the round
with priority, and can play Dash as your first card for maximum points.
`,
	'Gift':
`
Gift costs 3 mana for 3 points, and also makes both players draw 1.

If your opponent doesn't have enough room in their hand, they won't
end up drawing a card, and Gift becomes extra efficient.

Against certain combo decks, gift can also break up what they are
trying to do by drawing them a card at the wrong time.
`,
	'Dinosaur Bones':
`
Dinosaur Bones costs 4 mana for 5 points, which is excellent.

However, it has the drawback that it puts 3 bad cards (Broken Bones)
into your discard pile, which you may end up drawing later on.

This downside can be used to your advantage if you play cards that
care about having large discard piles, such as Tumulus or Anubis.
`,
	'Tumulus':
`
Tumulus costs 5 mana for 4 points, but is instead worth 6 points
if you have at least 8 cards in your discard pile.

To have 8 cards by round 5, you would have to play 2 cards each
round for the first 4 rounds, which is hard to pull off.

Also, after you've shuffled your discard pile, it will take some
time before you can get the full 6 points out of Tumulus.
`,
	'Sarcophagus':
`
Sarcophagus will put the most expensive card in your discard pile
back on top of your deck, and give you points equal to its cost.

This means you'll draw that card next round, which is great for
ensuring you don't run out of things to spend your mana on.

Putting a card on top of your deck also delays you shuffling your
discard pile, which is sometimes to your advantage.
`,
	'Anubis':
`
Anubis costs 7 mana for 7 points, but can be played for free if
your discard pile has at least 12 cards in it.

This is great for comboing with Sarcophagus, since you can get
14 points multiple rounds in a row.

Be careful not to play this if you don't need the points; winning
a round 2 to 0 is just as good as winning 9 to 0.

`
}



class CatalogScene extends BaseScene {
	container: Phaser.GameObjects.Container
	highlight: Phaser.GameObjects.Rectangle
	txtDescription: Phaser.GameObjects.Text

	// Defined in subclasses
	pool: Card[]
	descriptions: Record<string, string>

	init(params: any): void {
		console.log('initing')
		this.container = this.add.container(0, 140)
	}

	// Create the scene using the given catalog of card names:descriptions
	create(): void {
		console.log('here')
		// Instructional text
		let txt = "Below are just a few of the cards that you can use in Celestial.\nClick on them to see explanations and advice.\nClick 'Next' to move on to the deck-builder."
		this.add.text(Space.pad, Space.pad, txt, StyleSettings.basic)

		// Highlight for selected card
		let size = Space.cardSize + Space.pad
		this.highlight = this.add.rectangle(0, 0, size, size, ColorSettings.mulliganHighlight, 1)
		this.container.add(this.highlight)

		// Description of the selected card
		this.txtDescription = this.add.text(Space.pad, 250, '', StyleSettings.basic)

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
				this.txtDescription.setText(this.descriptions[card.card.name])
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

	      that.txtDescription.setText(that.descriptions[card.name])
	    }
  	}

  	private goNext(): void {
  		this.scene.start("BuilderScene", {isTutorial: true})
  	}
}


export class AnubisCatalogScene extends CatalogScene {
	pool: Card[] = starterAnubis
	descriptions: Record<string, string> = anubisDescriptions

	constructor() {
		super({
			key: "AnubisCatalogScene"
		})
	}
}

export class RobotCatalogScene extends CatalogScene {
	pool: Card[] = starterRobot
	descriptions: Record<string, string> = robotDescriptions

	constructor() {
		super({
			key: "RobotCatalogScene"
		})
	}
}