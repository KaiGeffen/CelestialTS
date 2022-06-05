import "phaser"

import Region from './baseRegion'

import { Space, Color, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'


export default class TheirScoreRegion extends Region {
	txtWins: Phaser.GameObjects.Text

	create (scene: Phaser.Scene): TheirScoreRegion {
		const width = 150
		const height = 100
		const overlap = 20
		
		this.container = scene.add.container(0, 0)
		.setDepth(3)

		// Wins
		this.txtWins = scene.add.text(Space.windowWidth - 140, 70, '', Style.basic)
		.setOrigin(0)

		// Add each of these objects to container
		this.container.add([
			this.txtWins,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.txtWins.setText(`${state.wins[1]}`)
	}
}