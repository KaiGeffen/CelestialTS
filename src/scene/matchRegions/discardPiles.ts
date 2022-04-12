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


export default class DiscardPilesRegion extends Region {
	ourCallback: () => void
	theirCallback: () => void

	create (scene: BaseScene): DiscardPilesRegion {
		this.scene = scene

		this.container = scene.add.container(Space.windowWidth, Space.windowHeight/2).setDepth(-1)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// Ours
		let ourDiscard = []
		for (let i = 0; i < state.discard[0].length; i++) {
			let card = this.addCard(state.discard[0][i], CardLocation.ourDiscard(this.container, i))
			
			card.setOnClick(that.ourCallback)

			this.temp.push(card)
			ourDiscard.push(card)
		}
		this.animate(state, ourDiscard, 0, isRecap)

		// Theirs
		let theirDiscard = []
		for (let i = 0; i < state.discard[1].length; i++) {
			let card = this.addCard(state.discard[1][i], CardLocation.theirDiscard(this.container, i))

			card.setOnClick(that.theirCallback)

			this.temp.push(card)
			theirDiscard.push(card)
		}
		this.animate(state, theirDiscard, 1, isRecap)
	}

	setCallback(ourCallback: () => void, theirCallback: () => void): void {
		this.ourCallback = ourCallback
		this.theirCallback = theirCallback
	}

	// TODO Go backwards so that cards are hidden that haven't yet reached the discard pile
	// Animate any cards ending in the hand
	private animate(state: ClientState, cards: CardImage[], player: number, isRecap: boolean): void {
		let scene = this.scene
		
		// Keep a count of how many cards have gone to the discard already
		// in order to hide the right card
		let count = 0

		for (let i = state.animations[player].length - 1; i >= 0; i--) {
			let delay = i * Time.recapTween()

			let animation = state.animations[player][i]
			if (animation.to === Zone.Discard) {
				// Create an image for the card in flight, hide the real copy until animation has completed
				let card = this.addCard(animation.card, 
					player === 0 ? CardLocation.ourDiscard(this.container) : CardLocation.theirDiscard(this.container)
					)

				// Animate the card coming from given zone
				// Remember where to end, then move to starting position
				let x = card.container.x
				let y = card.container.y

				if (animation.from === Zone.Discard) {
					// This is the card having an effect in the player's discard pile
					this.animateEmphasis(card, delay)
				}
				else {
					// Set the starting position based on zone it's coming from
					let position
					switch (animation.from) {
						case Zone.Hand:
						position = player === 0 ? CardLocation.ourHand(undefined, 0, this.container) : CardLocation.theirHand(undefined, 0, this.container)
						break

						case Zone.Deck:
						position = player === 0 ? CardLocation.ourDeck(this.container) : CardLocation.theirDeck(this.container)
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

					// Hide the existing card in the discard pile
					count += 1
					cards[cards.length - count].hide()

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
							scene.sound.play('discard')
						},
						onComplete: () => {
							cards[cards.length - count].show()
							card.destroy()
						}
					})
				}
			}
		}
	}
}