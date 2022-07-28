import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import ClientState from '../../lib/clientState';
import { Color, Space, Style, Time } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// Shows the current scores of the night's performance
// As well as any buttons
export default class ScoresRegion extends Region {
	txtOurScore: Phaser.GameObjects.Text
	txtTheirScore: Phaser.GameObjects.Text
	txtRoundResult: Phaser.GameObjects.Text

	create (scene: BaseScene): ScoresRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Text
		const x = Space.windowWidth - 158
		let txtHint = scene.add.text(
			x, Space.windowHeight/2, 'Points', Style.small
			).setOrigin(0.5)
		this.txtOurScore = scene.add.text(
			x, Space.windowHeight/2 + 50, '', Style.announcement
			).setOrigin(0.5)
		this.txtTheirScore = scene.add.text(
			x, Space.windowHeight/2 - 50, '', Style.announcement
			).setOrigin(0.5)
		this.txtRoundResult = scene.add.text(
			x, Space.windowHeight/2, '', Style.announcement
			).setOrigin(0.5)
		
		this.container.add([
			txtHint,
			this.txtOurScore,
			this.txtTheirScore,
			this.txtRoundResult,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		this.container.setVisible(isRecap)

		if (isRecap) {
			this.displayScores(state, isRecap)
		}

		// On the final state of the recap, animate the text of round results
		if (isRecap && state.isRecapEnd()) {
			this.animateResult(state)
		}
	}

	// Display the current score totals
	private displayScores(state: ClientState, isRecap: boolean): void {
		// Display current total
		this.txtOurScore.setText(`${state.score[0]}`)
		this.txtTheirScore.setText(`${state.score[1]}`)
	}

	// Animate the results of this round
	// TODO Temporary, replace with crisper animation
	private animateResult(state: ClientState): void {
		let s
		if (state.recap.sums[0] > state.recap.sums[1]) {
			s = 'Win!'
		}
		else if (state.recap.sums[0] < state.recap.sums[1]) {
			s = 'Lose!'
		}
		else {
			s = 'Tie!'
		}
		this.txtRoundResult.setText(s)
		.setVisible(true)

		this.scene.tweens.add({
			targets: this.txtRoundResult,
			duration: Time.recapTween(),
			hold: Time.recapTween(),
			ease: "Sine.easeInOut",
			scale: 1.5,
			yoyo: true,
			onComplete: () => {
				this.txtRoundResult.setScale(0)
				.setVisible(false)
			}
		})
	}
}
