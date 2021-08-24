import "phaser"

import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings } from "../settings"
import { allCards } from "../catalog/catalog"

const SOUNDS = [
'success',
'failure',
'click',
'open',
'close',
'play',
'pass',
'draw',
'discard',
'create',
'shuffle',
'resolve',
'win',
'lose',
'tie',

'build',
'inspire',
'nourish',
'starve',

'meow',
'yell',
'bone_snap',
'bird',
'drown',
'fire',
'reset',
'crowd',
'sarcophagus'
]


export default class PreloadClass extends Phaser.Scene {
	constructor() {
		super({
			key: "PreloadScene"
		})
	}

	// Load all assets used throughout the game
	preload(): void {

		this.load.path = "assets/"

		// Load each of the card and token images
		allCards.forEach( (card) => {
			this.load.image(card.name, `images/${card.name}.png`)
		})

		// Load the icon images
		this.loadIcons()

		// Load all audio
		SOUNDS.forEach( (sound) => {
			this.load.audio(sound, `sfx/${sound}.wav`)
		})
		this.load.audio('background', 'music/background.wav')

		// Ensure that audio plays even when tab loses focus
		this.sound.pauseOnBlur = false

		// Ensure that every user setting is either set, or set it to its default value
		ensureUserSettings()

		this.sound.volume = UserSettings._get('volume')

		// Add event listeners
		this.createProgressGraphics()
	}

	// Loads all images that are used as icons in ux
	private loadIcons(): void {
		let iconNames = [
			'AI', 'PWD', 'PVP',
			'Basics',
			'Anubis', 'Robots', 'Stalker',
			'Crypt', 'Bastet', 'Horus',
			'Victory!', 'Defeat!',
			'Draft'
		]

		iconNames.forEach( (s) => {
			this.load.image(`icon-${s}`, `icons/${s}.png`)
		})
	}

	// Create the graphics which show user how much has loaded
	private createProgressGraphics(): void {
		let that = this

		let width = 800
		let height = 100
		let x = (Space.windowWidth - width)/2
		let y = (Space.windowHeight - height)/2

		// Add graphics to show information
		let progressBox = this.add.graphics()
		.fillStyle(ColorSettings.progressFill)
		.fillRect(x, y, width, height)
		let progressBar = this.add.graphics()

		// Add text
		let txtLoading = this.make.text({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			text: 'Loading...',
			style: StyleSettings.announcement
		}).setOrigin(0.5, 0.5)

		// Update the progress bar
		this.load.on('progress', function (value) {
			progressBar.clear()
			progressBar.fillStyle(0xffffff, 1)
			progressBar.fillRect(x + Space.pad, y + Space.pad, (width - Space.pad*2) * value, height - Space.pad*2)
		})

		this.load.on('complete', function () {
			that.scene.start('WelcomeScene')
		})
	}
}