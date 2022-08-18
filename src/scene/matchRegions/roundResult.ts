import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import ClientState from '../../lib/clientState';
import { Color, Space, Style, Time } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// Shows the current scores of the night's performance
// As well as any buttons
export default class RoundResultRegion extends Region {
	roundResult: Phaser.GameObjects.Sprite

	create (scene: BaseScene): RoundResultRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Image in the center saying if you won/lost/tied
		this.roundResult = scene.add.sprite(Space.windowWidth/2, Space.windowHeight/2, 'icon-RoundWin', 2)
		// .setAlpha(0)
		.play('icon-RoundWin')
		
		this.container.add([
			this.roundResult,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// On the final state of the recap, animate the text of round results
		if (isRecap && state.isRecapEnd()) {
			this.animateResult(state)
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
		const name = `icon-Round${img}`
		this.roundResult.setTexture(name, 0)
		.play(name)

		// Tween it fading in and out
		this.scene.tweens.add({
			targets: this.roundResult,
			duration: 200,
			hold: 2400,
			ease: "Sine.easeInOut",
			alpha: 1,
			yoyo: true,
			onStart: () => {
				this.roundResult.setAlpha(0)
			},
			onComplete: () => {
				this.roundResult.setAlpha(0)
			},
		})
	}
}
