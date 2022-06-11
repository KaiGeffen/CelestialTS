import "phaser"
import ClientState from '../../lib/clientState'
import { Depth, Space, Style } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'


export default class ScoreRegion extends Region {
	// For the current state, the maximum and current amount of breath we have
	maxBreath: number
	currentBreath: number

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
		this.container = scene.add.container().setDepth(Depth.ourScore)

		// Create all of the breath icons
		this.createBreathIcons()

		const x = Space.windowWidth - 124
		this.txtWins = scene.add.text(x, Space.windowHeight - 114, '', Style.basic).setOrigin(0)
		this.txtBreath = scene.add.text(x + 6, Space.windowHeight - 60, '', Style.basic).setOrigin(0)
		
		// Add each of these objects to container
		this.container.add([
			this.txtBreath,
			this.txtWins,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.maxBreath = state.maxMana[0]
		this.currentBreath = state.mana

		// Reset the displayed cost
		this.displayCost(0)

		const s = `${state.mana}/${state.maxMana[0]}`
		this.txtBreath.setText(s)

		this.txtWins.setText(`${state.wins[0]}/5`)
	}

	// Display a given breath cost
	displayCost(cost: number): void {
		// Each is hidden by the one below
		for (let i = 0; i < 10; i++) {
			this.breathSpent[i].setVisible(i < this.maxBreath)
			this.breathExtra[i].setVisible(i < this.currentBreath)
			this.breathBasic[i].setVisible(i < Math.min(this.maxBreath, this.currentBreath))
			this.breathOom[i].setVisible(i < cost)
			this.breathHover[i].setVisible(i < Math.min(cost, this.currentBreath))
		}
	}

	// Create all of the breath icons
	private createBreathIcons(): void {
		// NOTE Order matters, earliest is on the bottom
		const breathMap = {
			'Spent': this.breathSpent,
			'Extra': this.breathExtra,
			'Basic': this.breathBasic,
			'Oom': this.breathOom,
			'Hover': this.breathHover,
		}

		for (let key in breathMap) {
			this.createBreathSubtype(key, breathMap[key])
		}
	}

	private createBreathSubtype(key: string, images: Phaser.GameObjects.Image[]): void {
		//Center at 163, 53 from right bottom corner
		const center = [Space.windowWidth - 163, Space.windowHeight - 53]
		const radius = 30

		// 10 is the max displayed breath, but player could have more
		for (let i = 0; i < 10; i++) {
			// Angle in radians
			const theta = 2 * Math.PI * i / 10

			const x = center[0] + Math.cos(theta) * radius
			const y = center[1] + Math.sin(theta) * radius
			const s = `icon-Breath${key}`

			// Create the icon, add it to container and list of breath for this subtype
			let image = this.scene.add.image(x, y, s)
			this.container.add(image)
			images.push(image)
		}
	}


}