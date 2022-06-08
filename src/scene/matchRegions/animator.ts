import 'phaser'
import ClientState from '../../lib/clientState'
import BaseScene from '../baseScene'
import { Zone } from '../../lib/animation'
import CardLocation from './cardLocation'
import { CardImage } from '../../lib/cardImage'
import { Time, Depth } from '../../settings/settings'


export default class Animator {
	static animate(state: ClientState, scene: BaseScene) {
		// TODO Delete container
		let container = scene.add.container().setDepth(Depth.aboveAll)

		let animations = state.animations

		for (let owner = 0; owner < 2; owner++) {
			for (let i = 0; i < animations[owner].length; i++) {
				let animation = animations[owner][i]

				let start = this.getStart(animation, state, container, owner)
				let end = this.getEnd(animation, state, container, owner)

				if (animation.card !== null) {
					let card = new CardImage(animation.card, container, false)
					card.setPosition(start)
					card.hide()

					// Animate moving x direction, becoming visible when animation starts
					scene.tweens.add({
						targets: card.container,
						x: end[0],
						y: end[1],
						delay: i * Time.recapTweenWithPause(),
						duration: Time.recapTween(),
						onStart: function (tween, targets, _)
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
}
