import "phaser"

import Region from './baseRegion'

import { Space, Color } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


export default class OurHandRegion extends Region {
	create (scene: Phaser.Scene): OurHandRegion {
		const height = 150

		// Avatar, status, hand, recap, pass buttons

		this.container = scene.add.container(0, Space.windowHeight - height)

		// Make a container
		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			Space.windowWidth, height,
			Color.menuBackground, 1
			).setOrigin(0)

		let avatar = scene.add.image(Space.pad, Space.pad, 'avatar-Jules').setOrigin(0)

		// Recap button
		let btnRecap = new Button(scene,
			Space.windowWidth - Space.pad,
			height / 3,
			'Recap'
			).setOrigin(1, 0.5)

		// Pass button
		let btnPass = new Button(scene,
			Space.windowWidth - Space.pad,
			height * 2 / 3,
			'Pass'
			).setOrigin(1, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			avatar,
			btnRecap,
			btnPass,
			])

		// TEMP
		let cardImage = new CardImage(cardback, this.container)
		cardImage.setPosition([400, 110])
		new CardImage(cardback, this.container).setPosition([500, 100 - (200 - height)])
		new CardImage(cardback, this.container).setPosition([600, 110])
		new CardImage(cardback, this.container).setPosition([700, 110])
		new CardImage(cardback, this.container).setPosition([800, 110])
		new CardImage(cardback, this.container).setPosition([900, 110])

		return this
	}

	displayState(state: ClientState): void {
		for (let i = 0; i < state.hand.length; i++) {
			console.log(state.hand[i])
			const x = 300 + 100 * i
			this.addCard(state.hand[i], [x, 0])
		}


		// Remove temporary objects
		//
		// Create each card in client's hand. New cards should be animated to show that they were drawn
		// let myHand: CardImage[] = []
		// for (var i = 0; i < state.hand.length; i++) {
		// 	let cardImage = this.addCard(state.hand[i], i, this.handContainer)

		// 	// Set the cost of the card, which might differ from its default value
		// 	cardImage.setCost(state.costs[i])

		// 	if (!state.cardsPlayable[i]) {
		// 		cardImage.setPlayable(false)
		// 	}

		// 	myHand.push(cardImage)
		// }
		// // Add the callbacks for clicking each card, which animate later cards
		// for (var i = 0; i < state.hand.length; i++) {
		// 	// Play the card if it's clicked on (Even if unplayable, will signal error)
		// 	myHand[i].image.on('pointerdown',
		// 		this.clickCard(i, myHand[i], state, [...myHand]),
		// 		this)
		// }

		// // Add each card in opponent's hand
		// let theirHand: CardImage[] = []
		// for (var i = 0; i < state.opponentHandSize; i++) {
		// 	theirHand.push(this.addCard(cardback, i, this.opponentHandContainer))
		// }

		// let that = this
		// function animateHand(cards: CardImage[], player: number) {
		// 	// TODO This isn't necessary since index is a part of animation
		// 	// Go through the animation list backwards, setting longest delay on rightmost drawn cards
		// 	for (i = state.animations[player].length - 1; i >= 0; i--) {
		// 		let delay = i * Time.recapTween()

		// 		let animation: Animation = state.animations[player][i]
		// 		if (animation.to === Zone.Hand) {
		// 			let card = cards[animation.index]

		// 			let x, y
		// 			switch(animation.from) {
		// 				case Zone.Discard:
		// 					// Move in towards center of board
		// 					y = (player === 0) ? card.container.y - Space.cardSize*2 : card.container.y + Space.cardSize*2
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						y: y,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause()/2,
		// 						yoyo: true
		// 					})

		// 					// Remember where to end, then move to starting position
		// 					x = card.container.x
		// 					card.setPosition([Space.stackX + Space.cardSize + Space.pad, card.container.y])
		// 					card.hide()

		// 					// Animate moving x direction, appearing at start
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						x: x,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause(),
		// 						onStart: function (tween, targets, _)
		// 						{
		// 							card.show()
		// 							that.sound.play('draw')
		// 						}
		// 					})
		// 					break
							
		// 				case Zone.Deck:
		// 					// Remember where to end, then move to starting position
		// 					x = card.container.x
		// 					card.setPosition([Space.stackX, card.container.y])
		// 					card.hide()

		// 					// Animate moving x direction, appearing at start
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						x: x,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause(),
		// 						onStart: function (tween, targets, _)
		// 						{
		// 							card.show()
		// 							that.sound.play('draw')
		// 						}
		// 					})
		// 					break
						
		// 				case Zone.Gone:
		// 					// Animate moving y direciton
		// 					y = card.container.y
		// 					card.setPosition([card.container.x, Space.windowHeight/2])
		// 					card.hide()

		// 					// Animate moving x direction, appearing at start
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						y: y,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause(),
		// 						onStart: function (tween, targets, _)
		// 						{
		// 							card.show()
		// 						}
		// 					})
							
		// 					// If card is being created, fade it in
		// 					card.container.setAlpha(0)
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						alpha: 1,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause()
		// 					})
		// 					break

		// 				case Zone.Story:
		// 					y = card.container.y
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						y: y,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause()
		// 					})
		// 					x = card.container.x
		// 					// Animate moving x direction, appearing at start
		// 					that.tweens.add({
		// 						targets: card.container,
		// 						x: x,
		// 						delay: delay,
		// 						duration: Time.recapTweenWithPause(),
		// 						onStart: function (tween, targets, _)
		// 						{
		// 							card.show()
		// 							// TODO Add a bounce sound for cards returning from story to hand
		// 							that.sound.play('draw')
		// 						}
		// 					})

		// 					// Where to end is established, move start location
		// 					// TODO This always pops it off the end, which works now but not in general
		// 					let storyIndex = animation.index2
		// 					card.setPosition(that.getCardPosition(storyIndex, that.storyContainer, player))
		// 					card.hide()
							
		// 					break
		// 			}
		// 		}
		// 	}
		// }

		// animateHand(myHand, 0)
		// animateHand(theirHand, 1)

		// // NOTE This is for the mulligan animation at the start of the match
		// this.myHand = myHand
	}
}