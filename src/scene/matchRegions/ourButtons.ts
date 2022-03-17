import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class OurHandRegion extends Region {
	btnRecap: Button
	btnPass: Button

	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		this.scene = scene
		const height = 150
		const width = 230

		this.container = scene.add.container(Space.windowWidth - width, Space.windowHeight - height).setDepth(2)

		// Add background rectangle
		const background = this.createBackground(scene)

		// Recap button
		this.btnRecap = new Button(scene,
			width/2 + 15,
			height / 3 + 20/2,
			'Recap'
			).setOrigin(0.5)

		// Pass button
		this.btnPass = new Button(scene,
			width/2 + 15,
			height * 2 / 3 + 20/2,
			'Pass'
			).setOrigin(0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			this.btnRecap,
			this.btnPass,
			])

		return this
	}

	displayState(state: ClientState): void {
		this.deleteTemp()

		let that = this

		// TODO
		const nextStoryPosition: [number, number] = [
		170 + 90 * state.story.acts.length,
		-(Space.windowHeight/2 - 150 - 200/2 + 20)
		]

		// Go in reverse order so that cards to the right are animated
		// filling in the hole left when card is played
		let cardsInHand = []
		for (let i = 0; i < state.hand.length; i++) {
			const x = 300 + (140 + Space.pad) * i

			let card = this.addCard(state.hand[i], [x, 200/2])
			card.setCost(state.costs[i])
			card.setOnHover(that.onCardHover(card), that.onCardExit(card))

			if (state.cardsPlayable[i]) {
				card.setOnClick(that.onCardClick(i, card, cardsInHand, nextStoryPosition))
			}
			else {
				card.setPlayable(false)
			}

			cardsInHand.push(card)
			this.temp.push(card)
		}

		// TODO Statuses

		this.animate(state, cardsInHand)
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Polygon {
		const points = '0 150 30 0 230 0 230 150'
		let background = scene.add.polygon(0, 0, points, Color.background, 1).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
        let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
        postFxPlugin.add(background, {
        	thickness: 1,
        	outlineColor: Color.border,
        })

        return background
	}

	// Set the callback for when the recap button is pressed
	setRecapCallback(f: () => void): void {
		this.btnRecap.setOnClick(f)
	}

	// Set the callback for when the pass button is pressed
	setPassCallback(f: () => void): void {
		this.btnPass.setOnClick(f)
	}
}