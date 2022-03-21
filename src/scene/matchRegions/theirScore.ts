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
		// TODO Our hand height = 150
		
		this.container = scene.add.container(Space.windowWidth - 250, 0)
		.setDepth(3)

		// Add background rectangle
		// TODO user variables
		const background = this.createBackground(scene)

		// Wins
		const winsIcon = scene.add.image(46, height/2, 'icon-Wins').setOrigin(0, 0.5)
		let txtWinsReminder = scene.add.text(winsIcon.x + winsIcon.width + Space.pad, height/2 - 13, 'Wins:', Style.small).setOrigin(0, 0.5)
		this.txtWins = scene.add.text(txtWinsReminder.x, height/2 + 7, '', Style.basic).setOrigin(0, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,

			winsIcon,
			txtWinsReminder,
			this.txtWins,
			])

		return this
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		const points = '0 0 180 0 160 110 20 110'
		let background = scene.add.polygon(0, 0, points, Color.background, 1).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
        let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
        postFxPlugin['add'](background, {
        	thickness: 1,
        	outlineColor: Color.border,
        })

        return background
	}

	displayState(state: ClientState, isRecap: boolean): void {
		// const s = `${state.mana}/${state.maxMana[0]}`//\nWins: ${state.wins[0]} to ${state.wins[1]}
		// this.txtBreath.setText(s)

		this.txtWins.setText(`${state.wins[1]}`)
	}
}