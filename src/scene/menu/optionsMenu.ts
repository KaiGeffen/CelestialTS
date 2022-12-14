import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


import Menu from './menu'
import BaseScene from '../../scene/baseScene'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'
import MenuScene from '../menuScene'


const width = 550

export default class OptionsMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		this.createContent(activeScene)

		this.layout()
	}

	onClose(): void {
		
	}

	private createContent(activeScene: BaseScene) {
		this.createHeader('Options', width + Space.padSmall*2)

		const padding = {padding: {left: Space.padSmall, right: Space.padSmall}}

		this.sizer.add(this.createVolume(), padding)
		.addNewLine()

		this.sizer.add(this.createMusic(), padding)
		.addNewLine()

		this.sizer.add(this.createSpeed(), padding)
		.addNewLine()
		
		this.sizer.add(this.createAutopass(), padding)
		.addNewLine()

		this.sizer.add(this.createButtons(activeScene), padding)
	}

	private createVolume() {
		let that = this
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Volume:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('volume'),
            valuechangeCallback: function (value) {
            	UserSettings._set('volume', value)
                that.scene.sound.volume = value
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createMusic() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Music:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('musicVolume'),
            valuechangeCallback: function (value) {
            	UserSettings._set('musicVolume', value)

            	let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")

            	music.volume = value
            	music.play()
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createSpeed() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txtSpeedHint = this.scene.add.text(0, 0, 'Speed:', Style.basic)
		sizer.add(txtSpeedHint)
		sizer.addSpace()
		
		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('animationSpeed'),
            valuechangeCallback: function (value) {
            	UserSettings._set('animationSpeed', value)
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createAutopass() {
		let sizer = this.scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Autopass:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		const s = UserSettings._get('autopass') ? 'Enabled' : 'Disabled'
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
		let btn = new Buttons.Basic(container, 0, 0, s, () => {
			if (UserSettings._get('autopass')) {
				btn.setText('Disabled')
				UserSettings._set('autopass', false)
			}
			else {
				btn.setText('Enabled')
				UserSettings._set('autopass', true)
			}
		})
		sizer.add(container)

		return sizer
	}

	// Create the buttons at the bottom which navigate to other scenes/menus
	private createButtons(activeScene: BaseScene) {
		let sizer = this.scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createReadRulebook())
		.addSpace()
		.add(this.createCredits())
		.addSpace()
		.add(this.createQuit(activeScene))

		return sizer
	}

	private createReadRulebook() {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Rulebook', () => {
			this.scene.scene.start('MenuScene', {menu: 'rulebook'})
		})

		return container
	}

	private createCredits() {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Credits', () => {
			this.scene.scene.start('MenuScene', {menu: 'credits'})
		})

		return container
	}

	private createQuit(activeScene: BaseScene) {
		let container = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Quit', () => {
			// Stop the other active scene
			activeScene.beforeExit()
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			this.scene.scene.start("HomeScene")
		})

		return container
	}
}
