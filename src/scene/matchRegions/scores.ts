import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import ClientState from '../../lib/clientState';
import { Color, Space, Style, Time } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// TODO Rename Score to round result or something

// Shows the current scores of the night's performance
// As well as any buttons
export default class ScoresRegion extends Region {
	imgRoundResult: Phaser.GameObjects.Image

	create (scene: BaseScene): ScoresRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Text
		const x = Space.windowWidth - 158
		let txtHint = scene.add.text(
			x, Space.windowHeight/2, 'Points', Style.small
			).setOrigin(0.5)

		// Image in the center saying if you won/lost/tied
		this.imgRoundResult = scene.add.image(Space.windowWidth/2, Space.windowHeight/2, 'icon-RoundWin')
		
		this.container.add([
			txtHint,
			this.imgRoundResult,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		this.container.setVisible(isRecap)

		// On the final state of the recap, animate the text of round results
		if (isRecap && state.isRecapEnd()) {
			this.animateResult(state)
		}
		else {
			this.imgRoundResult.setVisible(false)
		}
	}

	// Animate the results of this round
	// TODO Temporary, replace with crisper animation
	private animateResult(state: ClientState): void {
		let s, img
		if (state.recap.sums[0] > state.recap.sums[1]) {
			img = 'Win'
		}
		else if (state.recap.sums[0] < state.recap.sums[1]) {
			img = 'Lose'
		}
		else {
			img = 'Tie'
		}

		// Set what image displays
		this.imgRoundResult.setTexture(`icon-Round${img}`)

		this.scene.tweens.add({
			targets: this.imgRoundResult,
			duration: 200,
			hold: 2400,
			ease: "Sine.easeInOut",
			alpha: 1,
			yoyo: true,
			onStart: () => {
				this.imgRoundResult.setAlpha(0)
				.setVisible(true)
			},
			onComplete: () => {
				this.imgRoundResult.setAlpha(0)
			}
		})
	}
}
