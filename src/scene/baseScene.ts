import "phaser"
import { StyleSettings, FontSettings, ColorSettings, UserSettings, Space } from "../settings"
import { addCardInfoToScene, cardInfo } from "../lib/cardImage"
import Button from "../lib/button"


var music: Phaser.Sound.BaseSound



export default class BaseScene extends Phaser.Scene {
	confirmationContainer: Phaser.GameObjects.Container
	rulebookContainer: Phaser.GameObjects.Container
	sliderVolume: any
	sliderMusic: any
	sliderAnimationSpeed: any
	private btnMenu: Button

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
	}

	create(): void {
		// Add music if it doesn't exist
		if (music === undefined) {
			// todo
			music = this.sound.add('background', {volume: UserSettings._get('musicVolume'), loop: true})
			music.play()
		}

		// Make sure that cardInfo is above everything else
		addCardInfoToScene(this).setDepth(15)

		// Menu button
		this.btnMenu = new Button(this, Space.windowWidth - Space.pad/2, 0, '⚙', this.openMenu).setOrigin(1, 0)

		// When esc key if pressed, toggle the menu open/closed
		let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
		esc.on('down', this.toggleMenu, this)
		
		this.createMenu()
	}

	private createMenu(): void {
		let that = this

		// Invisible background, which closes menu when clicked
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.closeMenu, this)

		// Visible background, which does nothing when clicked
		let visibleBackground = this.add['rexRoundRectangle'](Space.windowWidth/2, Space.windowHeight/2, 500, 630, 30, ColorSettings.menuBackground).setAlpha(0.95)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, ColorSettings.menuBorder, 1)

		// Slider for Volume
		let x = Space.windowWidth/2 - 210
		let y = Space.windowHeight/2 - 265

		let txtVolumeHint = this.add.text(x, y, 'Volume:', StyleSettings.announcement).setOrigin(0, 0.5)

		this.sliderVolume = this['rexUI'].add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',
			value: this.sound.volume,

            track: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, ColorSettings.sliderIndicator),
            thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.sliderThumb),

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
        .setOrigin(0, 0.5)
        .layout()
        
        // Slider for Music
        y += 90
        let txtMusicHint = this.add.text(x, y, 'Music:', StyleSettings.announcement).setOrigin(0, 0.5)

		this.sliderMusic = this['rexUI'].add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',
			value: UserSettings._get('musicVolume'),

            track: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, ColorSettings.sliderIndicator),
            thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.sliderThumb),

            valuechangeCallback: function (value) {
            	UserSettings._set('musicVolume', value)

            	music.play({
            		volume: value,
            		// delay: 0.03,
            		seek: music['seek'],
            		loop: true,
            	})
            	music.resume()
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
        let txtSpeedHint = this.add.text(x, y, 'Speed:', StyleSettings.announcement).setOrigin(0, 0.5)

		this.sliderAnimationSpeed = this['rexUI'].add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',
			value: UserSettings._get('animationSpeed'),

            track: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, ColorSettings.sliderIndicator),
            thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.sliderThumb),

            valuechangeCallback: function (value) {
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
        let txtAutopassHint = this.add.text(x, y, 'Autopass:', StyleSettings.announcement).setOrigin(0, 0.5)

		let radioAutopass = this.add.circle(Space.windowWidth/2 + 182, y + 5, 14).setStrokeStyle(4, ColorSettings.background)
		if (UserSettings._get('autopass')) {
			radioAutopass.setFillStyle(ColorSettings.cardHighlight)
		}

		radioAutopass.setInteractive()
		radioAutopass.on('pointerdown', function() {
			that.sound.play('click')

			UserSettings._set('autopass', !UserSettings._get('autopass'))

			radioAutopass.setFillStyle((UserSettings._get('autopass')) ? ColorSettings.cardHighlight : undefined)
		})
        
        // Link to rulebook
        this.rulebookContainer = this.createRulebook()
        y += 90
        let btnRulebook = new Button(this, x, y, "Read Rulebook", function() {
        	this.rulebookContainer.setVisible(true)
	    	this.sound.play('open')
        })
        	.setStyle(StyleSettings.announcement)
        	.setOrigin(0, 0.5)

		// Prompt asking users if they want to exit
		y += 90
		let txtExitHint = this.add.text(x, y, 'Exit to main menu?', StyleSettings.announcement).setOrigin(0, 0.5)

		// Yes/No buttons
		y += 80
		let btnYes = new Button(this, Space.windowWidth/2 - 50, y, 'Yes', this.doExit).setOrigin(1, 0.5)
		let btnNo = new Button(this, Space.windowWidth/2 + 50, y, 'No', this.closeMenu, false).setOrigin(0, 0.5)

		// Custom rexUI sliders don't work in containers
		this.sliderVolume.setDepth(21).setVisible(false)
		this.sliderMusic.setDepth(21).setVisible(false)
		this.sliderAnimationSpeed.setDepth(21).setVisible(false)

		// Menu container which is toggled visible/not
		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)

		this.confirmationContainer.add([invisibleBackground, visibleBackground,
			// txtKeywordHint, radio,
			txtVolumeHint, txtMusicHint, txtSpeedHint,
			txtAutopassHint, radioAutopass,
			btnRulebook,
			txtExitHint, btnYes, btnNo
			])
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
Start of match
Start phase
Action phase
End phase
Winning the match
Drawing cards
Precedence
FAQ

>>> START OF MATCH
Each player shuffles their 15 card deck.
Priority (The player who acts first) is determined at random at this time, and is known to both players.
Each player draws 3 cards and is prompted to mulligan, both players do this at the same time, and know when their opponent's mulligan is complete.

To mulligan, a player selects any number of the 3 cards from their starting hand. They then draw that many cards from their deck, and shuffle away the cards that they selected. Neither player knows which or how many cards their opponent chooses to mulligan.

Once both players have mulliganed, the first round begins.
Each round has the following structure: start phase, action phase, end phase.

>>> START PHASE
In the start phase, the following things occur in the following order:
* If one player has won more rounds than the other, that player receives priority. Otherwise, priority is determined at random.
* Each player's maximum mana increases by 1 if it is less than 10.
* Each player's current mana is set to their maximum mana.
* Each player draws 2 cards.
* Any 'start of round' effects trigger (ex: Camera).

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
* If their hand has 6 cards in it, do nothing.
* If their deck is empty, their discard pile is shuffled and becomes their deck.
* They then take the top card of their deck and add it to their hand as the rightmost card.

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
	    		fontFamily: 'Cambria',//FontSettings.standard.font, TODO Use a settings const
	    		fontSize: FontSettings.standard.size,
	    		color: ColorSettings.rulebookText,
	    		border: 3,
	    		borderColor: '#000',
	    		backgroundColor: ColorSettings.rulebookBackground,
	    		id: 'rulebook',
	    		readOnly: true
	    	})
	    .setOrigin(0.5)

	    return container.add([rulebook, invisibleBackground])
	}

	// private doMute(btn: Button): () => void {
	// 	let that = this
	// 	return function() {
	// 		if (music.isPlaying) {
	// 			music.pause()

	// 			btn.setText('♪')
	// 			UserSettings._set('music', false)
	// 		}
	// 		else {
	// 			music.resume()

	// 			btn.setText('♫')
	// 			UserSettings._set('music', true)
	// 		}
	// 	}	
	// }

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

	private openMenu(): void {
      	this.sound.play('open')

      	this.btnMenu.glow()

		this.confirmationContainer.setVisible(true)
		this.sliderVolume.setVisible(true)
		this.sliderMusic.setVisible(true)
		this.sliderAnimationSpeed.setVisible(true)
	}

	private closeMenu(): void {
		this.sound.play('close')

		this.btnMenu.stopGlow()

		this.confirmationContainer.setVisible(false)
		this.rulebookContainer.setVisible(false)
		this.sliderVolume.setVisible(false)
		this.sliderMusic.setVisible(false)
		this.sliderAnimationSpeed.setVisible(false)
	}

	private doExit(): void {
		this.beforeExit()
		this.scene.start("WelcomeScene")
	}
}
