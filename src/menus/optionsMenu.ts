import "phaser"

import Menu from './menu'
import Button from '../lib/button'
import { Style, BBStyle, Color, Time, UserSettings, Space } from "../settings/settings"

// TODO remove unused imports

export default class OptionsMenu extends Menu {
	constructor(scene: Phaser.Scene) {
		super(scene)

		let sizer = scene['rexUI'].add.fixWidthSizer({
			x: Space.windowWidth / 2,
			y: Space.windowHeight / 2,
			width: 400
		})

		sizer.addBackground(scene.add.rectangle(0,0, 300, 200, 0xff00ff))

		this.addVolume(scene, sizer)
		this.addMusic(scene, sizer)
		this.addSpeed(scene, sizer)
		this.addAutoPass(scene, sizer)

		sizer.layout()

		// Link to rulebook
		// scene.rulebookContainer = scene.createRulebook()
		//   let btnRulebook = new Button(scene, x, y, "Read Rulebook", function() {
		//   	scene.rulebookContainer.setVisible(true)
		// scene.sound.play('open')
		//   })
		//   	.setStyle(Style.announcement)
		//   	.setOrigin(0, 0.5)

		// Prompt asking users if they want to exit
		// let txtExitHint = scene.add.text(x, y, 'Exit to main menu?', Style.announcement).setOrigin(0, 0.5)

		// Yes/No buttons
		// let btnYes = new Button(scene, Space.windowWidth / 2 - 50, y, 'Yes', scene.doExit).setOrigin(1, 0.5)
		// let btnNo = new Button(scene, Space.windowWidth / 2 + 50, y, 'No', scene.closeMenu, false).setOrigin(0, 0.5)

		// Custom rexUI sliders don't work in containers
		// scene.sliderVolume.setDepth(21).setVisible(false)
		// scene.sliderMusic.setDepth(21).setVisible(false)
		// scene.sliderAnimationSpeed.setDepth(21).setVisible(false)

		// Menu container which is toggled visible/not
		// scene.confirmationContainer = scene.add.container(0, 0).setDepth(20).setVisible(false)

		// this.contents = [
		// 	txtVolumeHint, txtMusicHint, txtSpeedHint,
		// 	txtAutopassHint, radioAutopass,
		// 	txtExitHint, btnYes, btnNo
		// ]
	}

	private addVolume(scene: Phaser.Scene, sizer): void {
		let txt = scene.add.text(0, 0, 'Volume:', Style.announcement).setOrigin(0, 0.5)
		sizer.add(txt)

		// Add slider TODO length in settings
		let slider = scene['rexUI'].add.slider({
			x: 0, y: 0, width: 200, height: 20, orientation: 'x',
			value: scene.sound.volume,

			track: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
			indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
			thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

			valuechangeCallback: function(value) {
				UserSettings._set('volume', value)
				scene.sound.volume = value
			},
			space: {
				top: 4,
				bottom: 4
			},
			input: 'drag',
		})
			.setOrigin(1, 0.5)
			.layout()

		sizer.add(slider, {
			align: 'right'
		})
	}

	private addMusic(scene: Phaser.Scene, sizer): void {
		let txt = scene.add.text(0, 0, 'Music:', Style.announcement).setOrigin(0, 0.5)
		sizer.add(txt)

		// Add slider TODO length in settings
		let slider = scene['rexUI'].add.slider({
			x: 0, y: 0, width: 200, height: 20, orientation: 'x',
			value: UserSettings._get('musicVolume'),

			track: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
			indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
			thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

			valuechangeCallback: function(value) {
				UserSettings._set('musicVolume', value)

				let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")

				music.volume = value
				music.play()
			},
			space: {
				top: 4,
				bottom: 4
			},
			input: 'drag',
		})
			.setOrigin(0, 0.5)
			.layout()

		sizer.add(slider, {
			align: 'right'
		})
	}

	private addSpeed(scene: Phaser.Scene, sizer): void {
		let txt = scene.add.text(0, 0, 'Speed:', Style.announcement).setOrigin(0, 0.5)
		sizer.add(txt)

		// Add slider TODO length in settings
		let slider = scene['rexUI'].add.slider({
			x: 0, y: 0, width: 200, height: 20, orientation: 'x',
			value: UserSettings._get('animationSpeed'),

			track: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
			indicator: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
			thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

			valuechangeCallback: function(value) {
				UserSettings._set('animationSpeed', value)
			},
			space: {
				top: 4,
				bottom: 4
			},
			input: 'drag',
		})
			.setOrigin(0, 0.5)
			.layout()

		sizer.add(slider)
	}

	private addAutoPass(scene: Phaser.Scene, sizer): void {
		let txt = scene.add.text(0, 0, 'Autopass:', Style.announcement).setOrigin(0, 0.5)
		sizer.add(txt)

		// Add slider TODO length in settings
		let radio = scene.add.circle(0, 0, 14).setStrokeStyle(4, Color.background)
		if (UserSettings._get('autopass')) {
			radio.setFillStyle(Color.cardHighlight)
		}

		radio.setInteractive()
		radio.on('pointerdown', function() {
			scene.sound.play('click')

			UserSettings._set('autopass', !UserSettings._get('autopass'))

			radio.setFillStyle((UserSettings._get('autopass')) ? Color.cardHighlight : undefined)
		})

		sizer.add(radio, {
			align: 'right'
		})
	}
}
