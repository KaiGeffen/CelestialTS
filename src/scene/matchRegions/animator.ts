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
		let myAnimations = animations[0]
		let theirAnimations = animations[1]

		myAnimations.forEach(animation => {
			let start: [number, number] = [0, 0]
			let end: [number, number] = [0, 0]

			switch (animation.from) {
				case Zone.Deck:
					start = CardLocation.ourDeck()
					break
			}
			switch (animation.from) {
				case Zone.Deck:
					end = CardLocation.ourHand(state, animation.index, container)
					break
			}

			console.log(animation)
			if (animation.card !== null) {
				let card = new CardImage(animation.card, container, false)
				card.setPosition(start)
				// card.hide()

				// Animate moving x direction, becoming visible when animation starts
				scene.tweens.add({
					targets: card.container,
					x: end[0],
					y: end[1],
					// delay: delay,
					duration: Time.recapTweenWithPause(),
					onStart: function (tween, targets, _)
					{
						card.show()
						// TODO Different for create?
						scene.sound.play('draw')
					}
				})	
			}
		})
	}
}
