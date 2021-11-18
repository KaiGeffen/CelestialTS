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

		this.load.path = "assets/"

		// Load each of the card and token images
		allCards.forEach( (card) => {
			this.load.image(card.name, `images/${card.name}.png`)
		})

		// Load the icon images
		this.loadIcons()

		// Load the background images
		this.loadBackgrounds()

		// Load all audio
		SOUNDS.forEach( (sound) => {
			this.load.audio(sound, `sfx/${sound}.wav`)
		})
		// TODO Move to postload
		this.load.audio('background', 'music/background.mp3')

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

	// Load all assets that are not critical
	postload(): void {
		this.renderSigninButton()
	}

	renderSigninButton(): void {
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

			Server.login(token)

			// Send the server all of users decks before closing the page
			window.onbeforeunload = function(evt) {
				Server.sendDecks(UserSettings._get('decks'))

				// Cancel the event (if necessary)
				// evt.preventDefault()

				// Google Chrome requires returnValue to be set
				evt.returnValue = ''

				return null
			}
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
			'Basics',
			'Anubis', 'Robots', 'Stalker',
			'Lord', 'Bastet', 'Horus',
			'Exit', 'Retry', 'Review',
			'Draft'
		]

		iconNames.forEach( (s) => {
			this.load.image(`icon-${s}`, `icons/${s}.png`)
		})
	}

	// Loads all background images
	private loadBackgrounds(): void {
		let backgroundNames = [
			'Defeat', 'Victory',
		]

		backgroundNames.forEach( (s) => {
			this.load.image(`bg-${s}`, `backgrounds/${s}.png`)
		})
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
			that.scene.start('WelcomeScene')
		}
		this.load.on('complete', function () {
			that.postload()
			startWhenLoginComplete()
		})
	}
}