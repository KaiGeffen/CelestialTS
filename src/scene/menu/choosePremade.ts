import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { ButtonAvatarFull } from '../../lib/buttons/avatarSelect'


// Menu which shows player the different characters to choose their
// premade deck

import Menu from './menu'
import { Space } from '../../settings/settings'


export default class ChoosePremade extends Menu {
	constructor(scene: Phaser.Scene) {
		super(scene)
		// this.createBackground(width, height)

		// Make a fixed height sizer
		let sizer = this.createSizer(scene)

		// Add characters to it

		// 6 times, create the given character
		const names = ['Jules', 'Adonis', 'Mia', 'Kitz', 'Imani', 'Mona']
		names.forEach(name => {
			sizer.add(this.createCharacter(scene, 'Jules', []))
		})

		console.log(sizer)

		sizer.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let sizer = scene.rexUI.add.sizer(
			Space.windowWidth,
			Space.windowHeight)

		return sizer
	}


	private createCharacter(scene: Phaser.Scene, name: string, list): ContainerLite {
		let container = new ContainerLite(scene,
			Space.windowWidth/2,
			Space.windowHeight/2,
			400,
			600,
			)

		let avatar = new ButtonAvatarFull(container, 0, 0, name, name)		

		return container
	}

}
