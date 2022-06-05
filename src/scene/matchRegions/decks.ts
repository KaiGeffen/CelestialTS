import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'
import BaseScene from '../baseScene'


export default class DecksRegion extends Region {
	ourCallback: () => void
	theirCallback: () => void

	create (scene: BaseScene): DecksRegion {
		this.scene = scene

		this.container = scene.add.container(0, 150)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// Ours
		let ourDeck = []
		for (let i = 0; i < state.deck.length; i++) {
			let card = this.addCard(cardback, CardLocation.ourDeck(this.container, i))

			card.setOnClick(that.ourCallback)

			this.temp.push(card)
			ourDeck.push(card)
		}
		this.animate(state, ourDeck, 0, isRecap)

		// Theirs
		let theirDeck = []
		for (let i = 0; i < state.opponentDeckSize; i++) {
			let card = this.addCard(cardback, CardLocation.theirDeck(this.container, i))

			card.setOnClick(that.theirCallback)
			
			this.temp.push(card)
			theirDeck.push(card)
		}
		this.animate(state, theirDeck, 1, isRecap)
	}

	setCallback(ourCallback: () => void, theirCallback: () => void): void {
		this.ourCallback = ourCallback

		this.theirCallback = theirCallback
	}

	// TODO Go backwards so that cards are hidden that haven't yet reached the discard pile
	// Animate any cards ending in the hand
	private animate(state: ClientState, cards: CardImage[], player: number, isRecap: boolean): void {
		let scene = this.scene
		
		// Keep a count of how many cards have gone to the deck already
		// in order to hide the right card
		let count = 0

		for (let i = state.animations[player].length - 1; i >= 0; i--) {
			let delay = i * Time.recapTween()

			let animation = state.animations[player][i]
			if (animation.to === Zone.Deck) {
				// Create an image for the card in flight, hide the real copy until animation has completed
				let card = this.addCard(animation.card, 
					player === 0 ? CardLocation.ourDeck(this.container) : CardLocation.theirDeck(this.container)
					)

				// Animate the card coming from given zone
				// Remember where to end, then move to starting position
				let x = card.container.x
				let y = card.container.y

			
				// Set the starting position based on zone it's coming from
				let position
				switch (animation.from) {
					case Zone.Hand:
					position = player === 0 ? CardLocation.ourHand(undefined, 0, this.container) : CardLocation.theirHand(undefined, 0, this.container)
					break

					case Zone.Discard:
					position = player === 0 ? CardLocation.ourDiscard(this.container) : CardLocation.theirDiscard(this.container)
					break

					case Zone.Story:
					position = CardLocation.story(state, isRecap, animation.index, this.container, player)
					break

					case Zone.Gone:
					position = CardLocation.gone(this.container)
					break
				}
				card.setPosition(position)

				// Hide the card until it starts animating
				card.hide()

				// Hide the existing card in the Deck pile
				count += 1
				// cards[cards.length - count].hide()

				// Animate moving x direction, becoming visible when animation starts
				this.scene.tweens.add({
					targets: card.container,
					x: x,
					y: y,
					delay: delay,
					duration: Time.recapTweenWithPause(),
					onStart: function (tween, targets, _)
					{
						card.show()
						// scene.sound.play('discard') TODO
					},
					onComplete: () => {
						// cards[cards.length - count].show()
						card.destroy()
					}
				})
			}
		}
	}
}