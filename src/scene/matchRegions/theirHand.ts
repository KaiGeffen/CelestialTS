import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class OurHandRegion extends Region {	
	// Effect showing that they have priority
	priorityHighlight: Phaser.GameObjects.Video

	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		this.scene = scene

		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, 0)

		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.background, 1
			).setOrigin(0)

		// Highlight visible when they have priority
		this.priorityHighlight = scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)

		let avatar = scene.add.image(10, 10, 'avatar-Jules').setOrigin(0)

		// Add each of these objects to container
		this.container.add([
			background,
			this.priorityHighlight,
			avatar,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		let hand = []
		for (let i = 0; i < state.opponentHandSize; i++) {
			const x = 300 + (140 + Space.pad) * i
			
			let card = this.addCard(cardback, [x, 50])

			hand.push(card)
			this.temp.push(card)
		}

		// TODO Statuses

		this.animate(state, hand)
	}

	// Animate any cards leaving the hand
	private animate(state: ClientState, hand: CardImage[]): void {
		this.animatePriority(state)

		this.animateCardsLeavingHand(state, hand)
		// Status
	}

	// Animate them getting or losing priority
	private animatePriority(state: ClientState): void {
		const targetAlpha = state.priority === 1 ? 1 : 0

		this.scene.tweens.add({
				targets: this.priorityHighlight,
				alpha: targetAlpha,
				duration: Time.recapTweenWithPause()
			})
	}

	private animateCardsLeavingHand(state:ClientState, hand: CardImage[]): void {
		let scene = this.scene
		
		let delay = 0
		for (let i = 0; i < state.animations[1].length; i++) {
			let animation = state.animations[1][i]
			if (animation.to === Zone.Hand) {
				let card = hand[animation.index]

				// Animate the card coming from given zone
				// Remember where to end, then move to starting position
				let x = card.container.x
				let y = card.container.y

				// TODO Based on animation.from
				card.setPosition([0, 300])
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
}