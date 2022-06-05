import "phaser"

import Region from './baseRegion'

import { Space, Color, Time } from '../../settings/settings'
import { AButtonSmall, AButtonLarge } from '../../lib/buttons/backed'
import { CardImage } from '../../lib/cardImage'
import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
import { Animation, Zone } from '../../lib/animation'
import BaseScene from '../baseScene'


export default class OurHandRegion extends Region {
	btnRecap: AButtonSmall
	btnPass: AButtonLarge
	btnSkip: AButtonSmall
	btnPlay: AButtonLarge
	btnPause: AButtonLarge

	create (scene: BaseScene): OurHandRegion {
		let that = this
		this.scene = scene
		const width = 230

		this.container = scene.add.container(Space.windowWidth - width, Space.windowHeight - Space.handHeight)
		.setDepth(2)
		.setVisible(false)

		// Add the background
		this.container.add(this.createBackground(scene))

		// Recap button
		this.btnRecap = new AButtonSmall(this.container,
			width/2 + 15,
			Space.handHeight / 3 + 5,
			'Recap'
			)

		// Pass button
		this.btnPass = new AButtonLarge(this.container,
			width/2 + 15,
			Space.handHeight * 2 / 3 + 15,
			'Pass'
			)

		// Skip button
		this.btnSkip = new AButtonSmall(this.container,
			width/2 + 15,
			Space.handHeight / 3 + 5,
			'Skip')

		// Play button
		this.btnPlay = new AButtonLarge(this.container,
			width/2 + 15,
			Space.handHeight * 2 / 3 + 15,
			'Play'
			)

		// Pause button
		this.btnPause = new AButtonLarge(this.container,
			width/2 + 15,
			Space.handHeight * 2 / 3 + 15,
			'Pause'
			)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Make buttons visible/invisible as appropriate
		this.btnRecap.setVisible(!isRecap)
		this.btnPass.setVisible(!isRecap)
		this.btnSkip.setVisible(isRecap)

		// Pause when a round starts
		let isRoundEnd = ['win', 'lose', 'tie'].includes(state.soundEffect)
		if (isRecap && (state.recap.playList.length === 0 && !isRoundEnd)) {
			// NOTE Switches back and forth to pause button based on callbacks
			this.btnPause.onClick()
		}

		// Pause and play buttons are invisible when not in recap
		if (!isRecap) {
			this.btnPause.setVisible(false)
			this.btnPlay.setVisible(false)
		}
	}

	private createBackground(scene: Phaser.Scene): Phaser.GameObjects.Polygon {
		const points = `0 ${Space.handHeight} 30 0 230 0 230 ${Space.handHeight}`
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

	// Set the callback for when the play button is pressed
	setPlayCallback(f: () => void): void {
		let that = this

		this.btnPlay.setOnClick(() => {
			that.btnPlay.setVisible(false)
			that.btnPause.setVisible(true)
			f()
		})
	}


	// Set the callback for when the pause button is pressed
	setPauseCallback(f: () => void): void {
		let that = this

		this.btnPause.setOnClick(() => {
			that.btnPause.setVisible(false)
			that.btnPlay.setVisible(true)
			f()
		})
	}
}