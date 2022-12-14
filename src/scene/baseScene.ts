import "phaser"
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from "../settings/settings"
import Button from '../lib/buttons/button'
import Icons from '../lib/buttons/icons'
import Hint from '../lib/hint'
import Server from '../server'


export default class BaseScene extends Phaser.Scene {
	private btnOptions: Button

	// Allows for typing objects in RexUI library
	rexUI: RexUIPlugin

	// Message explaining to user what they did wrong
	txtError: RexUIPlugin.BBCodeText

	// Text explaining whatever the user is hovering over
	hint: Hint

	// The last scene before this one
	private lastScene: string

	constructor(args) {
		super(args)
		this.lastScene = args.lastScene
	}

	create(params = {}): void {
		this.hint = new Hint(this)

		// Play music
		if (UserSettings._get('musicVolume') > 0) {
			let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")
        	music.play()
        	music.volume = UserSettings._get('musicVolume')
		}

		// Menu button
		this.btnOptions = new Icons.Options(this, Space.windowWidth - Space.pad, Space.pad, this.openMenu())
		.setOrigin(1, 0)
		.setDepth(10)
		.setNoScroll()

	    // Error text, for when the user does something wrong they get an explanation
	    this.txtError = this.createErrorText()

		// When esc key is pressed, toggle the menu open/closed
		let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.on('down', this.openMenu(), this)

		// TODO For testing purposed
		// When \ key is pressed, toggle the menu open/closed
		const devMode = new URLSearchParams(window.location.search).has('dev')
		if (devMode) {
			let zeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO)
			zeroKey.on('down', () => {
				console.log('Trying to close the websocket connection')
				console.log(Server.close())
			})
		}

	}

	private createHintText(): RexUIPlugin.BBCodeText {
		let txt = this.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.error) // TODO
	    	.setOrigin(0.5)
	    	.setDepth(40)
	    	// .setVisible(false)

	    this.input.on('pointermove', (pointer) => {
	    	txt.copyPosition(pointer.position)
	    })

	    return txt
	}

	private createErrorText(): RexUIPlugin.BBCodeText {
		return this.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, '', BBStyle.error)
	    	.setOrigin(0.5)
	    	.setDepth(50)
	    	.setVisible(false)
	}

	// Alert the user that they have taken an illegal or impossible action
	errorMsgTimeout: NodeJS.Timeout
	signalError(msg: string = ''): void {
      	this.sound.play('failure')

		// this.cameras.main.flash(300, 0, 0, 0.1)

		this.txtError
			.setText(`[stroke=black]${msg}[/stroke]`)
			.setVisible(true)

		// Remove previous timeout, create a new one
		if (this.errorMsgTimeout !== undefined) {
			clearTimeout(this.errorMsgTimeout)
		}

		let that = this
		this.errorMsgTimeout = setTimeout(function() { that.txtError.setText('').setVisible(false) }, Time.errorMsgTime())
	}

	// Overwritten by the scenes that extend this
	beforeExit(): void {}

	private openMenu(): () => void {
		let that = this

		return function() {
			// TODO This check for multiple open menus should be handled in menuScene.ts

			// Don't open the menu if it's open already
			if (that.scene.isActive('MenuScene')) {
				return
			}

			that.scene.launch('MenuScene', {
				menu: 'options',
				activeScene: that
			})
		}
	}

	doExit(): () => void {
		let that = this

		return function() {
			that.beforeExit()
			that.scene.start("HomeScene")
		}
	}

	// Go back to the last scene
	// Return whether a last scene was saved
	doBack() {
		if (this.lastScene === undefined) {
			throw 'Last scene is undefined'
		}
		else {
			this.beforeExit()
			this.scene.start(this.lastScene)
		}
	}
}
