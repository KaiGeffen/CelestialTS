import "phaser";
import { CardImage } from '../../lib/cardImage';
import ClientState from '../../lib/clientState';
import { Space, Style, Depth, Time, Flags } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';
import CardLocation from './cardLocation';
import Play from '../../lib/play'


// This is slightly wrong, because the top hand is smaller than this hand height
const middle = (Space.windowHeight)/2 - Space.handHeight

export default class StoryRegion extends Region {
	lastScores: [number, number]

	// Callback that plays when ith card in recap is clicked on
	callback: (i: number) => () => void

	create (scene: BaseScene): StoryRegion {
		this.scene = scene
		this.lastScores = [0, 0]

		this.container = scene.add.container(0, Space.handHeight)
		.setDepth(Depth.storyAtDay)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Set the correct depth based on day/night
		this.container.setDepth(isRecap ? Depth.storyAtNight : Depth.storyAtDay)

		// If this is a recap, add the already played cards greyed out
		let resolvedI = 0
		for (; isRecap && resolvedI < state.recap.playList.length; resolvedI++) {
			const play: Play = state.recap.playList[resolvedI]
			
			let card = this.addCard(play.card,
				CardLocation.story(state, isRecap, resolvedI, this.container, play.owner))
			.setResolved()
			.moveToTopOnHover()
			.setOnClick(this.callback(resolvedI))
			// .showController(play[1])

			this.temp.push(card)
		}

		let cards = []
		for (let i = 0; i < state.story.acts.length; i++) {
			const act = state.story.acts[i]

			let card = this.addCard(
				act.card,
				CardLocation.story(state, isRecap, resolvedI + i, this.container, act.owner)
				)
			.moveToTopOnHover()
			.showController(act.owner)

			// Only allow jumping around in the recap if we are playing a recap
			if (isRecap && !Flags.mobile) {
				card.setOnClick(this.callback(resolvedI + i))
			}

			cards.push(card)
			this.temp.push(card)
		}

		// Show changes in score
		if (isRecap) {
			this.displayScores(state, isRecap)
		}

		this.animate(state, cards, isRecap)

		this.cards = cards
	}

	// Set the callback for when an act in the story is clicked on
	setCallback(callback: (i: number) => () => void): void {
		this.callback = callback
	}

	// Display the current score totals and change in scores
	private displayScores(state: ClientState, isRecap: boolean): void {
		let index = state.recap.playList.length - 1
		let remainingActs = state.recap.stateList.length
		if (index >= 0 && remainingActs >= 0) {
			this.animateScoreGains(index, state.score, state, isRecap)
		}

		this.lastScores = state.score
	}

	// Animate each player gaining or losing points for the act at this index
	private animateScoreGains(index: number, scores: [number, number], state: ClientState, isRecap: boolean): void {
		
		// TODO The first arg (state) should have a variable if squishing is possible
		const loc = CardLocation.story(state, isRecap, index, this.container, undefined)

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
			Style.cardResolution)
			.setOrigin(0.5)
			// .setAlpha(0)

		this.container.add(txtGain)
		this.scene.add.tween({
  			targets: txtGain,
  			alpha: 1,
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
				CardLocation.theirHand(state, state.opponentHand.length + 1, this.container))
			
			// Animate moving x direction, appearing at start
			this.scene.tweens.add({
				targets: card.container,
				x: x,
				y: y,
				duration: Time.playCard(),
				onStart: function (tween, targets, _)
				{
					card.show()
					that.scene.playSound('play them')
				}
			})
		}
	}
}