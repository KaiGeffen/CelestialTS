import "phaser"
var mobile = require('is-mobile')

import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings, UrlSettings } from "../settings"
import { allCards } from "../catalog/catalog"
import MessageManager from "../lib/message"
import AccountManager from "../lib/accountManager"
import Authentication from "../authenticate"


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
		ensureUserSettings()

		this.renderSigninButton()

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

		this.sound.volume = UserSettings._get('volume')

		// If the user is using mobile, ensure that the see the mobile message
		if (mobile()) {
			MessageManager.addUnreadMessage('mobile')
		}
		
		// Add event listeners
		this.createProgressGraphics()
	}

	renderSigninButton(): void {
		// Initialize Google Auth
		gapi.load('auth2', function() {
			gapi.auth2.init({
				client_id: UrlSettings.oauth
			})
		})

		function onSuccess(user: gapi.auth2.GoogleUser): void {
			console.log('Signin succesful')

			// Communicate with server, load data on response
			let token = user.getAuthResponse().id_token
			console.log(token)

			new Authentication(token)


			
			// let xhr = new XMLHttpRequest()
			// let loc = window.location
			// console.log(loc.host)
			// console.log(loc.pathname)
			// let s = `tokensignin`
			// xhr.open('POST', s)
			// console.log(xhr)
			// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
			// xhr.onload = function() {
			//   console.log('Got user data: ' + xhr.responseText)
			// }
			// xhr.send('idtoken=' + id_token)
		}

		function onFailure(): void {
			// TODO Add some behavior
			console.log('Failed to signin')
		}

		// Render login button
		gapi.signin2.render("signin", {
			'onsuccess': onSuccess,
			'onfailure': onFailure
		})
	}

	// Attempt to log in the user, starts an asynch request which sets the loginStatus param when completed
	private attemptLogin(): void {
		const hashParams = new URLSearchParams(window.location.hash.substr(1))
	    const accessToken = hashParams.get('access_token')

	    // const cmd = 'curl -X GET "https://api.digitalocean.com/v2/droplets -H "Authorization: Bearer ' + accessToken + '"'

	    let xmlHttp = new XMLHttpRequest()

	    // When the request returns, set the login status
	    let that = this
	    xmlHttp.onloadend = function() {
	    	let loginSuccessful = xmlHttp.statusText === "OK"
	    	if (loginSuccessful) {
		    	let response = JSON.parse(xmlHttp.response)['account']
		    	console.log(response)
		    	// console.log(response.get('foo'))

		    	// console.log(response)
		    	console.log(response['uuid'])
		    	// TODO Load the values for this account
		    	// new AccountManager(xmlHttp.responseText)
	    	}

	    	that.loginStatus = loginSuccessful
	    }

	    xmlHttp.open("GET", "https://api.digitalocean.com/v2/account")
	    xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken)
	    xmlHttp.send()
	   	// TODO Remove this
	    console.log(xmlHttp)
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
		.fillStyle(ColorSettings.progressBackground)
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
			progressBar.fillStyle(ColorSettings.progressFill, 1)
			progressBar.fillRect(x + Space.pad, y + Space.pad, (width - Space.pad*2) * value, height - Space.pad*2)
		})

		let startWhenLoginComplete = function() {
			that.scene.start('WelcomeScene')
		}
		this.load.on('complete', function () {
			startWhenLoginComplete()
		})
	}
}