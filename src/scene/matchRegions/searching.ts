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

	hide(): Region {
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

// A separate initial region seen during the tutorial
export class SearchingRegionTutorial extends Region {
	btn: Button

	create(scene: BaseScene): Region {
		this.container = scene.add.container(0, 0).setDepth(Depth.searching)

		this.createImage(scene)

		this.createText(scene)
		
		this.createButton(scene)

		// Pause until button is pressed
		scene['paused'] = true

		return this
	}

	private createImage(scene: Phaser.Scene): void {
		let img = scene.add.image(Space.windowWidth/2, 0, 'bg-Story 1')
		.setOrigin(0.5, 0)
		.setInteractive()

		const scale = Space.windowWidth / img.displayWidth
		img.setScale(scale)

		// Scroll the image down from viewing the buildings to seeing the person
		scene.add.tween({
			targets: img,
			duration: 4000,
			y: Space.windowHeight - img.displayHeight,
			onComplete: () => {
				this.btn.enable()
			}
		})
		
		this.container.add(img)
	}

	private createText(scene: BaseScene): void {
		let txt = scene.add.text(0, 0, '', Style.stillframe)

		const s = "We called out to the people of the world.\n\nIn desperation, curiosity, and humor.\n\nCome to our city, teach us what you've learned."
		let txtB = scene.rexUI.add.textBox({
			text: txt,
			x: Space.windowWidth/2,
			y: Space.pad,
			width: 1000,
			// Need to wrap the text
			// wrapWidth: Space.windowWidth * 2/3,
		})
		.start(s, 50)
		.setOrigin(0.5, 0)
		
		this.container.add([txt, txtB])
	}

	private createButton(scene): void {
		this.btn = new Buttons.Basic(
			this.container,
			Space.windowWidth - Space.pad - Space.largeButtonWidth/2,
			Space.windowHeight - Space.pad - Space.largeButtonHeight/2,
			'Continue',
			() => {
				scene['paused'] = false
			})
		.disable()
	}
}
