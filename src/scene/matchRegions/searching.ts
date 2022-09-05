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

	// Number of the image frame currently shown, always end with the 3rd frame
	currentFrame: number

	create(scene: BaseScene, tutorialNum: number): Region {
		this.scene = scene
		this.container = scene.add.container(0, 0).setDepth(Depth.searching)

		// For the first tutorial, show first 3 frames
		this.currentFrame = tutorialNum === 0 ? 1 : 3

		this.createImage(scene, tutorialNum)

		this.createText(scene, tutorialNum)
		
		this.createButton(scene, tutorialNum)

		// Pause until button is pressed
		scene['paused'] = true

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

		let background = this.scene.rexUI.add.roundRectangle(0, 0, 100, 100, 10, 0x000000, 0.5)

		const s = STORY_TEXT[tutorialNum][0]
		this.textbox = scene.rexUI.add.textBox({
			text: txt,
			x: Space.pad,
			y: Space.pad,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
			},
			// width: Space.stillframeTextWidth,
			background: background,
		})
		.start(s, 50)
		.setOrigin(0)
		
		this.container.add([background, txt, this.textbox])
	}

	private createButton(scene, tutorialNum): void {
		this.btn = new Buttons.Basic(
			this.container,
			Space.windowWidth - Space.pad - Space.largeButtonWidth/2,
			Space.windowHeight - Space.pad - Space.largeButtonHeight/2,
			'Continue',
			() => {
				if (this.currentFrame < 3) {
					this.currentFrame += 1

					// Change the background image
					this.img.setTexture(`bg-Story ${this.currentFrame}`)
					
					this.tweenImage()

					// Change the text
					const s = STORY_TEXT[tutorialNum][this.currentFrame - 1]
					this.textbox.start(s, 50)
				}
				else {
					this.textbox.setVisible(false)

					this.btn.destroy()

					// Tween the stillframe scrolling up to be flush with the top, then start the match
					this.scene.add.tween({
						targets: this.img,
						duration: 2000,
						ease: Ease.stillframeEnd,
						y: 0,
						onComplete: () => {
							scene['paused'] = false
						}
					})

				}
			})
		.disable()
	}

	private tweenImage(): void {
		// Y of the image when flush with the bottom
		const downFully = Space.windowHeight - this.img.displayHeight

		if (this.currentFrame < 3) {
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
		else {

			// If this is the 3rd frame, animate going up slightly
			// Scroll the image going down
			this.scene.add.tween({
				targets: this.img,
				duration: 6000 * 1/3,
				ease: Ease.stillframe,
				y: (downFully) * 2/3,
				onStart: () => {
					this.img.y = downFully
					this.btn.disable()
				},
				onComplete: () => {
					this.btn.enable()
				}
			})
		}
	}
}

const STORY_TEXT = [
[`We called out to the people of the world.
In desperation, curiosity, and humor.
Come to our city, teach us what you've learned.`,

`One by one they arrived, guided by stars, and were greeted with excitement at the gate.`,

`"Traveler!
Welcome to the city, we're glad you made it.
What stories have you brought to tell us?"`],

[`"Marvelous! Traveler, please tell us more.
What have you seen out there in the world?"`],

[`"So vibrant your tales, so vivid the dust of worlds you carry on your boots.
Just once more traveler.
One last story before we open the gate, and welcome you into the city."`],
]
