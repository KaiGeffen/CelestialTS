import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import Button from '../../lib/buttons/button';
import { IButtonPass } from '../../lib/buttons/icon';
import ClientState from '../../lib/clientState';
import { Style, Color, Space } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// During the round, shows Pass button, who has passed, and who has priority
export default class PassRegion extends Region {
	background: RoundRectangle
	callback: () => void

	btnPass: Button

	txtTheirTurn: Phaser.GameObjects.Text
	txtYouPassed: Phaser.GameObjects.Text
	txtTheyPassed: Phaser.GameObjects.Text

	create (scene: BaseScene): PassRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Add the background
		this.background = this.createBackground()
		this.container.add(this.background)

		// Pass button
		this.btnPass = this.createButton()

		// Text for who has passed
		this.createText()

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Before mulligan is complete, hide this region
		if (state.mulligansComplete.includes(false)) {
			this.container.setVisible(false)
			return
		}

		// Once the game is over, hide this region
		if (state.winner !== null) {
			this.container.setVisible(false)
			return
		}

		// Show this container when state is not in recap
		this.container.setVisible(!isRecap)

		// Show if it's their turn
		this.txtTheirTurn.setVisible(state.priority !== 0)

		// Show who has passed
		if (state.passes === 2) {
			this.txtYouPassed.setVisible(true)
			this.txtTheyPassed.setVisible(true)
		}
		else if (state.passes === 1) {
			// My turn, so they passed
			if (state.priority === 0) {
				this.txtYouPassed.setVisible(false)
				this.txtTheyPassed.setVisible(true)
			}
			// Their turn, so I passed
			else {
				this.txtYouPassed.setVisible(true)
				this.txtTheyPassed.setVisible(false)
			}
		}
		else {
			this.txtYouPassed.setVisible(false)
			this.txtTheyPassed.setVisible(false)
		}

		// Enable/disable button based on who has priority
		if (state.priority === 0) {
			this.btnPass.enable()
		}
		else {
			this.btnPass.disable()
		}
	}

	// Set the callback for when user hits the Pass button
	setCallback(callback: () => void): void {
		this.callback = callback
	}

	private createBackground(): RoundRectangle {
		let background = new RoundRectangle(
			this.scene,
			Space.windowWidth - Space.cardWidth - Space.pad,
			Space.windowHeight/2,
			200,
			200,
			100,
			Color.background
			)

		// Add a border around the shape TODO Make a class for this to keep it dry
		let postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')
		postFxPlugin['add'](background, {
			thickness: 1,
			outlineColor: Color.border,
		})

		return background
	}

	private createButton(): Button {
		let that = this

		let btn = new IButtonPass(this.container,
			this.background.x,
			this.background.y)
		
		// Set on click to be the callback, but only once
		btn.setOnClick(() => {that.callback()}, true)

		return btn
	}

	private createText(): void {
		this.txtTheirTurn = this.scene.add.text(
			this.background.x,
			this.background.y,
			'Their Turn',
			Style.announcement,
			).setOrigin(0.5)

		this.txtYouPassed = this.scene.add.text(
			this.background.x,
			this.background.y + 120,
			'You Passed',
			Style.basic,
			).setOrigin(0.5)

		this.txtTheyPassed = this.scene.add.text(
			this.background.x,
			this.background.y - 120,
			'They Passed',
			Style.basic,
			).setOrigin(0.5)

		this.container.add([
			this.txtTheirTurn,
			this.txtYouPassed,
			this.txtTheyPassed
			])
	}
}