import 'phaser'
import ClientState from '../../lib/clientState'
import BaseScene from '../baseScene'
import { Animation, Zone } from '../../lib/animation'
import CardLocation from './cardLocation'
import { CardImage } from '../../lib/cardImage'
import { Space, Time, Depth } from '../../settings/settings'
import { cardback } from '../../catalog/catalog'
import { View } from '../gameScene'
import { Status } from '../../lib/status'


export default class Animator {
	scene: BaseScene
	view: View
	container: Phaser.GameObjects.Container

	constructor(scene: BaseScene, view: View) {
		this.scene = scene
		this.view = view
		this.container = scene.add.container().setDepth(Depth.aboveAll)
	}

	animate(state: ClientState): void {
		// TODO Handle initial mulligan separately
		if (state.versionNumber === 0) {
			return
		}

		for (let owner = 0; owner < 2; owner++) {
			for (let i = 0; i < state.animations[owner].length; i++) {
				let animation = state.animations[owner][i]

				if (animation.from === Zone.Mulligan) {
					this.animateMulligan(animation, owner, i)
				}

				// Gain a status
				if (animation.from === Zone.Status) {
					this.animateStatus(animation, owner, i)
					continue
				}

				// Shuffle a player's deck
				if (animation.from === Zone.Shuffle) {
					this.animateShuffle(owner, i)
					continue
				}

				// Transform a card TODO
				if (animation.to === Zone.Transform) {
					// The only occurence of this left is Transform > Story changing acts into Robots
					continue
				}

				let start = this.getStart(animation, state, owner)
				let end = this.getEnd(animation, state, owner)

				if (animation.card !== null) {
					let card = this.createCard(animation.card, start)
					
					// Get the cardImage that this card becomes upon completion, if there is one
					let permanentCard = this.getCard(animation, owner)

					if (animation.to !== animation.from) {
						// Show the card in motion between start and end
						this.animateCard(card, end, i, permanentCard)
					}
					else {
						// Emphasize the card if it stayed in the same zone
						this.animateEmphasis(card, i)
					}
				}
			}
		}	
	}

	private getStart(animation: Animation, state, owner: number): [number, number] {
		switch (animation.from) {
			case Zone.Deck:
			if (owner === 0) {
				return CardLocation.ourDeck()
			}
			else {
				return CardLocation.theirDeck(this.container)
			}

			case Zone.Story:
			return CardLocation.story(state, false, animation.index, this.container, owner)

			case Zone.Gone:
			return CardLocation.gone(this.container)

			case Zone.Hand:
			if (owner === 0) {
				return CardLocation.ourHand(state, animation.index)
			}
			else {
				return CardLocation.theirHand(state, animation.index, this.container)
			}
			
			case Zone.Discard:
			if (owner === 0) {
				return CardLocation.ourDiscard(this.container)
			}
			else {
				return CardLocation.theirDiscard(this.container)
			}
		}

		return [300,300]
	}

	private getEnd(animation: Animation, state, owner): [number, number] {
		switch (animation.to) {
			case Zone.Deck:
			if (owner === 0) {
				return CardLocation.ourDeck()
			}
			else {
				return CardLocation.theirDeck(this.container)
			}

			// TODO Clarify index 1 and 2, mostly 2 seems to be null
			case Zone.Story:
			return CardLocation.story(state, false, animation.index, this.container, owner)

			case Zone.Gone:
			return CardLocation.gone(this.container)

			case Zone.Hand:
			if (owner === 0) {
				return CardLocation.ourHand(state, animation.index)
			}
			else {
				return CardLocation.theirHand(state, animation.index, this.container)
			}

			case Zone.Discard:
			if (owner === 0) {
				return CardLocation.ourDiscard(this.container)
			}
			else {
				return CardLocation.theirDiscard(this.container)
			}
		}

		return [300,300]
	}

	private createCard(card, start): CardImage {
		let cardImage = new CardImage(card, this.container, false)

		// Set its initial position and make it hidden until its tween plays
		cardImage.setPosition(start)
		cardImage.hide()

		return cardImage
	}

	// Get the cardImage referenced by this animation
	private getCard(animation: Animation, owner: number): CardImage {
		let card

		switch(animation.to) {
			case Zone.Hand:
			if (owner === 0) {
				// TODO Check length
				card = this.view.ourHand.cards[animation.index]
			} else {
				card = this.view.theirHand.cards[animation.index]
			}
			break

			// case Zone.

		}
		return card
	}

	// Animate the given card moving to given end position with given delay
	// If a permanent card is specified, that's the image that should become visible when tween completes
	private animateCard(card: CardImage, end: [number, number], i: number, permanentCard?: CardImage) {
		let that = this
		if (permanentCard) {
			permanentCard.hide()
		}

		// Animate moving x direction, becoming visible when animation starts
		this.scene.tweens.add({
			targets: card.container,
			x: end[0],
			y: end[1],
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween(),
			// ease: Phaser.Math.Easing.Sine.In,
			onStart: function (tween: Phaser.Tweens.Tween, targets, _)
			{
				card.show()
				// TODO Different for create?
				that.scene.sound.play('draw')
			},
			onComplete: function (tween, targets, _)
			{
				if (permanentCard) {
					permanentCard.show()					
				}
				card.destroy()
			}
		})
	}

	// Animate a card being thrown back into the deck during mulligan phase
	private animateMulligan(animation: Animation, owner: number, i: number) {
		if (owner === 1) {
			return
		}

		let mulligan = this.view.mulligan
		
		// Get the cardImage that is being referenced
		let card: CardImage
		let mulliganedCount = 0
		for (let i = 0; i < mulligan['mulliganChoices'].length; i++) {
			if (mulligan['mulliganChoices']) {
				if (mulliganedCount === animation.index) {
					card = mulligan.cards[i]
					break
				}
				mulliganedCount++
			}
		}

		// Remove that cardimage from its container
		this.container.add(card.container)
		// card.setContainer(this.container)

		// Should go to our deck
		let end = CardLocation.ourDeck()

		this.animateCard(card, end, i)
	}

	// Animate the given player's deck shuffling
	private animateShuffle(owner: number, i: number): void {
		let that = this

		let start
		if (owner === 0) {
			start = CardLocation.ourDeck()
		}
		else {
			start = CardLocation.theirDeck()
		}
		
		let topCard = this.createCard(cardback, start)
		let bottomCard = this.createCard(cardback, start)

		this.scene.add.tween({
			targets: topCard.container,
			x: start[0] + Space.cardWidth/2,
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween()/4,
			yoyo: true,
			repeat: 1,
			onStart: function (tween: Phaser.Tweens.Tween, targets, _)
			{
				topCard.show()
				that.scene.sound.play('shuffle')
			},
			onComplete: function (tween, targets, _)
			{
				topCard.destroy()
			}
		})

		this.scene.add.tween({
			targets: bottomCard.container,
			x: start[0] - Space.cardHeight/2,
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween()/4,
			yoyo: true,
			repeat: 1,
			onStart: function (tween: Phaser.Tweens.Tween, targets, _)
			{
				bottomCard.show()
			},
			onComplete: function (tween, targets, _)
			{
				bottomCard.destroy()
			}
		})
	}

	private animateStatus(animation: Animation, owner: number, i: number): void {
		// TODO

		// scene.add.image(Space.windowWidth/2, Space.windowHeight/2, `icon-${animation.status}1`)
		// TODO
		return

		// TODO Some visual sparks or fruit thrown in the air?

		let obj
		switch (animation.status) {
			case Status.Inspire:
			if (owner === 0) {
				obj = this.view.ourHand['btnInspire'] // TODO Smell, fix typing
			}
			else {
				obj = this.view.theirHand['btnInspire']
			}
			break

			case Status.Nourish:
			if (owner === 0) {
				obj = this.view.ourHand['btnNourish']
			}
			else {
				obj = this.view.theirHand['btnNourish']
			}
			break
		}

		console.log(obj)

		this.scene.tweens.add({
			targets: obj.icon,
			scale: 2,
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween()/2,
			yoyo: true
		})
	}

	// Animate a card being emphasized in its place, such as showing that a Morning card is proccing
	private animateEmphasis(card: CardImage, i: number): void {
		// Animate card scaling up and disappearing
		this.scene.tweens.add({
			targets: card.container,
			scale: 3,
			alpha: 0,
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween(),
			onStart: function (tween: Phaser.Tweens.Tween, targets, _)
			{
				card.show()
			},
			onComplete: function (tween, targets, _)
			{
				card.destroy()
			}
		})
	}
}
