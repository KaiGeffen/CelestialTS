import "phaser"

import Region from './baseRegion'

import { Space, Color, Time, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


// TODO
const middle = (Space.windowHeight)/2 - 150

export default class StoryRegion extends Region {
	txtScores: Phaser.GameObjects.Text

	lastScores: [number, number]

	create (scene: Phaser.Scene): StoryRegion {
		this.scene = scene
		this.lastScores = [0, 0]

		// TODO 150 is the height for their hand, generalize this
		this.container = scene.add.container(100 + 140/2, 150)

		this.txtScores = scene.add.text(
			Space.windowWidth - 300, middle, '', Style.announcement
			).setOrigin(1, 0.5)
		this.container.add(this.txtScores)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

		// If this is a recap, add the already played cards greyed out
		let resolvedI = 0
		for (; isRecap && resolvedI < state.recap.playList.length; resolvedI++) {
			const play = state.recap.playList[resolvedI]
			
			const x = 90 * resolvedI
			const y = play[1] === 0 ? middle + 80 : middle - 80

			let card = this.addCard(play[0], [x, y]).setTransparent(true)

			this.temp.push(card)
		}

		let cards = []
		for (let i = 0; i < state.story.acts.length; i++) {
			const x = (90) * (i + resolvedI)

			const act = state.story.acts[i]

			const y = act.owner === 0 ? middle + 80 : middle - 80

			let card = this.addCard(act.card, [x, y])
			// TODO Add a callback to jump around in recap

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
		const x = 90 * index



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
			x, middle,
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

			// TODO Generalize to 1 past the last card in their hand
			card.setPosition([
				300 + (140 + Space.pad) * state.opponentHandSize - 170, // 170 from above
				-100
				])

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