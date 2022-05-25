import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time, Style } from '../../settings/settings'
import Button from '../../lib/buttons/button'
import { AvatarSmall, ButtonInspire, ButtonNourish } from '../../lib/buttons/backed'
import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'

import { Status } from '../../lib/status'
import BaseScene from '../baseScene'
import { keywords } from "../../catalog/keywords"


export default class OurHandRegion extends Region {
	// Function called when elements in this region are interacted with
	callback: (i: number) =>  void
	displayCostCallback: (cost: number) => void

	// Effect showing that we have priority
	priorityHighlight: Phaser.GameObjects.Video

	txtDeckCount: Phaser.GameObjects.Text
	txtDiscardCount: Phaser.GameObjects.Text

	btnInspire: ButtonInspire
	btnNourish: ButtonNourish

	// Whether we have already clicked on a card to play it
	cardClicked: boolean

	// Avatar image
	avatar: AvatarSmall

	create (scene: BaseScene): OurHandRegion {
		let that = this
		this.scene = scene

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - Space.handHeight).setDepth(1)

		this.container.add(this.createBackground(scene))

		// Visual effect that highlights when we have priority
		this.priorityHighlight = this.createPriorityHighlight()
		this.container.add(this.priorityHighlight)

		// Create the status visuals
		this.createStatusDisplay()

		// Create our avatar
		this.avatar = this.createAvatar()
		
		// Create a visual divider
		let divide = scene.add.image(Space.windowWidth - 300 - Space.cardWidth/2, Space.handHeight/2, 'icon-Divide')

		// Deck and discard pile totals
		// TODO Font size as a part of a style
		const x = divide.x + 80
		this.txtDeckCount = scene.add.text(x, 35, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDeck = scene.add.image(x, this.txtDeckCount.y + 25, 'icon-Deck')

		this.txtDiscardCount = scene.add.text(x, 95, '', Style.basic).setOrigin(0.5).setFontSize(20)
		let iconDiscard = scene.add.image(x, this.txtDiscardCount.y + 25, 'icon-Discard')

		// Add each of these objects to container
		this.container.add([
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

		// Until we have mulliganed, hide the cards in our hand
		if (!state.mulligansComplete[0]) {
			this.hideHand()
			return
		}

		this.cardClicked = false

		let that = this

		// Statuses
		this.displayStatuses(state)
		
		// Add each of the cards in our hand
		let cardsInHand = []
		for (let i = 0; i < state.hand.length; i++) {
			let card = this.addCard(state.hand[i], CardLocation.ourHand(state, i, this.container))
			.setCost(state.costs[i])
			.moveToTopOnHover()

			const cost = state.costs[i]
			card.setOnHover(that.onCardHover(card, cost), that.onCardExit(card, cardsInHand, i))

			// Set whether card shows up as playable, and also whether we can click to play a card in this state
			if (!state.cardsPlayable[i]) {
				card.setPlayable(false)
				card.setOnClick(() => {
					that.scene.signalError("You don't have enough mana.")
				})
			}
			else if (state.priority === 0 && state.winner === null) {
				card.setOnClick(that.onCardClick(i, card, cardsInHand, state, isRecap))
			} else {
				card.setOnClick(() => {
					// TODO Signal errors in a variety of ways (Not enough mana, replay playing, etc)
					that.scene.signalError("It's not your turn.")
				})
			}

			cardsInHand.push(card)
			this.temp.push(card)
		}

		// Pile sizes
		this.txtDeckCount.setText(`${state.deck.length}`)
		this.txtDiscardCount.setText(`${state.discard[0].length}`)

		this.animate(state, cardsInHand, isRecap)
	}

	// Hide the cards in our hand, used when mulligan is visible
	hideHand(): void {
		this.deleteTemp()
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, Space.handHeight,
			Color.background, 1
			).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
		let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
		postFxPlugin['add'](background, {
			thickness: 1,
			outlineColor: Color.border,
		})

		return background
	}

	private createPriorityHighlight(): Phaser.GameObjects.Video {
		return this.scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)
		.setAlpha(0)
	}

	private createAvatar(): AvatarSmall {
		// TODO Custom avatar
		let btn = new AvatarSmall(this.container, 6, 6, 'Jules')
		btn.setOrigin(0)
		
		return btn
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

			// Hint shows status text
			that.scene.hint.showText(s)
		}

		let onExit = () => {
			that.scene.hint.hide()
		}

		return [onHover, onExit]
	}

	// Animate any cards ending in the hand
	private animate(state: ClientState, cards: CardImage[], isRecap: boolean): void {
		let scene = this.scene

		this.animatePriority(state, isRecap)
		
		let delay = 0
		for (let i = 0; i < state.animations[0].length; i++) {
			let animation = state.animations[0][i]
			if (animation.to === Zone.Hand) {
				let card = cards[animation.index]

				// Animate the card coming from given zone
				// Remember where to end, then move to starting position
				let x = card.container.x
				let y = card.container.y

				if (animation.from === Zone.Hand) {
					// This is the card having an effect in the player's hand
					this.animateEmphasis(card, delay)
				}
				else {
					// Set the starting position based on zone it's coming from
					let position
					switch (animation.from) {
						case Zone.Deck:
						position = CardLocation.ourDeck(this.container)
						break

						case Zone.Discard:
						position = CardLocation.ourDiscard(this.container)
						break

						case Zone.Story:
						position = CardLocation.story(state, isRecap, animation.index2, this.container, 0)
						break

						case Zone.Gone:
						position = CardLocation.gone(this.container)
						break
					}
					card.setPosition(position)

					// Hide the card until it starts animating
					card.hide()

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
							// TODO Different for create?
							scene.sound.play('draw')
						}
					})
				}
			}

			// Delay occurs for each animation even if not going to hand
			delay += Time.recapTween()
		}
	}

	// Animate us getting or losing priority
	private animatePriority(state: ClientState, isRecap: boolean): void {
		const targetAlpha = state.priority === 0 && !isRecap ? 1 : 0

		this.scene.tweens.add({
			targets: this.priorityHighlight,
			alpha: targetAlpha,
			duration: Time.recapTweenWithPause()
		})
	}

	// Return the function that runs when card with given index is clicked on
	private onCardClick(i: number, card: CardImage, hand: CardImage[], state: ClientState, isRecap: boolean): () => void {
		let that = this

		// The position these cards will move to if played
		const nextStoryPosition = CardLocation.story(state, isRecap, state.story.acts.length, this.container, 0)

		return function() {
			// If we have already played a card, do nothing when clicking on another
			if (that.cardClicked === false) {
				// Remember that we have clicked a card already
				that.cardClicked = true

				// Send this card to its place in the story
				that.scene.tweens.add({
					targets: card.container,
					x: nextStoryPosition[0],
					y: nextStoryPosition[1],
					duration: Time.recapTween(),
					ease: "Sine.easeInOut",
					// After brief delay, tell network, hide info, shift cards to fill its spot
					onStart: function () {setTimeout(function() {
						// Fill in the hole where the card was
						// For every card later than i, move to the right
						for (let j = i + 1; j < hand.length; j++) {
							let adjustedCard = hand[j]

							that.scene.tweens.add({
								targets: adjustedCard.container,
								// TODO Fix this to be in general (Space to move might be smaller if cards squished)
								x: CardLocation.ourHand(state, j - 1, that.container)[0],
								duration: Time.recapTween() - 10,
								ease: "Sine.easeInOut"
							})
						}

						// Trigger the callback function for this card
						that.callback(i)
					}, 10)}
				})
			}
		}
	}

	// Return the function that runs when given card is hovered
	private onCardHover(card: CardImage, cost: number): () => void {
		let that = this
		return () => {
			card.container.setY(Space.handHeight - Space.cardHeight/2)

			// Show the card's cost in the breath icon
			that.displayCostCallback(cost)
		}
	}

	// Return the function that runs when given card hover is exited
	private onCardExit(card: CardImage, cards: CardImage[], index: number): () => void {
		let that = this
		return () => {
			card.container.setY(Space.cardHeight/2)

			// Stop showing a positive card cost
			that.displayCostCallback(0)
		}
	}

	// Set the callback for when a card in this region is clicked on
	setCallback(f: (x: number) => void): Region {
		this.callback = f
		return this
	}

	// Set the callback for showing how much breath a card costs
	setDisplayCostCallback(f: (cost: number) => void): void {
		this.displayCostCallback = f
	}

	private displayStatuses(state: ClientState): void {
		// // Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.status.forEach(function(status, index, array) {
			amts[status]++
		})

		this.btnInspire.setVisible(amts[1] > 0)
		.setText(`${amts[1]}`)

		this.btnNourish.setVisible(amts[2] > 0)
		.setText(`${amts[2]}`)
	}
}