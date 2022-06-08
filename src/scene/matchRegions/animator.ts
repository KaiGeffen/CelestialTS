import 'phaser'
import ClientState from '../../lib/clientState'
import BaseScene from '../baseScene'
import { Zone } from '../../lib/animation'
import CardLocation from './cardLocation'
import { CardImage } from '../../lib/cardImage'
import { Time, Depth } from '../../settings/settings'
import { cardback } from '../../catalog/catalog'


export default class Animator {
	static animate(state: ClientState, scene: BaseScene) {
		// TODO Delete container
		let container = scene.add.container().setDepth(Depth.aboveAll)

		for (let owner = 0; owner < 2; owner++) {
			for (let i = 0; i < state.animations[owner].length; i++) {
				let animation = state.animations[owner][i]

				let start = this.getStart(animation, state, container, owner)
				let end = this.getEnd(animation, state, container, owner)

				if (animation.card !== null) {
					let card = this.createCard(animation.card, start, container)

					this.animateCard(scene, card, end, i)
				}
			}
		}	
	}

	private static getStart(animation, state, container, owner: number): [number, number] {
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
			console.log(animation)
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

		console.log(animation)

		return [300,300]
	}

	private static getEnd(animation, state, container, owner): [number, number] {
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

		console.log(animation)

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
}
