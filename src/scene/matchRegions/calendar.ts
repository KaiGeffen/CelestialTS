import "phaser"
import { cardback } from '../../catalog/catalog'
import { keywords } from "../../catalog/keywords"
import { Zone } from '../../lib/animation'
import { AvatarSmall, ButtonInspire, ButtonNourish } from '../../lib/buttons/backed'
import Button from '../../lib/buttons/button'
import { CardImage } from '../../lib/cardImage'
import ClientState from '../../lib/clientState'
import { Status } from '../../lib/status'
import { Color, Space, Style, Time } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


export default class CalendarRegion extends Region {
	txt: Phaser.GameObjects.Text

	// Whether the last state shown was during day time
	lastShownDay: boolean

	create (scene: BaseScene): CalendarRegion {
		this.scene = scene
		this.container = scene.add.container(0, 0)
		.setDepth(8)
		.setAlpha(0)

		this.lastShownDay = false

		this.txt = scene.add.text(Space.windowWidth/2, Space.windowHeight/2, 'Morning breaks...', Style.announcement)
		.setOrigin(0.5)

		let background = this.createBackground()
		this.container.add([background, this.txt])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		// Don't display until mulligans are complete
		if (state.mulligansComplete.includes(false)) {
			return
		}

		// Display that it's night time on the first state of night
		if (isRecap && this.lastShownDay) {
			this.txt.setText('Nightime...')
			this.lastShownDay = false

			this.animate()
		}
		else if (!isRecap && !this.lastShownDay) {
			this.txt.setText('Daytime...')
			this.lastShownDay = true

			this.animate()
		}

		// this.animate(state, hand, isRecap)
	}

	private createBackground(): Phaser.GameObjects.GameObject {
		let background = this.scene.add.rectangle(
			Space.windowWidth/2,
			Space.windowHeight/2,
			this.txt.width + Space.pad * 2,
			this.txt.height + Space.pad * 2,
			Color.background, 1
			)

		// Add a border around the shape TODO Make a class for this to keep it dry
		let postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')
		postFxPlugin['add'](background, {
			thickness: 1,
			outlineColor: Color.border,
		})

		return background
	}

	// Animate the text fading in then out
	private animate(): void {
		// Set alpha to 0
		this.container.setAlpha(0)

		this.scene.tweens.add({
			targets: this.container,
			alpha: 1,
			duration: 200,
			hold: Time.recapTween(),
			yoyo: true
		})
	}
}