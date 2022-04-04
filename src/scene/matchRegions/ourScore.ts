import "phaser"

import Region from './baseRegion'

import { Space, Color, Style } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import BaseScene from '../baseScene'


export default class ScoreRegion extends Region {
	txtBreath: Phaser.GameObjects.Text
	txtWins: Phaser.GameObjects.Text

	create (scene: BaseScene): ScoreRegion {
		const width = 300
		const height = 90
		const overlap = 20
		
		this.container = scene.add.container(Space.windowWidth - width,
			Space.windowHeight - Space.handHeight - height + overlap)
			.setDepth(3)

		// Add background rectangle
		const background = this.createBackground(scene)

		const breathIcon = scene.add.image(30, height/2, 'icon-Breath').setOrigin(0, 0.5)
		let txtBreathReminder = scene.add.text(breathIcon.x + breathIcon.width + Space.pad, height/2 - 13, 'Breath:', Style.small).setOrigin(0, 0.5)
		this.txtBreath = scene.add.text(txtBreathReminder.x, height/2 + 7, '', Style.basic).setOrigin(0, 0.5)

		// Wins
		const winsIcon = scene.add.image(180, height/2, 'icon-Wins').setOrigin(0, 0.5)
		let txtWinsReminder = scene.add.text(winsIcon.x + winsIcon.width + Space.pad, height/2 - 13, 'Wins:', Style.small).setOrigin(0, 0.5)
		this.txtWins = scene.add.text(txtWinsReminder.x, height/2 + 7, '', Style.basic).setOrigin(0, 0.5)

		// Add each of these objects to container
		this.container.add([
			background,
			breathIcon,
			txtBreathReminder,
			this.txtBreath,

			winsIcon,
			txtWinsReminder,
			this.txtWins,
			])

		return this
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		const points = '20 0 300 0 300 90 0 90'
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
		const s = `${state.mana}/${state.maxMana[0]}`//\nWins: ${state.wins[0]} to ${state.wins[1]}
		this.txtBreath.setText(s)

		this.txtWins.setText(`${state.wins[0]}`)
	}
}