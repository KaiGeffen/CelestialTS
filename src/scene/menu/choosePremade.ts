import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { ButtonAvatarFull } from '../../lib/buttons/avatarSelect'


// Menu which shows player the different characters to choose their
// premade deck

import Menu from './menu'
import { Space, Color } from '../../settings/settings'


export default class ChoosePremade extends Menu {
	constructor(scene: Phaser.Scene, callback: (number) => () => void) {
		super(scene)
		// this.createBackground(width, height)

		// Make a fixed height sizer
		let [panel, subpanel] = this.createSizer(scene)

		// Add characters to it

		// 6 times, create the given character
		const names = ['Jules', 'Adonis', 'Mia', 'Kitz', 'Imani', 'Mona']
		for (let i = 0; i < names.length; i++) {
			// TODO Dont use indexes like this
			subpanel.add(this.createCharacter(scene, names[i], callback(i)))
		}

		panel[0].layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		const width = 400 * 3 + Space.pad * 4
		const height = 600 + Space.pad * 2

		let subpanel = scene.rexUI.add.fixWidthSizer(
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
		let panel = scene.rexUI.add.scrollablePanel({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width,
			height: height,

			background: scene.add.rectangle(0, 0, width, height, Color.background),

			panel: {// TODO Create panel method
				child: subpanel
			},

		})

		// Allow panel to scroll
		this.updateOnScroll(scene, panel)

		return [panel, subpanel]
	}


	private createCharacter(scene: Phaser.Scene, name: string, callback: () => void): ContainerLite {
		let container = new ContainerLite(scene,
			0,
			0,
			400,
			600,
			)

		let avatar = new ButtonAvatarFull(container, 0, 0, name, name, callback)		

		return container
	}

	// Update the panel when user scrolls with their mouse wheel
  private updateOnScroll(scene, panel) {
    let that = this

    scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
      // Return if the pointer is outside of the panel
      if (!panel.getBounds().contains(pointer.x, pointer.y)) {
        return
      }

      // Scroll panel down by amount wheel moved
      panel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      panel.t = Math.max(0, panel.t)
      panel.t = Math.min(0.999999, panel.t)
    })
  }


}
