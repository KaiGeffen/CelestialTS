import 'phaser'
import ClientState from '../../lib/clientState'
import BaseScene from '../baseScene'
import { Animation, Zone } from '../../lib/animation'
import CardLocation from './cardLocation'
import { CardImage } from '../../lib/cardImage'
import { Space, Time, Depth } from '../../settings/settings'
import { cardback } from '../../catalog/catalog'


export default class Animator {
	static animate(state: ClientState, scene: BaseScene) {
		// TODO Handle initial mulligan separately
		if (state.versionNumber === 0) {
			return
		}

		// TODO Delete container
		let container = scene.add.container().setDepth(Depth.aboveAll)

		for (let owner = 0; owner < 2; owner++) {
			for (let i = 0; i < state.animations[owner].length; i++) {
				let animation = state.animations[owner][i]

				// Gain a status
				if (animation.from === Zone.Status) {
					this.animateStatus(scene, animation, owner)
					continue
				}

				// Shuffle a player's deck
				if (animation.from === Zone.Shuffle) {
					this.animateShuffle(scene, owner, i, container)
					continue
				}

				// Transform a card TODO
				if (animation.to === Zone.Transform) {
					// The only occurence of this left is Transform > Story changing acts into Robots
					continue
				}

				let start = this.getStart(animation, state, container, owner)
				let end = this.getEnd(animation, state, container, owner)

				if (animation.card !== null) {
					let card = this.createCard(animation.card, start, container)

					if (animation.to !== animation.from) {
						// Show the card in motion between start and end
						this.animateCard(scene, card, end, i)
					}
					else {
						// Emphasize the card if it stayed in the same zone
						this.animateEmphasis(scene, card, i)
					}
				}
			}
		}	
	}

	private static getStart(animation: Animation, state, container, owner: number): [number, number] {
		switch (animation.from) {
			case Zone.Deck:
			if (owner === 0) {
				return CardLocation.ourDeck()
			}
			else {
				return CardLocation.theirDeck(container)
			}

			case Zone.Story:
			return CardLocation.story(state, false, animation.index, container, owner)

			case Zone.Gone:
			return CardLocation.gone(container)

			case Zone.Hand:
			if (owner === 0) {
				return CardLocation.ourHand(state, animation.index)
			}
			else {
				return CardLocation.theirHand(state, animation.index, container)
			}
			
			case Zone.Discard:
			if (owner === 0) {
				return CardLocation.ourDiscard(container)
			}
			else {
				return CardLocation.theirDiscard(container)
			}
		}

		return [300,300]
	}

	private static getEnd(animation: Animation, state, container, owner): [number, number] {
		switch (animation.to) {
			case Zone.Deck:
			if (owner === 0) {
				return CardLocation.ourDeck()
			}
			else {
				return CardLocation.theirDeck(container)
			}

			// TODO Clarify index 1 and 2, mostly 2 seems to be null
			case Zone.Story:
			return CardLocation.story(state, false, animation.index, container, owner)

			case Zone.Gone:
			return CardLocation.gone(container)

			case Zone.Hand:
			if (owner === 0) {
				return CardLocation.ourHand(state, animation.index)
			}
			else {
				return CardLocation.theirHand(state, animation.index, container)
			}

			case Zone.Discard:
			if (owner === 0) {
				return CardLocation.ourDiscard(container)
			}
			else {
				return CardLocation.theirDiscard(container)
			}
		}

		return [300,300]
	}

	private static createCard(card, start, container: Phaser.GameObjects.Container): CardImage {
		let cardImage = new CardImage(card, container, false)

		// Set its initial position and make it hidden until its tween plays
		cardImage.setPosition(start)
		cardImage.hide()

		return cardImage
	}

	private static animateCard(scene: Phaser.Scene, card: CardImage, end: [number, number], i: number) {
		// Animate moving x direction, becoming visible when animation starts
		scene.tweens.add({
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
				scene.sound.play('draw')
			},
			onComplete: function (tween, targets, _)
			{
				card.destroy()
			}
		})
	}

	// Animate the given player's deck shuffling
	private static animateShuffle(scene: Phaser.Scene, owner: number, i: number, container: Phaser.GameObjects.Container): void {
		let start
		if (owner === 0) {
			start = CardLocation.ourDeck()
		}
		else {
			start = CardLocation.theirDeck()
		}
		
		let topCard = this.createCard(cardback, start, container)
		let bottomCard = this.createCard(cardback, start, container)

		scene.add.tween({
			targets: topCard.container,
			x: start[0] + Space.cardHeight/2,
			delay: i * Time.recapTweenWithPause(),
			duration: Time.recapTween()/4,
			yoyo: true,
			repeat: 1,
			onStart: function (tween: Phaser.Tweens.Tween, targets, _)
			{
				topCard.show()
				scene.sound.play('shuffle')
			},
			onComplete: function (tween, targets, _)
			{
				topCard.destroy()
			}
		})

		scene.add.tween({
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

	private static animateStatus(scene: Phaser.Scene, animation: Animation, owner: number): void {
		// TODO

		// scene.add.image(Space.windowWidth/2, Space.windowHeight/2, `icon-${animation.status}1`)

	}

	// Animate a card being emphasized in its place, such as showing that a Morning card is proccing
	private static animateEmphasis(scene: Phaser.Scene, card: CardImage, i: number): void {
		// Animate card scaling up and disappearing
		scene.tweens.add({
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
