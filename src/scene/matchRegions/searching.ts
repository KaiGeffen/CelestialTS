import "phaser"
import { Color, Space, Style, Depth } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import avatarNames from '../../lib/avatarNames'


export default class SearchingRegion extends Region {
	// Interval on which the opponent's avatar is shuffled
	interval: NodeJS.Timeout

	create (scene: BaseScene, avatarId: number): Region {
		this.container = scene.add.container(0, 0).setDepth(Depth.searching)

		this.container.add(this.createBackground(scene))

		this.container.add(this.createText(scene))

		this.createAvatars(scene, avatarId)

		this.addButtons(scene, this.container)

		return this
	}

	hide(): void {
		clearInterval(this.interval)
		return super.hide()
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
		let background = scene.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, Color.background)
		.setOrigin(0)

		return background
	}

	private createText(scene: Phaser.Scene): Phaser.GameObjects.Text {
		let txt = scene.add.text(Space.windowWidth/2, Space.windowHeight/2, 'Searching for an opponent', Style.header)
		.setOrigin(0.5)

		return txt
	}

	private createAvatars(scene: Phaser.Scene, avatarId: number): void {
		const scale = Math.min(1, Space.windowHeight / 600)
		let avatar = scene.add.image(0, Space.windowHeight/2, `avatar-${avatarNames[avatarId]}Full`)
		.setScale(scale)
		.setOrigin(0, 0.5)

		let mysteryAvatar = scene.add.image(Space.windowWidth, Space.windowHeight/2, `avatar-${avatarNames[0]}Full`)
		.setScale(scale)
		.setOrigin(1, 0.5)
		.setTint(0x222222)

		let i = 0
		this.interval = setInterval(() => {
			i = (i + 1) % avatarNames.length
			mysteryAvatar.setTexture(`avatar-${avatarNames[i]}Full`)
		}, 2000)

		this.container.add([avatar, mysteryAvatar])
	}

	private addButtons(scene: BaseScene, container: Phaser.GameObjects.Container): Button {
		let btn = new Buttons.Basic(container, Space.windowWidth/2, Space.windowHeight/2 + 100, 'Cancel', () => {
			// Do any necessary cleanup
			scene.beforeExit()

			// Return to the last scene
			scene.doBack()
		})


		return btn
	}
}