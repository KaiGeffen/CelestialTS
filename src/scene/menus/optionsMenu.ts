import "phaser"

import Menu from './menu'
import Button from '../../lib/button'
import { Style, BBStyle, Color, Time, UserSettings, Space } from "../../settings/settings"

// TODO remove unused imports

export default class OptionsMenu extends Menu {
	constructor(scene: Phaser.Scene) {
		super(scene)

		// Add a sizer TODO

		// Slider for Volume
		let x = Space.windowWidth / 2 - 210
		let y = Space.windowHeight / 2 - 265

		let txtVolumeHint = scene.add.text(x, y, 'Volume:', Style.announcement).setOrigin(0, 0.5)

		scene['rexUI'].add.slider({
			x: Space.windowWidth / 2, y: y + 5, width: 200, height: 20, orientation: 'x',
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
			.setOrigin(0, 0.5)
			.layout()

		// Slider for Music
		y += 90
		let txtMusicHint = scene.add.text(x, y, 'Music:', Style.announcement).setOrigin(0, 0.5)

		scene['rexUI'].add.slider({
			x: Space.windowWidth / 2, y: y + 5, width: 200, height: 20, orientation: 'x',
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

		// Slider for Animation Speed
		y += 90
		let txtSpeedHint = scene.add.text(x, y, 'Speed:', Style.announcement).setOrigin(0, 0.5)

		scene['rexUI'].add.slider({
			x: Space.windowWidth / 2, y: y + 5, width: 200, height: 20, orientation: 'x',
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

		// Radio button for auto-pass
		y += 90
		let txtAutopassHint = scene.add.text(x, y, 'Autopass:', Style.announcement).setOrigin(0, 0.5)

		let radioAutopass = scene.add.circle(Space.windowWidth / 2 + 182, y + 5, 14).setStrokeStyle(4, Color.background)
		if (UserSettings._get('autopass')) {
			radioAutopass.setFillStyle(Color.cardHighlight)
		}

		radioAutopass.setInteractive()
		radioAutopass.on('pointerdown', function() {
			scene.sound.play('click')

			UserSettings._set('autopass', !UserSettings._get('autopass'))

			radioAutopass.setFillStyle((UserSettings._get('autopass')) ? Color.cardHighlight : undefined)
		})

		// Link to rulebook
		// scene.rulebookContainer = scene.createRulebook()
		y += 90
		//   let btnRulebook = new Button(scene, x, y, "Read Rulebook", function() {
		//   	scene.rulebookContainer.setVisible(true)
		// scene.sound.play('open')
		//   })
		//   	.setStyle(Style.announcement)
		//   	.setOrigin(0, 0.5)

		// Prompt asking users if they want to exit
		y += 90
		let txtExitHint = scene.add.text(x, y, 'Exit to main menu?', Style.announcement).setOrigin(0, 0.5)

		// Yes/No buttons
		y += 80
		let btnYes = new Button(scene, Space.windowWidth / 2 - 50, y, 'Yes', scene.doExit).setOrigin(1, 0.5)
		let btnNo = new Button(scene, Space.windowWidth / 2 + 50, y, 'No', scene.closeMenu, false).setOrigin(0, 0.5)

		// Custom rexUI sliders don't work in containers
		// scene.sliderVolume.setDepth(21).setVisible(false)
		// scene.sliderMusic.setDepth(21).setVisible(false)
		// scene.sliderAnimationSpeed.setDepth(21).setVisible(false)

		// Menu container which is toggled visible/not
		// scene.confirmationContainer = scene.add.container(0, 0).setDepth(20).setVisible(false)

		this.contents = [
			txtVolumeHint, txtMusicHint, txtSpeedHint,
			txtAutopassHint, radioAutopass,
			txtExitHint, btnYes, btnNo
		]
	}
}
