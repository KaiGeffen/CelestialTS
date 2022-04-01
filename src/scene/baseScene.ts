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

		// TODO Implement Menu scene
		// this.scene.launch('MenuScene', {menu: 'options'})
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
		esc.on('down', this.toggleMenu, this)
		
		this.createMenu()
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

	private createMenu(): void {
		let that = this

		// Menu container which is toggled visible/not
		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)

		// Invisible background, which closes menu when clicked
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.closeMenu())

		// Visible background, which does nothing when clicked
		let visibleBackground = this.rexUI.add.roundRectangle(Space.windowWidth/2, Space.windowHeight/2, 500, 630, 30, Color.menuBackground).setAlpha(0.95)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, Color.menuBorder, 1)

		// Slider for Volume
		let x = Space.windowWidth/2 - 210
		let y = Space.windowHeight/2 - 265

		let txtVolumeHint = this.add.text(x, y, 'Volume:', Style.announcement).setOrigin(0, 0.5)

		this.sliderVolume = this.rexUI.add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

            valuechangeCallback: function (value) {
            	UserSettings._set('volume', value)
                that.sound.volume = value
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag',
        })
        .setValue(this.sound.volume)
        .setOrigin(0, 0.5)
        .layout()
        
        // Slider for Music
        y += 90
        let txtMusicHint = this.add.text(x, y, 'Music:', Style.announcement).setOrigin(0, 0.5)

		this.sliderMusic = this.rexUI.add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

            valuechangeCallback: function (value) {
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
        .setValue(UserSettings._get('musicVolume'))
        .setOrigin(0, 0.5)
        .layout()

        // Slider for Animation Speed
        y += 90
        let txtSpeedHint = this.add.text(x, y, 'Speed:', Style.announcement).setOrigin(0, 0.5)

		this.sliderAnimationSpeed = this.rexUI.add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),

            valuechangeCallback: function (value) {
            	UserSettings._set('animationSpeed', value)
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag',
        })
        .setValue(UserSettings._get('animationSpeed'))
        .setOrigin(0, 0.5)
        .layout()

        // Radio button for auto-pass
        y += 90
        let txtAutopassHint = this.add.text(x, y, 'Autopass:', Style.announcement).setOrigin(0, 0.5)

		let radioAutopass = this.add.circle(Space.windowWidth/2 + 182, y + 5, 14).setStrokeStyle(4, Color.background)
		if (UserSettings._get('autopass')) {
			radioAutopass.setFillStyle(Color.cardHighlight)
		}

		radioAutopass.setInteractive()
		radioAutopass.on('pointerdown', function() {
			that.sound.play('click')

			UserSettings._set('autopass', !UserSettings._get('autopass'))

			radioAutopass.setFillStyle((UserSettings._get('autopass')) ? Color.cardHighlight : undefined)
		})

		this.confirmationContainer.add([invisibleBackground, visibleBackground,
			// txtKeywordHint, radio,
			txtVolumeHint, txtMusicHint, txtSpeedHint,
			txtAutopassHint, radioAutopass,
			])
        
        // Link to rulebook
        this.rulebookContainer = this.createRulebook()
        y += 90
        let btnRulebook = new SymmetricButtonSmall(this.confirmationContainer, x, y, "Read Rulebook", function() {
        	that.rulebookContainer.setVisible(true)
	    	that.sound.play('open')
        })
        	.setOrigin(0, 0.5)

		// Prompt asking users if they want to exit
		y += 90
		let txtExitHint = this.add.text(x, y, 'Exit to main menu?', Style.announcement).setOrigin(0, 0.5)
		this.confirmationContainer.add(txtExitHint)

		// Yes/No buttons
		y += 80
		let btnYes = new SymmetricButtonSmall(this.confirmationContainer, Space.windowWidth/2 - 50, y, 'Yes', this.doExit()).setOrigin(1, 0.5)
		let btnNo = new SymmetricButtonSmall(this.confirmationContainer, Space.windowWidth/2 + 50, y, 'No', this.closeMenu()).setOrigin(0, 0.5)

		// Custom rexUI sliders don't work in containers
		this.sliderVolume.setDepth(21).setVisible(false)
		this.sliderMusic.setDepth(21).setVisible(false)
		this.sliderAnimationSpeed.setDepth(21).setVisible(false)
	}

	private createRulebook(): any {
		let container = this.add.container(0, 0).setVisible(false).setDepth(30)

	    let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.0)
	    .setOrigin(0)
	    invisibleBackground.setInteractive().on('pointerdown', function() {
	    	container.setVisible(false)
	    	this.sound.play('close')
	    }, this)

		let text = 
`>>> SECTIONS
Overview
Start of match
Start phase
Action phase
End phase
Winning the match
Drawing cards
Precedence
FAQ

>>> OVERVIEW
Celestial is a game in which 2 players compete to win 5 rounds before their opponent by playing cards face-down from their hand to the 'Story' in front of them.

Once both players are done adding cards to the Story, all cards are revealed and their points are totaled. The player with the higher score wins that round.

Cards have a variety of effects, such as: Revealing, creating, transforming, drawing, discarding, and removing from the game other cards. Use all of this to your advantage, and predict what your opponent is planning, in order to dominate at Celestial.

Each player brings a deck of any 15 cards. If they would draw but their deck is empty, their discard pile is shuffled to form a new deck.

>>> START OF MATCH
Each player shuffles their 15 card deck.
Priority (The player who acts first) is determined at random at this time, and is known to both players.
Each player draws 3 cards and is prompted to mulligan, both players do this at the same time, and know when their opponent's mulligan is complete.

To mulligan, a player selects any number of the 3 cards from their starting hand. They then draw that many cards from their deck, and shuffle away the cards that they selected. Neither player knows which or how many cards their opponent chooses to mulligan.

Once both players have mulliganed, the first round begins.
Each round has the following structure: start phase, action phase, end phase.

>>> START PHASE
In the start phase, the following things occur in the following order:
* Any 'start of round' effects trigger (ex: Sun).
* If one player has won more rounds than the other, that player receives priority. Otherwise, priority is determined at random.
* Each player's maximum mana increases by 1 if it is less than 10.
* Each player's current mana is set to their maximum mana.
* Each player draws 2 cards.

>>> ACTION PHASE
During the action phase, the player with priority can either pass, or play a card from their hand (Assuming they have sufficient mana to pay for it).
If they pass, their opponent is given priority.
If they play a card, they pay mana from their current mana equal to that card's cost.
The card then moves onto the story as the rightmost addition.
At this time, any 'when played' effects of the card activate (ex: Night Vision).
Their opponent is then given priority.
The action phase ends when both players pass in a row.
During this phase, each player cannot see the cards their opponent has played.

>>> END PHASE
During the end phase, cards in the story resolve from left to right.
When a card resolves, it adds its points to its owner's score for the round, then its effect occurs, then it moves to its owner's discard pile.
Once all cards in the story have resolved, if a player has a positive score that is greater than their opponent's, they are awarded a round win.

>>> WINNING THE MATCH
Once a player has done either of the following, that player wins the match.
* Win at least 5 rounds, and have won at least 2 more rounds than their opponent.
* Win 10 rounds.

>>> DRAWING CARDS
When a player 'draws a card' they do the following:
If they have 6 cards in hand, they skip their draw. Otherwise, they take the top card of their deck and add it to their hand as the rightmost card. If their deck is empty, their discard pile is shuffled to become their new deck.

>>> PRECEDENCE
Whenever a card would be selected from any zone (ex: Sarcophagus taking a card from your discard pile, or tutor drawing a card) the following system determines which card gets selected:
* First the deck is traversed from top to bottom, and any card meeting the conditions is picked.
* Then the discard pile is traversed from top to bottom, and any card meeting the conditions is picked.
* If no cards are picked this way, the effect does nothing.

>>> FAQ
Is my deck in the order that I see when hovering over it?
No, the true order of your deck is hidden from you. The order you see is sorted by cost.

Can cards that reset (ex: Hurricane) be worth points if they are Nourished?
No, the card contributes points first, then its effect resets your points to 0.

How is the Inspire trait different than Inspired?
Cards give you Inspire the round that they resolve, which in the Start Phase changes to that much Inspired and reflects the extra mana you have gained for that round.

Do Nourish and Starve cancel each other out?
They do not; you can have both Nourish and Starve at the same time.`
	    let rulebook = this.add['rexInputText'](
	    	Space.windowWidth/2, Space.windowHeight/2, Space.windowWidth*7/8, Space.windowHeight*7/8, {
	    		type: 'textarea',
	    		text: text,
	    		fontFamily: Style.basic.fontFamily,
	    		fontSize: Style.basic.fontSize,
	    		color: Color.rulebookText,
	    		border: 3,
	    		borderColor: '#000',
	    		backgroundColor: Color.rulebookBackground,
	    		id: 'rulebook',
	    		readOnly: true
	    	})
	    .setOrigin(0.5)

	    return container.add([rulebook, invisibleBackground])
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
			that.sound.play('open')

	      	// that.btnOptions.glow()TODO

			that.confirmationContainer.setVisible(true)
			that.sliderVolume.setVisible(true)
			that.sliderMusic.setVisible(true)
			that.sliderAnimationSpeed.setVisible(true)
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
