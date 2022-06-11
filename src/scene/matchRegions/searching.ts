import "phaser"
import { Color, Space, Style, Depth } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import Buttons from '../../lib/buttons/buttons'


export default class SearchingRegion extends Region {	
	create (scene: BaseScene): Region {
		this.container = scene.add.container(0, 0).setDepth(Depth.searching)

		this.container.add(this.createBackground(scene))

		this.container.add(this.createText(scene))

		this.addButtons(scene, this.container)

		return this
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

	private addButtons(scene: BaseScene, container: Phaser.GameObjects.Container): SymmetricButtonSmall {
		let btn = new Buttons.Basic(container, Space.windowWidth/2, Space.windowHeight/2 + 100, 'Cancel', () => {
			// Stop the other active scene
			scene.beforeExit()
			scene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("BuilderScene")
		})

		return btn
	}
}