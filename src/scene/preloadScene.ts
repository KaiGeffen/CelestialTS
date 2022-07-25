import 'phaser'
import Loader from '../loader/loader'
import Server from '../server'
import { Color, Mobile, Space, Style, Url, UserProgress, UserSettings } from '../settings/settings'


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

		this.renderSigninButton()

		// Gain access to chart plugin
		this.load.script('chartjs', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.8.0/chart.min.js')

		// Load all of the assets
		Loader.loadAll(this)

		// Ensure that audio plays even when tab loses focus
		this.sound.pauseOnBlur = false

		this.sound.volume = UserSettings._get('volume')

		// If the user is using mobile, ensure that the see the mobile message
		if (Mobile) {
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

			// TODO
			// Server.login(token, that)
		}

		function onFailure(): void {
			// TODO Add some behavior
			console.log('Failed to signin')
		}

		// Render login button
		gapi.signin2.render("signin", {
			// longtitle: true,
			width: Space.smallButtonWidth,
			height: Space.smallButtonHeight,
			onsuccess: onSuccess,
			onfailure: onFailure
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
			that.scene.start('HomeScene')
		}
		this.load.on('complete', function () {
			startWhenLoginComplete()
		})
	}
}