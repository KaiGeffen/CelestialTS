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


export default class TheirHandRegion extends Region {	
	// Effect showing that they have priority
	priorityHighlight: Phaser.GameObjects.Video

	txtWins: Phaser.GameObjects.Text

	create (scene: Phaser.Scene): TheirHandRegion {
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

		let divide = scene.add.image(Space.windowWidth - 300 - Space.cardWidth/2, height/2, 'icon-Divide')

		// Wins
		const winsIcon = scene.add.image(divide.x + 30, height/2, 'icon-Wins').setOrigin(0, 0.5)
		let txtWinsReminder = scene.add.text(winsIcon.x + winsIcon.width + Space.pad, height/2 - 13, 'Wins:', Style.small).setOrigin(0, 0.5)
		this.txtWins = scene.add.text(txtWinsReminder.x, height/2 + 7, '', Style.basic).setOrigin(0, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			this.priorityHighlight,
			avatar,
			divide,
			winsIcon,
			txtWinsReminder,
			this.txtWins,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		let hand = []
		for (let i = 0; i < state.opponentHandSize; i++) {
			let card = this.addCard(cardback, CardLocation.theirHand(state, i, this.container))

			hand.push(card)
			this.temp.push(card)
		}

		// Statuses
		this.displayStatuses(state)

		// Wins
		this.txtWins.setText(`${state.wins[1]}`)

		this.animate(state, hand, isRecap)
	}

	// Animate any cards leaving the hand
	private animate(state: ClientState, hand: CardImage[], isRecap: boolean): void {
		this.animatePriority(state, isRecap)

		this.animateCardsLeavingHand(state, hand)
		// Status
	}

	// Animate them getting or losing priority
	private animatePriority(state: ClientState, isRecap: boolean): void {
		const targetAlpha = state.priority === 1 && !isRecap ? 1 : 0

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

	private displayStatuses(state: ClientState): void {
		// Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.opponentStatus.forEach(function(status, index, array) {
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