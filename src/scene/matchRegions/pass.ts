import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import Button from '../../lib/buttons/button';
import Icons from '../../lib/buttons/icons'
import ClientState from '../../lib/clientState';
import { Style, Color, Space, Time } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// During the round, shows Pass button, who has passed, and who has priority
export default class PassRegion extends Region {
	background: RoundRectangle
	callback: () => void
	recapCallback: () => void
	
	// The callback once the winner has been declared
	showResultsCallback: () => void

	btnPass: Button

	txtYouPassed: Phaser.GameObjects.Text
	txtTheyPassed: Phaser.GameObjects.Text

	create (scene: BaseScene): PassRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Add the background
		this.background = this.createBackground()
		this.container.add(this.background)

		// Pass and recap button
		this.createButtons()

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

		// Once the game is over, change the callback to instead show results of match
		if (state.winner !== null) {
			this.btnPass.setOnClick(() => {	
				this.showResultsCallback()
			})
		}

		// Show this container when state is not in recap
		this.container.setVisible(!isRecap)

		// Show who has passed
		if (state.passes === 2) {
			this.animatePass(this.txtYouPassed, true)
			this.animatePass(this.txtTheyPassed, true)
		}
		else if (state.passes === 1) {
			// My turn, so they passed
			if (state.priority === 0) {
				this.animatePass(this.txtYouPassed, false)
				this.animatePass(this.txtTheyPassed, true)
			}
			// Their turn, so I passed
			else {
				this.animatePass(this.txtYouPassed, true)
				this.animatePass(this.txtTheyPassed, false)
			}
		}
		else {
			this.animatePass(this.txtYouPassed, false)
			this.animatePass(this.txtTheyPassed, false)
		}

		// Enable/disable button based on who has priority
		if (state.winner !== null) {
			this.btnPass.enable()

			// This displays the correct alternate text
			this.btnPass.setText('EXIT')
		}
		else if (state.priority === 0) {
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

	setShowResultsCallback(callback: () => void): void {
		this.showResultsCallback = callback
	}

	private createBackground(): RoundRectangle {
		let background = new RoundRectangle(
			this.scene,
			Space.windowWidth - Space.cardWidth/2 - Space.pad,
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

	private createButtons(): void {
		let that = this

		this.btnPass = new Icons.Pass(this.container,
			this.background.x,
			this.background.y)
		
		// Set on click to be the callback, but only once
		this.btnPass.setOnClick(() => {that.callback()}, true)
	}

	private createText(): void {
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
			this.txtYouPassed,
			this.txtTheyPassed
			])
	}

	// Animate the given object saying that the player has/not passed
	// NOTE This causes a pause on every state change even if alpha is 0 > 0
	private animatePass(txt: Phaser.GameObjects.Text, hasPassed: boolean): void {
		this.scene.tweens.add({
			targets: txt,
			alpha: hasPassed ? 1 : 0,
			duration: Time.recapTween(),
			
			onComplete: function (tween, targets, _)
			{
				txt.setAlpha(hasPassed ? 1 : 0)
			}
		})
	}
}