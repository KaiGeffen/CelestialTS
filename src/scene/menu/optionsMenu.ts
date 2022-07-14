import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


import Menu from './menu'
import BaseScene from '../../scene/baseScene'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'


const width = 550

export default class OptionsMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		this.createContent(scene, panel, activeScene)

		panel.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: width + Space.padSmall*2,

			space: {
				// left: Space.padSmall,
				// right: Space.padSmall,
				bottom: Space.padSmall,
				item: Space.padSmall,
				line: Space.padSmall,
			},
		})
		.addBackground(scene.add.image(0, 0, 'bg-Texture').setInteractive())

		return panel
	}

	private createContent(scene: Phaser.Scene, panel, activeScene: BaseScene) {
		panel.add(this.createHeader('Options', width + Space.padSmall*2))
		.addNewLine()

		const padding = {padding: {left: Space.padSmall, right: Space.padSmall}}

		panel.add(this.createVolume(scene), padding)
		.addNewLine()

		panel.add(this.createMusic(scene), padding)
		.addNewLine()

		panel.add(this.createSpeed(scene), padding)
		.addNewLine()
		
		panel.add(this.createAutopass(scene), padding)
		.addNewLine()

		panel.add(this.createButtons(scene, activeScene), padding)
	}

	private createVolume(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Volume:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('volume'),
            valuechangeCallback: function (value) {
            	UserSettings._set('volume', value)
                scene.sound.volume = value
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createMusic(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Music:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
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

	private createSpeed(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtSpeedHint = scene.add.text(0, 0, 'Speed:', Style.basic)
		sizer.add(txtSpeedHint)
		sizer.addSpace()
		
		let slider = scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
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

	private createAutopass(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txtVolumeHint = scene.add.text(0, 0, 'Autopass:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		const s = UserSettings._get('autopass') ? 'Enabled' : 'Disabled'
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
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
	private createButtons(scene: Phaser.Scene, activeScene: BaseScene) {
		let sizer = scene['rexUI'].add.sizer({
			width: width,
			space: {
				item: Space.pad
			}
		})

		sizer
		.add(this.createReadRulebook(scene))
		.addSpace()
		.add(this.createCredits(scene))
		.addSpace()
		.add(this.createQuit(scene, activeScene))

		return sizer
	}

	private createReadRulebook(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Rulebook', () => {
			scene.scene.start('MenuScene', {menu: 'rulebook'})
		})

		return container
	}

	private createCredits(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Credits', () => {
			scene.scene.start('MenuScene', {menu: 'credits'})
		})

		return container
	}

	private createQuit(scene: Phaser.Scene, activeScene: BaseScene) {
		let container = new ContainerLite(scene, 0, 0, Space.smallButtonWidth, 50)

		new Buttons.Basic(container, 0, 0, 'Quit', () => {
			// Stop the other active scene
			activeScene.beforeExit()
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			scene.scene.start("HomeScene")
		})

		return container
	}
}
