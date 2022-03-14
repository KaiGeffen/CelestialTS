import "phaser"

import Region from './baseRegion'

import { Space, Color, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


export default class ScoreRegion extends Region {
	mana: Phaser.GameObjects.Text

	create (scene: Phaser.Scene): ScoreRegion {
		const width = 240
		const height = 120
		// TODO Our hand height = 150
		
		this.container = scene.add.container(Space.windowWidth - width,
			Space.windowHeight - 150 - height)

		// Add background rectangle
		let background = scene.add.rectangle(
			0, 0,
			width, height,
			Color.background, 1
			).setOrigin(0)

		this.mana = scene.add.text(Space.pad, Space.pad, '', Style.basic).setOrigin(0)

		// Add each of these objects to container
		this.container.add([
			background,
			this.mana,

			])

		return this
	}

	displayState(state: ClientState): void {
		const s = `Mana: ${state.mana}/${state.maxMana[0]}\nWins: ${state.wins[0]} to ${state.wins[1]}`
		this.mana.setText(s)

		// Mana, wins
	}
}