import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


import Menu from './menu'
import BaseScene from '../../scene/baseScene'
import { Space, Color, Style, UserSettings } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'
import MenuScene from '../menuScene'


const width = 700
// Width of the subpanel that shows selected tab's contents
const subWidth = 480

var selectedTab = 'general'

export default class OptionsMenu extends Menu {
	// Each of the subpanels displayed based on which tab is selected
	subpanels = {}

	// The sizer which holds the tabs and active subpanel
	subsizer

	constructor(scene: MenuScene, params) {
		super(scene, width)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		this.createContent(activeScene)

		this.layout()
	}

	private createContent(activeScene: BaseScene) {
		this.createHeader('Options', width + Space.padSmall*2)

		// Sizer with tabs on left, contents on right
		this.subsizer = this.scene['rexUI'].add.sizer({
			space: {
				item: Space.pad/2,
				left: Space.pad,
				right: Space.pad,
			}
		})
		this.sizer.add(this.subsizer)

		// Create the different tabs that user can select
		let tabs = this.createTabs()
		this.subsizer.add(tabs)
		.addSpace()

		// Create a sizer for each of the tabs
		
		this.subpanels['general'] = this.createGeneralPanel(activeScene)
		this.subpanels['audio'] = this.createAudioPanel()
		this.subpanels['rulebook'] = this.createRulebookPanel()
		// this.subpanels['credits'] = this.createRulebookPanel()
		
		// Put the currently selected tab's contents in the main sizer
		const subpanel = this.subpanels[selectedTab]
		this.subsizer.add(subpanel, {expand: true})
		subpanel.show()
	}

	private createTabs()  {
		let tabsSizer = this.scene['rexUI'].add.fixWidthSizer({space: {line: Space.pad}})

		const tabStrings = ['general', 'audio', 'rulebook', 'credits']

		tabsSizer.addNewLine()
		for (let i = 0; i < tabStrings.length; i++) {
			let container = new ContainerLite(this.scene, 0, 0, Space.largeButtonWidth, Space.largeButtonHeight)
			let btn = new Buttons.Basic(container, 0, 0, tabStrings[i])
			.setOnClick(() => {
				// Remove and hide the old subpanel
				const oldPanel = this.subpanels[selectedTab]

				this.subsizer.remove(oldPanel)
				oldPanel.hide()
				
				// Remember which tab is newly selected and show that
				selectedTab = tabStrings[i]
				const newPanel = this.subpanels[tabStrings[i]]

				this.subsizer.add(newPanel, {expand: true})
				newPanel.show()

				this.layout()
			})

			tabsSizer.add(container)
			.addNewLine()
		}

		return tabsSizer
	}

	private createGeneralPanel(activeScene: BaseScene) {
		let sizer = this.scene['rexUI'].add.sizer({
			orientation: 'vertical',
			space: {
				line: Space.pad*2,
				top: Space.pad,
				bottom: Space.pad,
				left: Space.pad/2,
				right: Space.pad,
			}
		})
		.addBackground(this.scene.add.rectangle(0, 0, 1, 1, Color.background2))
		.hide()

		sizer
		.add(this.createAutopass(), {expand: true})
		.addSpace()
		.add(this.createSpeed(), {expand: true})
		.addSpace()
		.add(this.createQuit(activeScene), {expand: true})

		return sizer
	}

	private createAudioPanel() {
		let sizer = this.scene['rexUI'].add.sizer({
			orientation: 'vertical',
			space: {
				line: Space.pad*2,
				top: Space.pad,
				bottom: Space.pad,
				left: Space.pad/2,
				right: Space.pad,
			}
		})
		.addBackground(this.scene.add.rectangle(0, 0, 1, 1, Color.background2))
		.hide()

		sizer
		.add(this.createMasterVolume(), {expand: true})
		.addSpace()
		.add(this.createMusicVolume(), {expand: true})
		.addSpace()
		.add(this.createDialogVolume(), {expand: true})

		return sizer
	}

	private createRulebookPanel() {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({width: subWidth})
		let scrollable = this.scene['rexUI'].add.scrollablePanel({
			// width: subWidth,
			// height: Space.windowHeight - Space.pad * 2,
			
			panel: {
				child: sizer
			},
			// background: background,

			mouseWheelScroller: {
				speed: 1
			},
		})
		.hide()

		// Add text to the scrollable panel
		let txt = this.scene.add.text(0, 0, rulebookString, Style.basic)
		.setWordWrapWidth(subWidth)

		sizer.add(txt)

		return scrollable
	}

	// Elements within the panels:
	private createAutopass() {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Autopass:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		const s = UserSettings._get('autopass') ? 'Enabled' : 'Disabled'
		let container = new ContainerLite(this.scene, 0, 0, Space.largeButtonWidth, Space.largeButtonHeight)
		let btn = new Buttons.Basic(container, 0, 0, s, () => {
			if (UserSettings._get('autopass')) {
				btn.setText('Disabled')
				UserSettings._set('autopass', false)
			}
			else {
				btn.setText('Enabled')
				UserSettings._set('autopass', true)
			}
		})
		sizer.add(container)

		return sizer
	}
	
	private createSpeed() {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtSpeedHint = this.scene.add.text(0, 0, 'Speed:', Style.basic)
		sizer.add(txtSpeedHint)
		sizer.addSpace()
		
		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('animationSpeed'),
            valuechangeCallback: function (value) {
            	UserSettings._set('animationSpeed', value)
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createQuit(activeScene: BaseScene) {
		let sizer = this.scene['rexUI'].add.sizer({
			width: subWidth,
			space: {item: Space.pad},
		})

		let container = new ContainerLite(this.scene, 0, 0, Space.largeButtonWidth, 50)
		sizer
		.addSpace()
		.add(container)
		.addSpace()

		new Buttons.Basic(container, 0, 0, 'Quit', () => {
			// Stop the other active scene
			activeScene.beforeExit()
			activeScene.scene.stop()

			// Stop this scene and start the home scene
			this.scene.scene.start("HomeScene")
		})

		return sizer
	}

	private createMasterVolume() {
		let that = this
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Master Volume:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('volume'),
            valuechangeCallback: function (value) {
            	UserSettings._set('volume', value)
                that.scene.sound.volume = value
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createMusicVolume() {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Music Volume:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            value: UserSettings._get('musicVolume'),
            valuechangeCallback: function (value) {
            	UserSettings._set('musicVolume', value)

            	let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")

            	music.volume = value
            	music.play()
            },
        })
		sizer.add(slider)

		return sizer
	}

	private createDialogVolume() {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtVolumeHint = this.scene.add.text(0, 0, 'Dialog Volume:', Style.basic)
		sizer.add(txtVolumeHint)
		sizer.addSpace()

		let slider = this.scene['rexUI'].add.slider({
			width: 200,
			height: 20,
			orientation: 'x',

            track: this.scene['rexUI'].add.roundRectangle(0, 0, 100, 8, 10, Color.sliderTrack),
            indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 8, Color.sliderIndicator),
            thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 10, Color.sliderThumb),
            space: {
                right: 10
            },
            input: 'drag',

            // TODO

            // value: UserSettings._get('musicVolume'),
            // valuechangeCallback: function (value) {
            // 	UserSettings._set('musicVolume', value)

            // 	let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")

            // 	music.volume = value
            // 	music.play()
            // },
        })
		sizer.add(slider)

		return sizer
	}
}

// TODO Move to a json
const rulebookString = 
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

Cards have a variety of effects, such as: Revealing, creating, transforming, drawing, discarding, and removing from the game other cards. Use all of this to your advantage, and predict what your opponent is planning, in order to win at Celestial.

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
* Each player's maximum breath increases by 1 if it is less than 10.
* Each player's current breath is set to their maximum breath.
* Each player draws 2 cards.

>>> ACTION PHASE
During the action phase, the player with priority can either pass, or play a card from their hand (Assuming they have sufficient breath to pay for it).
If they pass, their opponent is given priority.
If they play a card, they pay breath from their current breath equal to that card's cost.
The card then moves onto the story as the rightmost addition.
At this time, any 'when played' effects of the card activate (ex: Night Vision).
Their opponent is then given priority.
The action phase ends when both players pass in a row.
During this phase, each player cannot see the cards their opponent has played.

>>> END PHASE
During the end phase, cards in the story resolve from left to right.
When a card resolves, it adds its points to its owner's score for the round, then its effect occurs, then it moves to its owner's discard pile.
Once all cards in the story have resolved, if on player has more points than their opponent, they are awarded a round win.

>>> WINNING THE MATCH
Once a player has won 5 rounds, they win the match.

>>> DRAWING CARDS
When a player 'draws a card' they do the following:
If they have 6 cards in hand, they skip their draw. Otherwise, they take the top card of their deck and add it to their hand as the rightmost card. If their deck is empty, their discard pile is shuffled to become their new deck.

>>> PRECEDENCE
Whenever a card would be selected from any zone (ex: Cling taking the highest cost card from your discard pile) the following system determines which card gets selected:
* First the deck is traversed from top to bottom, and any card meeting the conditions is picked.
* Then the discard pile is traversed from top to bottom, and any card meeting the conditions is picked.
* If no cards are picked this way, the effect does nothing.

>>> FAQ
Is my deck in the order that I see when hovering over it?
No, the true order of your deck is hidden from you. The order you see is sorted by cost.

Can cards that reset (ex: Hurricane) be worth points if they are Nourished?
No, the card contributes points first, then its effect resets your points to 0.`