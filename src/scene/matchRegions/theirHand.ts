import "phaser"
import { cardback } from '../../catalog/catalog'
import { keywords } from "../../catalog/keywords"
import { Zone } from '../../lib/animation'
import { AvatarSmall, ButtonInspire, ButtonNourish } from '../../lib/buttons/backed'
import Button from '../../lib/buttons/button'
import { CardImage } from '../../lib/cardImage'
import ClientState from '../../lib/clientState'
import { Status } from '../../lib/status'
import { Color, Space, Style, Time } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


export default class TheirHandRegion extends Region {	
	// Effect showing that they have priority
	priorityHighlight: Phaser.GameObjects.Video

	txtDeckCount: Phaser.GameObjects.Text
	txtDiscardCount: Phaser.GameObjects.Text

	btnInspire: ButtonInspire
	btnNourish: ButtonNourish
	txtStatusExplanation: Phaser.GameObjects.Text

	// Avatar image
	avatar: AvatarSmall

	create (scene: BaseScene): TheirHandRegion {
		let that = this
		this.scene = scene

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, 0).setDepth(1)

		// Add background rectangle
		let background = this.createBackground(scene)
		this.container.add(background)
		
		// Highlight visible when they have priority
		this.priorityHighlight = scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)
		.setVisible(false)

		// Create the status visuals
		this.createStatusDisplay()

		// Create our avatar
		this.avatar = this.createAvatar()

		let divide = scene.add.image(Space.windowWidth - 300 - Space.cardWidth/2, Space.handHeight/2, 'icon-Divide')

		// TODO Font size as a part of a style
		const x = divide.x + 80
		this.txtDeckCount = scene.add.text(x, 35, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDeck = scene.add.image(x, this.txtDeckCount.y + 25, 'icon-Deck')

		this.txtDiscardCount = scene.add.text(x, 95, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDiscard = scene.add.image(x, this.txtDiscardCount.y + 25, 'icon-Discard')

		// Add each of these objects to container
		this.container.add([
			this.priorityHighlight,
			divide,
			this.txtDeckCount,
			iconDeck,
			this.txtDiscardCount,
			iconDiscard,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// Statuses
		this.displayStatuses(state)

		let hand = []
		for (let i = 0; i < state.opponentHandSize; i++) {
			let card = this.addCard(cardback, CardLocation.theirHand(state, i, this.container))
			.moveToTopOnHover()

			hand.push(card)
			this.temp.push(card)
		}

		// Pile sizes
		this.txtDeckCount.setText(`${state.opponentDeckSize}`)
		this.txtDiscardCount.setText(`${state.discard[1].length}`)

		this.animate(state, hand, isRecap)
	}

	// GENERALIZE 280, 250
	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		const points = `0 0 ${Space.windowWidth - 180} 0 ${Space.windowWidth - 230} 150 0 150`
		let background = scene.add.polygon(0, 0, points, Color.background, 1).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
		let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
		postFxPlugin['add'](background, {
			thickness: 1,
			outlineColor: Color.border,
		})

		return background
	}

	private createAvatar(): AvatarSmall {
		// TODO Custom avatar
		return new AvatarSmall(this.container, 6, 6, '', 'Jules').setOrigin(0)
	}

	private createStatusDisplay(): void {
		// TODO 6
		let x = 6 + Space.avatarSize - 10

		// Inspire
		let y = 6
		this.btnInspire = new ButtonInspire(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
		this.btnInspire.setOnHover(...this.onHoverStatus('Inspired', this.btnInspire))

		// Nourish
		y += Space.avatarSize/2
		this.btnNourish = new ButtonNourish(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
		this.btnNourish.setOnHover(...this.onHoverStatus('Nourish', this.btnNourish))

		this.txtStatusExplanation = this.scene.add.text(Space.cardWidth, Space.handHeight, '', Style.basic)
		.setOrigin(0)
	}

	private onHoverStatus(status: string, btn: Button): [() => void, () => void] {
		let that = this
		let keyword = keywords.find((value) => {
			return value.key === status
		})

		let onHover = () => {
			let s = keyword.text

			// Get the value from the given status button
			s = s.split(/\bX\b/).join(btn.getText())
			s = s.replace('you', 'they')
			
			that.txtStatusExplanation.setText(s)
		}

		let onExit = () => {
			that.txtStatusExplanation.setText('')
		}

		return [onHover, onExit]
	}

	// Animate any cards leaving the hand
	private animate(state: ClientState, hand: CardImage[], isRecap: boolean): void {
		this.animatePriority(state, isRecap)

		this.animateCardsLeavingHand(state, isRecap, hand)
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

	private animateCardsLeavingHand(state:ClientState, isRecap: boolean, hand: CardImage[]): void {
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

				if (animation.from === Zone.Hand) {
					// This is the card having an effect in the player's hand
					this.animateEmphasis(animation.card, [x,y], delay)
				}
				else {
					// Set the starting position based on zone it's coming from
					let position
					switch (animation.from) {
						case Zone.Deck:
						position = CardLocation.theirDeck(this.container)
						break

						case Zone.Discard:
						position = CardLocation.theirDiscard(this.container)
						break

						case Zone.Story:
						position = CardLocation.story(state, isRecap, animation.index2, this.container, 1)
						break

						case Zone.Gone:
						position = CardLocation.gone(this.container)
						break
					}
					card.setPosition(position)

					// Hide the card until it starts animating
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
						},
					})
				}
			}

			// Delay occurs for each animation even if not going to hand
			delay += Time.recapTween()
		}
	}

	private displayStatuses(state: ClientState): void {
		// // Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.opponentStatus.forEach(function(status, index, array) {
			amts[status]++
		})

		this.btnInspire.setVisible(amts[1] > 0)
		.setText(`${amts[1]}`)

		this.btnNourish.setVisible(amts[2] > 0)
		.setText(`${amts[2]}`)
	}
}