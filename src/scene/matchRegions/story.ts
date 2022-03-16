import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


// TODO
const middle = (Space.windowHeight)/2 - 150

export default class StoryRegion extends Region {
	create (scene: Phaser.Scene): StoryRegion {
		this.scene = scene

		// TODO 150 is the height for their hand, generalize this
		this.container = scene.add.container(100 + 140/2, 150)

		return this
	}

	displayState(state: ClientState): void {
		this.displayStateOrRecap(state, false)
	}

	displayStateOrRecap(state: ClientState, isRecap: boolean): void {
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

		this.animate(state, cards, isRecap)
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