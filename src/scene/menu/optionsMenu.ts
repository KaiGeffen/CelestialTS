import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


import Menu from './menu'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import { SymmetricButtonSmall } from '../../lib/buttons/backed'


const width = 400

export default class OptionsMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		// Make a fixed height sizer
		let panel = this.createSizer(scene)

		this.createContent(scene, panel)

		panel.layout()
	}

	onClose(): void {
		
	}

	private createSizer(scene: Phaser.Scene)  {
		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			// width: width,
			// height: 500,
			space: {
				left: Space.pad/2,
				right: Space.pad/2,
				top: Space.pad/2,
				bottom: Space.pad/2,
				item: Space.pad/2,
				line: Space.pad/2,
			},
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		return panel
	}

	private createContent(scene: Phaser.Scene, panel) {
		panel.add(this.createTitle(scene))
		.addNewLine()

		panel.add(this.createVolume(scene))
		.addNewLine()

		panel.add(this.createMusic(scene))
		.addNewLine()

		panel.add(this.createSpeed(scene))
		.addNewLine()
		
		panel.add(this.createAutopass(scene))
		.addNewLine()

		panel.add(this.createButtons(scene))
	}

	private createTitle(scene: Phaser.Scene) {
		let sizer = scene['rexUI'].add.sizer({width: width})

		let txt = scene.add.text(0, 0, 'Options', Style.announcement)
		sizer.addSpace()
		.add(txt)
		.addSpace()

		return sizer
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
		let txt = scene.add.text(0, 0, 'Yes!', Style.basic)
		sizer.add(txt)

		return sizer
	}

	// Create the buttons at the bottom which navigate to other scenes/menus
	private createButtons(scene: Phaser.Scene) {
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
		.add(this.createQuit(scene))

		return sizer
	}

	private createReadRulebook(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'Rulebook', () => {
			scene.scene.start('MenuScene', {menu: 'rulebook'})
		})

		return container
	}

	private createCredits(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'Credits', () => {
			scene.scene.start('MenuScene', {menu: 'credits'})
		})

		return container
	}

	private createQuit(scene: Phaser.Scene) {
		let container = new ContainerLite(scene, 0, 0, 100, 50)

		new SymmetricButtonSmall(container, 0, 0, 'Quit', () => {
			console.log('Quit to main menu')
		})

		return container
	}
}
