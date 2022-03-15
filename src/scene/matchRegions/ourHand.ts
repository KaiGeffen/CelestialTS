import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'



export default class OurHandRegion extends Region {
	// TODO Add this to base class
	scene: Phaser.Scene

	// Function called when elements in this region are interacted with
	callback: (i: number) =>  void

	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		this.scene = scene // TODO
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - height)

		// Make a container
		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.menuBackground, 1
			).setOrigin(0)

		let avatar = scene.add.image(Space.pad, Space.pad, 'avatar-Jules').setOrigin(0)

		// Recap button
		let btnRecap = new Button(scene,
			Space.windowWidth - Space.pad,
			height / 3,
			'Recap'
			).setOrigin(1, 0.5)

		// Pass button
		let btnPass = new Button(scene,
			Space.windowWidth - Space.pad,
			height * 2 / 3,
			'Pass',
			() => { that.callback(10) }
			).setOrigin(1, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			avatar,
			btnRecap,
			btnPass,
			])

		return this
	}

	displayState(state: ClientState): void {
		this.deleteTemp()

		let that = this

		// Go in reverse order so that cards to the right are animated
		// filling in the hole left when card is played
		let cardsInHand = []
		for (let i = 0; i < state.hand.length; i++) {
			const x = 300 + (140 + Space.pad) * i

			let card = this.addCard(state.hand[i], [x, 200/2])

			if (state.cardsPlayable[i]) {
				card.setOnClick(that.onCardClick(i, card, cardsInHand))
			}
			else {
				card.setPlayable(false)
			}

			cardsInHand.push(card)
			this.temp.push(card)
		}

		// TODO Statuses

		this.animate(state, cardsInHand)
	}

	// Animate any cards ending in the hand
	private animate(state: ClientState, cards: CardImage[]): void {
		let scene = this.scene
		
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
				card.setPosition([0, -200])
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

	// Return the function that runs when card with given index is clicked on
	private onCardClick(i: number, card: CardImage, hand: CardImage[]): () => void {
		let that = this

		// TODO position in story
		const end = [66, -277]

		return function() {
			// Send this card to its place in the story
			that.scene.tweens.add({
				targets: card.container,
				x: end[0],
				y: end[1],
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

	// Set the callback for when a card in this region is clicked on
	setCallback(f: (x: number) => void): Region {
		this.callback = f
		return this
	}
}