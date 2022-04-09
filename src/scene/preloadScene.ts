import "phaser"
var mobile = require('is-mobile')

import { Style, Color, Space, UserSettings, UserProgress, Url } from "../settings/settings"
import { allCards } from "../catalog/catalog"
import Server from "../server"


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
'hover',

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
	// True if could log in, false if couldn't, undefined until known
	loginStatus: boolean = undefined

	constructor() {
		super({
			key: "PreloadScene"
		})
	}

	// Load all assets used throughout the game
	preload(): void {
		// Ensure that every user setting is either set, or set it to its default value
		UserSettings._ensure()

		// this.renderSigninButton()

		this.load.path = "assets/"

		// Load each of the card and token images
		allCards.forEach( (card) => {
			this.load.image(card.name, `images/${card.name}.png`)
		})

		// Load the icon images
		this.loadIcons()

		// Load the background images
		this.loadBackgrounds()

		// Load the map images
		this.loadMap()

		// Load the avatar images
		this.loadAvatars()

		// Load in texture videos
		this.loadVideos()

		// Load all audio
		SOUNDS.forEach( (sound) => {
			this.load.audio(sound, `sfx/${sound}.mp3`)
		})
		// TODO Move to postload
		this.load.audio('background', 'music/background.mp3')
		
		// Allow for audio to be uploaded to test out different sfx
		this.enableSFXSwapping()

		// Ensure that audio plays even when tab loses focus
		this.sound.pauseOnBlur = false


		this.sound.volume = UserSettings._get('volume')

		// If the user is using mobile, ensure that the see the mobile message
		if (mobile()) {
			UserProgress.addAchievement('mobile')
		}
		
		// Add event listeners
		this.createProgressGraphics()
	}

	renderSigninButton(): void {
		let that = this
		
		// Initialize Google Auth
		gapi.load('auth2', function() {
			gapi.auth2.init({
				client_id: Url.oauth
			})
		})

		function onSuccess(user: gapi.auth2.GoogleUser): void {
			console.log('Signin succesful')

			// Communicate with server, load data on response
			let token = user.getAuthResponse().id_token

			Server.login(token, that)
		}

		function onFailure(): void {
			// TODO Add some behavior
			console.log('Failed to signin')
		}

		// Render login button
		gapi.signin2.render("signin", {
			onsuccess: onSuccess,
			onfailure: onFailure
		})
	}

	// Loads all images that are used as icons in ux
	private loadIcons(): void {
		let iconNames = [
			'AI', 'PWD', 'PVP',
			//'Breath',
			'Wins',
			'Divide',
			'Deck', 'Discard',
			'Nourish', 'Inspire',
			'Button', // TODO No Button
			'Button1', 'Button2', 'ButtonA1', 'ButtonA2', 
			'Options', 'X', 'SmallX',
			'Search', 'Underline',
			'Premade', 'CustomDeck',
			'XOut',
			'Winner', 'Loser', 'ResultStats',
			'Share',

		]

		iconNames.forEach( (s) => {
			this.load.image(`icon-${s}`, `icons/${s}.png`)
		})

		// Load any spritesheets
		this.load.spritesheet(`icon-Breath`,
			`icons/Breath.png`,
			{frameWidth: 54, frameHeight: 54})
		this.load.spritesheet(`icon-Cost`,
			`icons/Cost.png`,
			{frameWidth: 54, frameHeight: 54})
	}

	// Loads all background images
	private loadBackgrounds(): void {
		let backgroundNames = [
			'Defeat', 'Victory',
			'Match',
		]

		backgroundNames.forEach( (s) => {
			this.load.image(`bg-${s}`, `backgrounds/${s}.png`)
		})
	}

	// Loads all map images (Journey mode)
	private loadMap(): void {
		let backgroundNames = [
			'Birds',
		]

		backgroundNames.forEach( (s) => {
			this.load.image(`map-${s}`, `maps/${s}.png`)
		})
	}

	// Loads all avatar images
	private loadAvatars(): void {
		let avatarsNames = [
			'Jules', 'JulesFull',
			'Adonis', 'AdonisFull',
			'Mia', 'MiaFull',
			'Kitz', 'KitzFull',
			'Imani', 'ImaniFull',
			'Mona', 'MonaFull',
		]

		avatarsNames.forEach( (s) => {
			this.load.image(`avatar-${s}`, `avatars/${s}.png`)
		})
	}

	// Loads all video textures
	private loadVideos(): void {
		this.load.video('priorityHighlight', 'priority.mp4')
	}

	// Create the which show user how much has loaded
	private createProgressGraphics(): void {
		let that = this

		let width = 800
		let height = 100
		let x = (Space.windowWidth - width)/2
		let y = (Space.windowHeight - height)/2

		// Add graphics to show information
		let progressBox = this.add.graphics()
		.fillStyle(Color.progressBackground)
		.fillRect(x, y, width, height)
		let progressBar = this.add.graphics()

		// Add text
		let txtLoading = this.make.text({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			text: 'Loading...',
			style: Style.announcement
		}).setOrigin(0.5, 0.5)

		// Update the progress bar
		this.load.on('progress', function (value) {
			progressBar.clear()
			progressBar.fillStyle(Color.progressFill, 1)
			progressBar.fillRect(x + Space.pad, y + Space.pad, (width - Space.pad*2) * value, height - Space.pad*2)
		})

		let startWhenLoginComplete = function() {
			that.scene.start('HomeScene')
		}
		this.load.on('complete', function () {
			startWhenLoginComplete()
		})
	}

	// Enable the file element to swap audio files for testing out various sfx
	private enableSFXSwapping(): void {
		let that = this

		let element = document.createElement('input')
		element.type = 'file'
		element.id = 'soundFile'
		element.accept = 'audio/*'
		element.hidden = true

		document.getElementById('game').appendChild(element)

		element.onchange = e => {
			let file = e.target['files'][0]
			
			let name = file.name.split('.')[0]

			// Load the audio 
			let reader = new FileReader()
			reader.onload = function(ev) {
				// Remove the old sfx
				that.sound.removeByKey(name)

				// Add in the new sfx
				that.sound['decodeAudio'](name, ev.target.result)
			}
			reader.readAsArrayBuffer(file)
		}
	}
}