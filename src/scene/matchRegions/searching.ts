import "phaser"
import { Color, Space, Style, Depth, Ease } from '../../settings/settings'
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
	img: Phaser.GameObjects.Image
	textbox: any

	hasSecondPart: boolean

	create(scene: BaseScene, tutorialNum: number): Region {
		this.scene = scene
		this.container = scene.add.container(0, 0).setDepth(Depth.searching)

		this.createImage(scene, tutorialNum)

		this.createText(scene, tutorialNum)
		
		this.createButton(scene, tutorialNum)

		// Pause until button is pressed
		scene['paused'] = true

		// For the first tutorial, have 2 parts
		this.hasSecondPart = tutorialNum === 0

		return this
	}

	private createImage(scene: Phaser.Scene, tutorialNum: number): void {
		this.img = scene.add.image(Space.windowWidth/2, 0, `bg-Story ${tutorialNum === 0 ? 1 : 3}`)
		.setOrigin(0.5, 0)
		.setInteractive()

		// Ensure that image fits perfectly in window
		const scale = Space.windowWidth / this.img.displayWidth
		this.img.setScale(scale)

		this.container.add(this.img)

		this.tweenImage()
	}

	private createText(scene: BaseScene, tutorialNum: number): void {
		let txt = scene.add.text(0, 0, '', Style.stillframe)

		const s = STORY_TEXT[tutorialNum][0]
		this.textbox = scene.rexUI.add.textBox({
			text: txt,
			x: Space.windowWidth/2,
			y: Space.pad,
			width: 1000,
			// Need to wrap the text
			// wrapWidth: Space.windowWidth * 2/3,
		})
		.start(s, 50)
		.setOrigin(0.5, 0)
		
		this.container.add([txt, this.textbox])
	}

	private createButton(scene, tutorialNum): void {
		this.btn = new Buttons.Basic(
			this.container,
			Space.windowWidth - Space.pad - Space.largeButtonWidth/2,
			Space.windowHeight - Space.pad - Space.largeButtonHeight/2,
			'Continue',
			() => {
				if (this.hasSecondPart) {
					this.hasSecondPart = false

					// Change the background image
					this.img.setTexture('bg-Story 2')
					
					this.tweenImage()

					// Change the text
					const s = STORY_TEXT[tutorialNum][1]
					this.textbox.start(s, 50)
				}
				else {
					scene['paused'] = false
				}
			})
		.disable()
	}

	private tweenImage(): void {
		// Scroll the image going down
		this.scene.add.tween({
			targets: this.img,
			duration: 6000,
			ease: Ease.stillframe,
			y: Space.windowHeight - this.img.displayHeight,
			onStart: () => {
				this.img.y = 0
				this.btn.disable()
			},
			onComplete: () => {
				this.btn.enable()
			}
		})
	}
}

const STORY_TEXT = [
[`We called out to the people of the world.
In desperation, curiosity, and humor.
Come to our city, teach us what you've learned.

One by one they arrived, guided by stars, and were greeted with excitement at the gate.`,

`Hey!
Welcome to the city, we're glad you made it.
What stories have you brought to tell us?

     Release, impetus, and charity.

Ho ho, exciting!
Please, show me.`],

[`Marvelous! Traveler, please tell us more.
What have you seen out there in the world?

     Scenes of wonder and change

*Gasp*
Show me`],

[`So vibrant your tales, they please so the ear and mind.
Do you have any last ones to share?

     The fields overflowing as the people stared up at the sky

Traveler, is this true?
Show me this, and I will open the gates, and welcome you into the city`],
]
