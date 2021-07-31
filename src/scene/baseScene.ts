import "phaser"
import { StyleSettings, FontSettings, ColorSettings, UserSettings, Space } from "../settings"
import { addCardInfoToScene, cardInfo } from "../lib/cardImage"
import Button from "../lib/button"


var music: Phaser.Sound.BaseSound

export default class BaseScene extends Phaser.Scene {
	confirmationContainer: Phaser.GameObjects.Container
	sliderVolume: any

	constructor(args) {
		super(args)
	}

	create(): void {
		// Add music if it doesn't exist
		if (music === undefined) {
			music = this.sound.add('background', {volume: 0.5, loop: true})
			music.play()

			// If user prefers no music, pause it
			if (!UserSettings._get('music')) {
				music.pause()
			}
		}

		// Make sure that cardInfo is above everything else
		addCardInfoToScene(this).setDepth(15)

		// Mute button
		let s = music.isPlaying ? '♫' : '♪'
		let btnMute = new Button(this, Space.windowWidth - Space.pad/2, 0, s).setOrigin(1, 0)
		btnMute.setOnClick(this.doMute(btnMute))

		// Exit button
		let btnExit = new Button(this, Space.windowWidth - Space.pad/2, 50, '⚙', this.confirmExit).setOrigin(1, 0)

		this.createMenu()
	}

	private createMenu(): void {
		let that = this

		// Invisible background, which closes menu when clicked
		let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
		invisibleBackground.setInteractive().on('pointerdown', this.exitConfirmation, this)

		// Visible background, which does nothing when clicked
		let visibleBackground = this.add['rexRoundRectangle'](Space.windowWidth/2, Space.windowHeight/2, 500, 510, 30, ColorSettings.menuBackground).setAlpha(0.95)
		visibleBackground.setInteractive()
		visibleBackground.setStrokeStyle(10, ColorSettings.background, 1)

		// Radio button for whether keywords should be explained
		let x = Space.windowWidth/2 - 210
		let y = Space.windowHeight/2 - 140 - 55
		let txtKeywordHint = this.add.text(x, y, 'Keyword text:', StyleSettings.announcement).setOrigin(0, 0.5)

		let radio = this.add.circle(Space.windowWidth/2 + 182, y + 5, 14).setStrokeStyle(4, ColorSettings.background)
		if (UserSettings._get('explainKeywords')) {
			radio.setFillStyle(ColorSettings.cardHighlight)
		}

		radio.setInteractive()
		radio.on('pointerdown', function() {
			that.sound.play('click')

			UserSettings._set('explainKeywords', !UserSettings._get('explainKeywords'))

			radio.setFillStyle((UserSettings._get('explainKeywords')) ? ColorSettings.cardHighlight : undefined)
		})

		// Slider for music
		y += 110
		let txtVolumeHint = this.add.text(x, y, 'Volume:', StyleSettings.announcement).setOrigin(0, 0.5)

		this.sliderVolume = this['rexUI'].add.slider({
			x: Space.windowWidth/2, y: y + 5, width: 200, height: 20, orientation: 'x',
			value: this.sound.volume,

            track: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, 0xffffff),
            indicator: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, ColorSettings.background),
            thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.background),

            valuechangeCallback: function (value) {
            	UserSettings._set('volume', value)
                that.sound.volume = value
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag',
        }).setOrigin(0, 0.5)
        this.sliderVolume.layout()

        // Link to rulebook
        let rulebookContainer = this.createRulebook()
        y += 110
        let btnRulebook = new Button(this, x, y, "Read Rulebook", function() {
        	rulebookContainer.setVisible(true)
	    	this.sound.play('open')
        })
        	.setStyle(StyleSettings.announcement)
        	.setOrigin(0, 0.5)

		// Prompt asking users if they want to exit
		y += 110
		let txtExitHint = this.add.text(x, y, 'Exit to main menu?', StyleSettings.announcement).setOrigin(0, 0.5)

		// Yes/No buttons
		y += 80
		let btnYes = new Button(this, Space.windowWidth/2 - 50, y, 'Yes', this.doExit).setOrigin(1, 0.5)
		let btnNo = new Button(this, Space.windowWidth/2 + 50, y, 'No', this.exitConfirmation).setOrigin(0, 0.5)

		// Custom rexUI sliders don't work in containers
		this.sliderVolume.setDepth(21).setVisible(false)
		// Menu container which is toggled visible/not
		this.confirmationContainer = this.add.container(0, 0).setDepth(20).setVisible(false)

		this.confirmationContainer.add([invisibleBackground, visibleBackground,
			txtKeywordHint, radio,
			txtVolumeHint,
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
`>>> Start of Match
At the start of a match, each player has a shuffled deck of 15 collectible cards that they have chosen.
Priority (The player who acts first) is determined at random at this time, and is known to both players.
Each player draws 3 cards and is prompted to mulligan, both players do this at the same time, and know when their opponent is done mulliganing.

To mulligan, a player selects any number of the 3 cards from their starting hand. They then draw that many cards from their deck, and shuffle away the cards that they selected.
Once both players have mulliganed, the first round begins.

Each round has the following structure: start phase, action phase, end phase.

>>> Start Phase
In the start phase, the following things occur in the following order:
* If one player has won more rounds than the other, that player receives priority. Otherwise, priority is determined at random.
* Each player's maximum mana increases by 1 if it is less than 10.
* Each player's current mana is set to their maximum mana.
* Each player draws 2 cards.
* Any 'start of round' effects trigger (ex: Camera).

>>> Action Phase
During the action phase, the player with priority can either pass, or play a card from their hand (Assuming they have sufficient mana to pay for it).
If they pass, their opponent is given priority.
If they play a card, they pay mana from their current mana equal to that card's cost.
The card then moves onto the story as the rightmost addition.
At this time, any 'when played' effects of the card activate (ex: Night Vision).
Their opponent is then given priority.
The action phase ends when both players pass in a row.
During this phase, each player cannot see the cards their opponent has played.

>>> End Phase
During the end phase, cards in the story resolve from left to right.
When a card resolves, it adds its points to its owner's score for the round, then its effect occurs, then it moves to its owner's discard pile.
Once all cards in the story have resolved, if a player has a positive score that is greater than their opponent's, they are awarded a round win.

>>> Winning the game
Once a player has done either of the following, that player wins the match.
* Win at least 5 rounds, and have won at least 2 more rounds than their opponent.
* Win 10 rounds.

>>> Drawing
When a player 'draws a card' they do the following:
* If their hand has 6 cards in it, do nothing.
* If their deck is empty, their discard pile is shuffled and becomes their deck.
* They then take the top card of their deck and add it to their hand as the rightmost card.

>>> FAQ
Is my deck in the order that I see when hovering over it?
No, the true order of your deck is hidden from you. The order you see is sorted by cost.`
	    let rulebook = this.add['rexInputText'](
	    	Space.windowWidth/2, Space.windowHeight/2, Space.windowWidth*7/8, Space.windowHeight*7/8, {
	    		type: 'textarea',
	    		text: text,
	    		fontFamily: 'Cambria',//FontSettings.standard.font, TODO Use a settings const
	    		fontSize: FontSettings.standard.size,
	    		color: ColorSettings.standard,
	    		border: 3,
	    		borderColor: '#000',
	    		backgroundColor: ColorSettings.rulebookBackground,
	    		id: 'rulebook',
	    		readOnly: true
	    	})
	    .setOrigin(0.5)

	    return container.add([rulebook, invisibleBackground])
	}

	private doMute(btn: Button): () => void {
		let that = this
		return function() {
			if (music.isPlaying) {
				music.pause()

				btn.setText('♪')
				UserSettings._set('music', false)
			}
			else {
				music.resume()

				btn.setText('♫')
				UserSettings._set('music', true)
			}
		}	
	}

	// Overwritten by the scenes that extend this
	beforeExit(): void {
		return
	}

	private confirmExit(): void {
      	this.sound.play('open')

		this.confirmationContainer.setVisible(true)
		this.sliderVolume.setVisible(true)
	}

	private doExit(): void {
		this.beforeExit()
		this.scene.start("WelcomeScene")
	}

	private exitConfirmation(): void {
		this.sound.play('close')

		this.confirmationContainer.setVisible(false)
		this.sliderVolume.setVisible(false)
	}
}
