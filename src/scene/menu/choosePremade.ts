import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { ButtonAvatarFull } from '../../lib/buttons/avatarSelect'
import Menu from './menu'
import { Space, Color } from '../../settings/settings'
import avatarNames from '../../lib/avatarNames'


export default class ChoosePremade extends Menu {
	constructor(scene: Phaser.Scene, params) {
		let callback: (number) => () => void = params.callback
		super(scene)

		// Make a fixed height sizer
		let [panel, subpanel] = this.createSizer(scene)

		// Create each avatar
		for (let i = 0; i < avatarNames.length; i++) {
			subpanel.add(this.createCharacter(scene, avatarNames[i], callback(i)))
		}

		panel.layout()
	}

	private createSizer(scene: Phaser.Scene)  {
		const width = 400 * 3 + Space.pad * 4
		const height = 600 + Space.pad * 2

		let subpanel = scene['rexUI'].add.fixWidthSizer(
			{width: 400 * 3 + Space.pad * 4,
				space: {
					left: Space.pad,
					right: Space.pad,
					top: Space.pad,
					bottom: Space.pad,
					item: Space.pad,
					line: Space.pad,
				}
			}
			)
		let panel = scene['rexUI'].add.scrollablePanel({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width,
			height: height,

			background: scene.add.rectangle(0, 0, width, height, Color.background),

			panel: {// TODO Create panel method
				child: subpanel
			},

			mouseWheelScroller: {
				speed: 1
			},
		})

		return [panel, subpanel]
	}


	private createCharacter(scene: Phaser.Scene, name: string, callback: () => void): ContainerLite {
		let container = new ContainerLite(scene,
			0,
			0,
			400,
			600,
			)

		let that = this
		let avatar = new ButtonAvatarFull(container, 0, 0, name, name, () => {
			callback()
			that.close()
		})

		return container
	}
}
