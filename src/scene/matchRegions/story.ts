import "phaser"

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


const middle = (Space.windowHeight)/2 - Space.handHeight

export default class StoryRegion extends Region {
	txtScores: Phaser.GameObjects.Text

	lastScores: [number, number]

	// Callback that plays when ith card in recap is clicked on
	callback: (i: number) => () => void

	create (scene: Phaser.Scene): StoryRegion {
		this.scene = scene
		this.lastScores = [0, 0]

		this.container = scene.add.container(100 + 140/2, Space.handHeight)

		this.txtScores = scene.add.text(
			Space.windowWidth - 300, middle, '', Style.announcement
			).setOrigin(1, 0.5)
		
		this.container.add([
			this.txtScores,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// If this is a recap, add the already played cards greyed out
		let resolvedI = 0
		for (; isRecap && resolvedI < state.recap.playList.length; resolvedI++) {
			const play = state.recap.playList[resolvedI]
			
			let card = this.addCard(play[0],
				CardLocation.story(state, resolvedI, this.container, play[1]))
			.setTransparent(true)
			.moveToTopOnHover()
			.setOnClick(that.callback(resolvedI))

			this.temp.push(card)
		}

		let cards = []
		for (let i = 0; i < state.story.acts.length; i++) {
			const act = state.story.acts[i]

			let card = this.addCard(
				act.card,
				CardLocation.story(state, resolvedI + i, this.container, act.owner)
				)
			.moveToTopOnHover()

			// Only allow jumping around in the recap if we are playing a recap
			if (isRecap) {
				card.setOnClick(that.callback(i))
			}

			cards.push(card)
			this.temp.push(card)
		}

		// Scores
		if (isRecap) {
			this.displayScores(state)
		}
		else {
			this.txtScores.setText('')
		}

		this.animate(state, cards, isRecap)
	}

	// Set the callback for when an act in the story is clicked on
	setCallback(callback: (i: number) => () => void): void {
		this.callback = callback
	}

	// Display the current score totals and change in scores
	private displayScores(state: ClientState): void {
		let index = state.recap.playList.length - 1
		let remainingActs = state.recap.stateList.length
		if (index >= 0 && remainingActs >= 0) {
			this.animateScoreGains(index, state.score)
		}

		// Display current total
		this.txtScores.setText(`${state.score[1]}\n\n${state.score[0]}`)
		this.lastScores = state.score
	}

	// Animate each player gaining or losing points for the act at this index
	private animateScoreGains(index: number, scores: [number, number]): void {
		
		// TODO The first arg (state) should have a variable if squishing is possible
		const loc = CardLocation.story(undefined, index, this.container, undefined)

		// Form the string for the gain of the given player
		let that = this
  		function getGain(i: number): string {
  			let amt = scores[i] - that.lastScores[i]
  			if (amt < 0) {
  				return amt.toString()
  			} else if (amt === 0) {
  				return ''
  			} else {
  				return `+${amt}`
  			}
  		}
		const txtGain = this.scene.add.text(
			...loc,
			`${getGain(1)}\n\n${getGain(0)}`,
			Style.announcement)
			.setOrigin(0.5)

		this.container.add(txtGain)
		this.scene.add.tween({
  			targets: txtGain,
  			scale: 1.5,
  			duration: Time.recapTween(),
  			ease: "Sine.easeInOut",
  			yoyo: true,
  			onComplete: 
	  			function (tween, targets, _)
	  			{
	  				txtGain.destroy()
	  			}
  				})
	}

	private animate(state: ClientState, cards: CardImage[], isRecap: boolean): void {
		let that = this

		// If the last card was just played by the opponent,
		// animate it from their hand
		if (state.story.acts.length === 0) {
			return
		}

		const lastAct = state.story.acts[state.story.acts.length - 1]
		const lastCardTheirs = lastAct.owner === 1
		const noPasses = state.passes === 0

		if (lastCardTheirs && noPasses && !isRecap) {
			// Animate the last card moving from their hand
			const card = cards[cards.length - 1]

			const x = card.container.x
			const y = card.container.y

			card.setPosition(
				CardLocation.theirHand(state, state.opponentHandSize + 1, this.container))
			
			// Animate moving x direction, appearing at start
			this.scene.tweens.add({
				targets: card.container,
				x: x,
				y: y,
				duration: Time.recapTweenWithPause(),
				onStart: function (tween, targets, _)
				{
					card.show()
					that.scene.sound.play('play')
				}
			})
		}
	}
}