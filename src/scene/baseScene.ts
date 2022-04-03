import "phaser"
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from "../settings/settings"
import { addCardInfoToScene, cardInfo } from "../lib/cardImage"
import { IButtonOptions } from '../lib/buttons/icon'
import { SymmetricButtonSmall } from '../lib/buttons/backed'



export default class BaseScene extends Phaser.Scene {
	confirmationContainer: Phaser.GameObjects.Container
	rulebookContainer: Phaser.GameObjects.Container
	sliderVolume: RexUIPlugin.Slider
	sliderMusic: RexUIPlugin.Slider
	sliderAnimationSpeed: RexUIPlugin.Slider
	private btnOptions: IButtonOptions
	private btnDebug // TODO

	// Allows for typing objects in RexUI library
	rexUI: RexUIPlugin

	// Message explaining to user what they did wrong
	txtError: RexUIPlugin.BBCodeText

	// A menu is closing currently, so the main menu should not open with this esc event
	static menuClosing: boolean = false

	constructor(args) {
		super(args)
	}

	// Called at the beginning of children's create methods
	precreate(): void {
		// Remove any lingering esc event listeners for menus
		let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.removeListener('down')
		// TODO Remove
	}

	create(params = {}): void {
		// Play music
		if (UserSettings._get('musicVolume') > 0) {
			let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")
        	music.play()
		}

		// Make sure that cardInfo is above everything else
		addCardInfoToScene(this).setDepth(15)

		// Menu button
		this.btnOptions = new IButtonOptions(this, Space.windowWidth - Space.pad, Space.pad, this.openMenu()).setOrigin(1, 0).setDepth(5)

		// Sound debug menu
		// this.btnDebug = new Button(this, Space.windowWidth - Space.pad/2, 50, '♫', this.openDebugMenu).setOrigin(1, 0)
		// this.btnDebug.background.setAlpha(0) // TODO
		// this.btnDebug.txt.setAlpha(0)

	    // Error text, for when the user does something wrong they get an explanation
	    this.txtError = this.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, '', BBStyle.error)
	    	.setOrigin(0.5)
	    	.setDepth(50)
	    	.setVisible(false)

		// When esc key if pressed, toggle the menu open/closed
		let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.on('down', this.openMenu(), this)
	}

	// Alert the user that they have taken an illegal or impossible action
	errorMsgTimeout: NodeJS.Timeout
	signalError(msg: string = ''): void {
      	this.sound.play('failure')

		this.cameras.main.flash(300, 0, 0, 0.1)

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
	beforeExit(): void {
	}

	private toggleMenu(): void {
		// Don't open if a menu is currently closing
		if (BaseScene.menuClosing) {
			BaseScene.menuClosing = false
		}
		else {
			if (this.confirmationContainer.visible) {
				this.closeMenu()
			} else {
				this.openMenu()
			}
		}
	}

	private openMenu(): () => void {
		let that = this

		return function() {
			// Don't open the menu if it's open already
			if (that.scene.isActive('MenuScene')) {
				return
			}
			
			that.sound.play('open')

			that.scene.launch('MenuScene', {
				menu: 'options', 
				activeScene: that
			})

	      	// that.btnOptions.glow()TODO

			// that.confirmationContainer.setVisible(true)
			// that.sliderVolume.setVisible(true)
			// that.sliderMusic.setVisible(true)
			// that.sliderAnimationSpeed.setVisible(true)
		}
	}

	private openDebugMenu(): void {
		document.getElementById('soundFile').click()
		// new Promise((resolve, reject) => {
		// 	let fr = new FileReader()
		// 	fr.onload = _ => resolve(fr.result)

		// })
		// // let sound = this.sound.get('success')
		// this.load.audio('click', `sfx/failure.mp3`)
		// null if not found

      	// console.log(sound)
	}

	private closeMenu(): () => void {
		let that = this

		return function() {
			that.sound.play('close')

			// that.btnOptions.stopGlow()TODO

			that.confirmationContainer.setVisible(false)
			that.rulebookContainer.setVisible(false)
			that.sliderVolume.setVisible(false)
			that.sliderMusic.setVisible(false)
			that.sliderAnimationSpeed.setVisible(false)
		}
	}

	doExit(): () => void {
		let that = this

		return function() {
			that.beforeExit()
			that.scene.start("HomeScene")
		}
	}
}
