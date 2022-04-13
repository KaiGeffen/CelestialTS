import "phaser"
import { Color, Space, Style } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'


export default class SearchingRegion extends Region {	
	create (scene: BaseScene): Region {
		this.container = scene.add.container(0, 0).setDepth(9)

		this.container.add(this.createBackground(scene))

		this.container.add(this.createText(scene))

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
}