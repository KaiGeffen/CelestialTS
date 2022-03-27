import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import Button from '../../lib/button'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'


export default class OurHandRegion extends Region {
	btnRecap: Button
	btnPass: Button
	btnSkip: Button
	btnPlay: Button

	create (scene: Phaser.Scene): OurHandRegion {
		let that = this
		this.scene = scene
		const height = 150
		const width = 230

		this.container = scene.add.container(Space.windowWidth - width, Space.windowHeight - height).setDepth(2)

		// Add the background
		this.container.add(this.createBackground(scene))

		// Recap button
		this.btnRecap = new Button(this.container,
			width/2 + 15,
			height / 3 + 20/2,
			'Recap'
			).setOrigin(0.5)

		// Pass button
		this.btnPass = new Button(this.container,
			width/2 + 15,
			height * 2 / 3 + 20/2,
			'Pass'
			).setOrigin(0.5)

		// Skip button
		this.btnSkip = new Button(this.container,
			width/2 + 15,
			height / 3 + 20/2,
			'Skip',
			() => {
				that.btnPlay.stopGlow()
			}
			).setOrigin(0.5)

		// Play button
		this.btnPlay = new Button(this.container,
			width/2 + 15,
			height * 2 / 3 + 20/2,
			'Play'
			).setOrigin(0.5)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Make buttons visible/invisible as appropriate
		this.btnRecap.setVisible(!isRecap)
		this.btnPass.setVisible(!isRecap)
		this.btnSkip.setVisible(isRecap)
		this.btnPlay.setVisible(isRecap)

		// Play button glows before at the start of the recap
		let isRoundEnd = ['win', 'lose', 'tie'].includes(state.soundEffect)
		if (isRecap && (state.recap.playList.length === 0 && !isRoundEnd)) {
			this.btnPlay.glowUntilClicked()
		}
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Polygon {
		const points = '0 150 30 0 230 0 230 150'
		let background = scene.add.polygon(0, 0, points, Color.background, 1).setOrigin(0)

		// Add a border around the shape TODO Make a class for this to keep it dry
        let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
        postFxPlugin['add'](background, {
        	thickness: 1,
        	outlineColor: Color.border,
        })

        return background
	}

	// Set the callback for when the recap button is pressed
	setRecapCallback(f: () => void): void {
		this.btnRecap.setOnClick(f)
	}

	// Set the callback for when the pass button is pressed
	setPassCallback(f: () => void): void {
		this.btnPass.setOnClick(f)
	}

	// Set the callback for when the skip button is pressed
	setSkipCallback(f: () => void): void {
		this.btnSkip.setOnClick(f)
	}
}