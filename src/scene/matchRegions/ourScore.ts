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

	// Icons for each of the states of breath
	breathBasic: Phaser.GameObjects.Image[] = []
	breathSpent: Phaser.GameObjects.Image[] = []
	breathExtra: Phaser.GameObjects.Image[] = []
	breathHover: Phaser.GameObjects.Image[] = []
	breathOom: Phaser.GameObjects.Image[] = []

	create (scene: BaseScene): ScoreRegion {
		this.scene = scene
		this.container = scene.add.container().setDepth(3)

		// Create all of the breath icons
		this.createBreathIcons()

		// this.breathIcon = scene.add.sprite(30, height/2, 'icon-Breath').setOrigin(0, 0.5)
		// this.costIcon = scene.add.sprite(30, height/2, 'icon-Cost').setOrigin(0, 0.5).setVisible(false)
		const x = Space.windowWidth - 124
		this.txtWins = scene.add.text(x, Space.windowHeight - 114, '', Style.basic).setOrigin(0)
		this.txtBreath = scene.add.text(x + 6, Space.windowHeight - 60, '', Style.basic).setOrigin(0)
		

		// Add each of these objects to container
		this.container.add([
			// this.costIcon,
			this.txtBreath,
			this.txtWins,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		// Reset the displayed cost
		this.displayCost(0)
		// this.breathIcon.setFrame(Math.min(10, state.mana))

		const s = `${state.mana}/${state.maxMana[0]}`
		this.txtBreath.setText(s)

		this.txtWins.setText(`${state.wins[0]}`)
	}

	// Display a given breath cost
	displayCost(cost: number): void {
		// this.costIcon.setVisible(cost > 0)
		// this.costIcon.setFrame(Math.min(10, cost))
	}

	// Create all of the breath icons
	private createBreathIcons(): void {
		const breathMap = {
			'Basic': this.breathBasic,
			'Spent': this.breathSpent,
			'Extra': this.breathExtra,
			'Hover': this.breathHover,
			'Oom': this.breathOom,
		}

		for (let key in breathMap) {
			this.createBreathSubtype(key, breathMap[key])
		}
	}

	private createBreathSubtype(key: string, images: Phaser.GameObjects.Image[]): void {
		//Center at 163, 53 from right bottom corner
		const center = [Space.windowWidth - 163, Space.windowHeight - 53]
		const radius = 30

		// TODO 10 max breath displayed
		const MAX = 10
		for (let i = 0; i < MAX; i++) {
			// Angle in radians
			const theta = -2 * Math.PI * i / MAX

			const x = center[0] + Math.cos(theta) * radius
			const y = center[1] + Math.sin(theta) * radius
			const s = `icon-Breath${key}`

			let image = this.scene.add.image(x, y, s)
			this.container.add(image)
			images.push(image)
		}
	}


}