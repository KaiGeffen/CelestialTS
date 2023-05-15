import "phaser"
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import { CardImage } from '../../lib/cardImage'
import ClientState from '../../lib/clientState'
import { Depth, Space, Style, Time } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


// The y distance card moves up when hovered
const HOVER_OFFSET = Space.cardHeight/2

export default class OurHandRegion extends Region {
	// Function called when elements in this region are interacted with
	callback: (i: number) =>  void
	displayCostCallback: (cost: number) => void

	// Effect showing that we have priority
	// priorityHighlight: Phaser.GameObjects.Video

	btnDeck: Button
	btnDiscard: Button

	btnInspire: Button
	btnNourish: Button
	btnSight: Button

	// Whether we have already clicked on a card to play it
	cardClicked: boolean

	// Index of the card from the last state that was being hovered, if any
	hoveredCard: number

	// Avatar image
	btnAvatar: Button

	create (scene: BaseScene, avatarId: number): OurHandRegion {
		let that = this
		this.scene = scene

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - Space.handHeight).setDepth(Depth.ourHand)

		this.container.add(this.createBackground(scene))

		// Visual effect that highlights when we have priority
		// this.priorityHighlight = this.createPriorityHighlight()
		// .setVisible(false)
		// this.container.add(this.priorityHighlight)

		// Create the status visuals
		this.createStatusDisplay()

		// Create our avatar
		this.btnAvatar = this.createAvatar(avatarId)
		
		// Create a visual divider
		// let divide = scene.add.image(Space.windowWidth - 300 - Space.cardWidth/2, Space.handHeight/2, 'icon-Divide')

		// Deck and discard pile totals
		// TODO Font size as a part of a style
		const x = Space.windowWidth - 294
		this.btnDeck = new Buttons.Stacks.Deck(this.container, x, Space.handHeight * 1/4, 0)
		this.btnDiscard = new Buttons.Stacks.Discard(this.container, x, Space.handHeight * 3/4, 0)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Pile sizes
		this.btnDeck.setText(`${state.deck.length}`)
		this.btnDiscard.setText(`${state.discard[0].length}`)

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
		this.cards = []
		for (let i = 0; i < state.hand.length; i++) {
			let card = this.addCard(state.hand[i], CardLocation.ourHand(state, i, this.container))
			.setCost(state.costs[i])
			.moveToTopOnHover()

			const cost = state.costs[i]
			card.setOnHover(that.onCardHover(card, cost, i), that.onCardExit(card, this.cards, i))

			// Set whether the card shows as playable, and set its onclick
			card.setPlayable(state.cardsPlayable[i])
			this.setCardOnClick(card, state, isRecap, i)

			this.cards.push(card)
			this.temp.push(card)
		}

		// Hover whichever card was being hovered last
		if (this.hoveredCard !== undefined) {
			let card = this.cards[this.hoveredCard]

			if (card !== undefined) {

				// Check that the mouse is still over the card's x
				const pointer = this.scene.input.activePointer
				const pointerOverCard = card.image.getBounds().contains(pointer.x, pointer.y + HOVER_OFFSET)

				if (pointerOverCard) {
					card.image.emit('pointerover')					
				}
			}
		}

		// Show priority / not
		// this.animatePriority(state, isRecap)
	}

	setCallbacks(fDeck: () => void, fDiscard: () => void, fEmote: () => void): void {
		this.btnDeck.setOnClick(fDeck)
		this.btnDiscard.setOnClick(fDiscard)
		this.btnAvatar.setOnClick(fEmote, false, false)
	}

	// Set the callback / error message for when card is clicked
	private setCardOnClick(card: CardImage, state: ClientState, isRecap: boolean, i: number) {
		let msg
		if (state.winner !== null) {
			msg = "The game is over."
		}
		else if (isRecap) {
			msg = "The story is resolving."
		}
		else if (state.priority === 1) {
			msg = "It's not your turn."
		}
		else if (this.cardClicked) {
			msg = "You've already selected a card."
		}
		else if (!state.cardsPlayable[i]) {
			msg = "You don't have enough breath to play that card."
		}

		// Show error message if there is one, otherwise play the card
		if (msg !== undefined) {
			card.setOnClick(() => {
				this.scene.signalError(msg)
			})
		}
		else {
			card.setOnClick(this.onCardClick(i, card, this.cards, state, isRecap))
		}

		// Set whether card shows up as playable, and also whether we can click to play a card in this state
		if (!state.cardsPlayable[i]) {
			card.setPlayable(false)
		}
	}

	// Hide the cards in our hand, used when mulligan is visible
	hideHand(): void {
		this.deleteTemp()
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		let renderedBackground = scene.add.image(Space.windowWidth, -50, 'icon-Bottom')
		.setOrigin(1, 0)
		.setInteractive()

		return renderedBackground
	}

	// private createPriorityHighlight(): Phaser.GameObjects.Video {
	// 	console.log(this.scene.add.video(Space.windowWidth/2,
	// 		Space.windowHeight/2,
	// 		'priorityHighlight')
	// 	.play(true))

	// 	this.scene.add.video(0, 0, 'priorityHighlight').play(true).setDepth(100)

	// 	return this.scene.add.video(Space.windowWidth - 341,
	// 		-12,
	// 		'priorityHighlight')
	// 	.setOrigin(1, 0)
	// 	.play(true)
	// }

	private createAvatar(avatarId: number): Button {
		let btn = new Buttons.Avatar(this.container, 21, 11, avatarId)
		.setOrigin(0)
		.setQuality({emotive: true})

		// Sight
		this.btnSight = new Buttons.Keywords.Sight(this.container,
			btn.icon.x + Space.avatarSize/2,
			btn.icon.y + Space.avatarSize - Space.padSmall)
		.setOrigin(0.5, 1)
		.setVisible(false)
		
		return btn
	}

	private createStatusDisplay(): void {
		let x = 21 + Space.avatarSize - 10

		// Inspire
		let y = 11
		this.btnInspire = new Buttons.Keywords.Inspire(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)

		// Nourish
		y += Space.avatarSize/2
		this.btnNourish = new Buttons.Keywords.Nourish(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
	}

	// Animate us getting or losing priority
	// private animatePriority(state: ClientState, isRecap: boolean): void {
	// 	const targetAlpha = state.priority === 0 && !isRecap ? 1 : 0

	// 	this.scene.tweens.add({
	// 		targets: this.priorityHighlight,
	// 		alpha: targetAlpha,
	// 		duration: Time.recapTweenWithPause()
	// 	})
	// }

	// Return the function that runs when card with given index is clicked on
	private onCardClick(i: number, card: CardImage, hand: CardImage[], state: ClientState, isRecap: boolean): () => void {
		let that = this

		// The position these cards will move to if played
		const nextStoryPosition = CardLocation.story(state, isRecap, state.story.acts.length, this.container, 0)

		return function() {
			// If the match is paused, do nothing
			if (that.scene['paused']) {
				return
			}

			// If we have already played a card, do nothing when clicking on another
			if (that.cardClicked) {
				return
			}

			// Remember that we have clicked a card already
			that.cardClicked = true

			// Revert the order of the cards in hand to not center this card
			card.revertCenteringInHand()

			// Remove this cards hover/exit behavior so it doesn't jump back to hand y
			card.removeOnHover()

			// Hide any hints
			that.scene['hint'].hide()

			// Send this card to its place in the story
			that.scene.tweens.add({
				targets: card.container,
				x: nextStoryPosition[0],
				y: nextStoryPosition[1],
				duration: Time.playCard(),
				ease: "Sine.easeInOut",
				// After brief delay, tell network, hide info, shift cards to fill its spot
				onStart: function () {setTimeout(function() {
					// Hide any hint that might be showing
					that.scene['hint'].hide()

					// Fill in the hole where the card was
					// For every card later than i, move to the right
					for (let j = i + 1; j < hand.length; j++) {
						let adjustedCard = hand[j]

						that.scene.tweens.add({
							targets: adjustedCard.container,
							// TODO Fix this to be in general (Space to move might be smaller if cards squished)
							x: CardLocation.ourHand(state, j - 1, that.container)[0],
							duration: Time.playCard() - 10,
							ease: "Sine.easeInOut"
						})
					}

					// Trigger the callback function for this card
					that.callback(i)
				}, 10)},
				// Play 'play' sound, remember which card is being hovered
				onComplete: () => {
					this.scene.playSound('play')

					if (that.hoveredCard !== undefined) {
						// If the played card was hovered, forget that
						if (that.hoveredCard === i) {
							that.hoveredCard = undefined
						}
						// If a later card was hovered, adjust down to fill this card leaving hand
						else if (that.hoveredCard > i) {
							that.hoveredCard -= 1
						}
					}
				},
			})
		}
	}

	// Return the function that runs when given card is hovered
	private onCardHover(card: CardImage, cost: number, index: number): () => void {
		let that = this
		return () => {
			card.container.setY(Space.handHeight - HOVER_OFFSET)

			// Show the card's cost in the breath icon
			that.displayCostCallback(cost)

			// Remember that this card is being hovered
			that.hoveredCard = index
		}
	}

	// Return the function that runs when given card hover is exited
	private onCardExit(card: CardImage, cards: CardImage[], index: number): () => void {
		let that = this
		return () => {
			card.container.setY(HOVER_OFFSET)

			// Stop showing a positive card cost
			that.displayCostCallback(0)

			// Remember that no card is being hovered now
			that.hoveredCard = undefined
		}
	}

	// Set the callback for when a card in this region is clicked on
	setCardClickCallback(f: (x: number) => void): Region {
		this.callback = f
		return this
	}

	// Set the callback for showing how much breath a card costs
	setDisplayCostCallback(f: (cost: number) => void): void {
		this.displayCostCallback = f
	}

	private displayStatuses(state: ClientState): void {
		// Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.status.forEach(function(status, index, array) {
			amts[status]++
		})

		const amtInspire = amts[1]
		const amtNourish = amts[2] - amts[3]

		this.btnInspire.setVisible(amtInspire !== 0)
		.setText(`${amtInspire}`)

		this.btnNourish.setVisible(amtNourish !== 0)
		.setText(`${amtNourish}`)

		this.btnSight.setVisible(state.vision !== 0)
		.setText(`${state.vision}`)
	}

	// TUTORIAL FUNCTIONALITY
	hideStacks(): Region {
		this.btnDeck.setVisible(false)
		this.btnDiscard.setVisible(false)

		return this
	}
}