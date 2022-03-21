import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'

import { Status } from '../../lib/status'


export default class OurHandRegion extends Region {
	// Function called when elements in this region are interacted with
	callback: (i: number) =>  void

	// Effect showing that we have priority
	priorityHighlight: Phaser.GameObjects.Video

	txtDeckCount: Phaser.GameObjects.Text
	txtDiscardCount: Phaser.GameObjects.Text

	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		this.scene = scene // TODO
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - height).setDepth(1)

		let background = this.createBackground(scene)

		// Highlight visible when we have priority
		this.priorityHighlight = scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)

		let avatar = scene.add.image(10, 10, 'avatar-Jules').setOrigin(0)
		
		let divide = scene.add.image(Space.windowWidth - 300 - Space.cardWidth/2, height/2, 'icon-Divide')

		// Deck and discard pile totals
		// TODO Font size as a part of a style
		const x = divide.x + 80
		this.txtDeckCount = scene.add.text(x, 35, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDeck = scene.add.image(x, this.txtDeckCount.y + 25, 'icon-Deck')

		this.txtDiscardCount = scene.add.text(x, 95, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDiscard = scene.add.image(x, this.txtDiscardCount.y + 25, 'icon-Discard')

		// Add each of these objects to container
		this.container.add([
			background,
			this.priorityHighlight,
			avatar,
			divide,
			this.txtDeckCount,
			iconDeck,
			this.txtDiscardCount,
			iconDiscard,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// Statuses
		this.displayStatuses(state)

		// The position these cards will move to if played
		const nextStoryPosition = CardLocation.story(state, state.story.acts.length, this.container, 0)
		
		// Add each of the cards in our hand
		let cardsInHand = []
		for (let i = 0; i < state.hand.length; i++) {
			let card = this.addCard(state.hand[i], CardLocation.ourHand(state, i, this.container))
			.setCost(state.costs[i])
			.moveToTopOnHover()

			card.setOnHover(that.onCardHover(card), that.onCardExit(card, cardsInHand, i))

			if (state.cardsPlayable[i] && state.winner === null) {
				card.setOnClick(that.onCardClick(i, card, cardsInHand, nextStoryPosition))
			}
			else {
				card.setPlayable(false)
			}

			cardsInHand.push(card)
			this.temp.push(card)
		}

		// Pile sizes
		this.txtDeckCount.setText(`${state.deck.length}`)
		this.txtDiscardCount.setText(`${state.discard[0].length}`)

		this.animate(state, cardsInHand, isRecap)
	}

	// TODO 150
	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, 150,
			Color.background, 1
			).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
        let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
        postFxPlugin['add'](background, {
        	thickness: 1,
        	outlineColor: Color.border,
        })

        return background
	}

	// Animate any cards ending in the hand
	private animate(state: ClientState, cards: CardImage[], isRecap: boolean): void {
		let scene = this.scene

		this.animatePriority(state, isRecap)
		
		let delay = 0
		for (let i = 0; i < state.animations[0].length; i++) {
			let animation = state.animations[0][i]
			if (animation.to === Zone.Hand) {
				let card = cards[animation.index]

				// Animate the card coming from given zone
				// Remember where to end, then move to starting position
				let x = card.container.x
				let y = card.container.y

				// TODO Based on animation.from
				card.setPosition(CardLocation.ourDeck(this.container))
				card.hide()

				// Animate moving x direction, appearing at start
				this.scene.tweens.add({
					targets: card.container,
					x: x,
					y: y,
					delay: delay,
					duration: Time.recapTweenWithPause(),
					onStart: function (tween, targets, _)
					{
						card.show()
						scene.sound.play('draw')
					}
				})
			}

			// Delay occurs for each animation even if not going to hand
			delay += Time.recapTween()
		}
	}

	// Animate us getting or losing priority
	private animatePriority(state: ClientState, isRecap: boolean): void {
		const targetAlpha = state.priority === 0 && !isRecap ? 1 : 0

		this.scene.tweens.add({
				targets: this.priorityHighlight,
				alpha: targetAlpha,
				duration: Time.recapTweenWithPause()
			})
	}

	// Return the function that runs when card with given index is clicked on
	private onCardClick(i: number, card: CardImage, hand: CardImage[], endPosition: [number, number]): () => void {
		let that = this

		return function() {
			// Send this card to its place in the story
			that.scene.tweens.add({
				targets: card.container,
				x: endPosition[0],
				y: endPosition[1],
				duration: Time.recapTween(),
				ease: "Sine.easeInOut",
				// After brief delay, tell network, hide info, shift cards to fill its spot
				onStart: function () {setTimeout(function() {
					// Fill in the hole where the card was
					// For every card later than i, move to the right
					for (let j = i + 1; j < hand.length; j++) {
						let adjustedCard = hand[j]

						that.scene.tweens.add({
							targets: adjustedCard.container,
							// TODO Fix this to be in general (Space to move might be smaller if cards squished)
							x: adjustedCard.container.x - 140 - Space.pad,
							duration: Time.recapTween() - 10,
							ease: "Sine.easeInOut"
						})
					}

					// Trigger the callback function for this card
					that.callback(i)
				}, 10)}
			})
		}
	}

	// Return the function that runs when given card is hovered
	private onCardHover(card: CardImage): () => void {
		return () => {
			// TODO This height card must be to be flush with edge
			card.container.setY(50)
		}
	}

	// Return the function that runs when given card hover is exited
	private onCardExit(card: CardImage, cards: CardImage[], index: number): () => void {
		return () => {
			card.container.setY(Space.cardHeight/2)
		}
	}

	// Set the callback for when a card in this region is clicked on
	setCallback(f: (x: number) => void): Region {
		this.callback = f
		return this
	}

	private displayStatuses(state: ClientState): void {
		// Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.status.forEach(function(status, index, array) {
			amts[status]++
		})

		let points = '0 60 0 0 70 10 70 70'
		let y = 10
		for (let i = 0; i < length; i++) {
  			if (amts[i] > 0) {
  				let s = Status[i][0] + ' ' + amts[i]
  				
  				var randomColor = Math.floor(Math.random()*16777215)
  				let shape = this.scene.add.polygon(140, y, points, randomColor, 1).setOrigin(0)
  				let txt = this.scene.add.text(150, y + 35, s, Style.basic).setOrigin(0, 0.5)
  				
  				this.container.add([shape, txt])
  				this.temp.push(shape, txt)

  				y += 60
  			}
  		}
	}
}