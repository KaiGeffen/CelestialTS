import "phaser";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import ClientState from '../../lib/clientState';
import { Color, Space, Style } from '../../settings/settings';
import BaseScene from '../baseScene';
import Region from './baseRegion';


// Shows the current scores of the night's performance
// As well as any buttons
export default class ScoresRegion extends Region {
	txtOurScore: Phaser.GameObjects.Text
	txtTheirScore: Phaser.GameObjects.Text
	background: RoundRectangle

	create (scene: BaseScene): ScoresRegion {
		this.scene = scene
		this.container = scene.add.container()

		// Add the background
		this.background = this.createBackground(scene)
		this.container.add(this.background)

		// Text
		let txtHint = scene.add.text(
			this.background.x, Space.windowHeight/2, 'Points', Style.small
			).setOrigin(0.5)
		this.txtOurScore = scene.add.text(
			this.background.x, Space.windowHeight/2 + 50, '', Style.announcement
			).setOrigin(0.5)
		this.txtTheirScore = scene.add.text(
			this.background.x, Space.windowHeight/2 - 50, '', Style.announcement
			).setOrigin(0.5)
		
		this.container.add([
			txtHint,
			this.txtOurScore,
			this.txtTheirScore,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		this.container.setVisible(isRecap)

		if (isRecap) {
			this.displayScores(state, isRecap)
		}
	}

	private createBackground(scene: Phaser.Scene): RoundRectangle {
		const points = `0 ${Space.handHeight} 30 0 230 0 230 ${Space.handHeight}`
		let background = new RoundRectangle(
			scene,
			Space.windowWidth - Space.cardWidth/2 - Space.pad,
			Space.windowHeight/2,
			200,
			200,
			100,
			Color.background
			)

		// Add a border around the shape TODO Make a class for this to keep it dry
        let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
        postFxPlugin['add'](background, {
        	thickness: 1,
        	outlineColor: Color.border,
        })

        return background
	}

	// Display the current score totals
	private displayScores(state: ClientState, isRecap: boolean): void {
		// Display current total
		this.txtOurScore.setText(`${state.score[0]}`)
		this.txtTheirScore.setText(`${state.score[1]}`)
	}
}