import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'

import Menu from './menu'
import BaseScene from '../../scene/baseScene'
import { Space, Color, Style, UserSettings, Time } from '../../settings/settings'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import MenuScene from '../menuScene'
import { rulebookString } from '../../catalog/rulebook'
import { creditsString } from '../../catalog/credits'


const width = 750
const height = 350
// Width of the subpanel that shows selected tab's contents
const subWidth = 530

// TODO Use a non-mock color for the menu background
const COLOR = 0x435700

// The currently selected tab, preserved if the menu is closed/opened
var selectedTab = 'general'

export default class OptionsMenu extends Menu {
	// Each of the subpanels displayed based on which tab is selected
	subpanels: Record<string, any> = {}

	// The sizer which holds the tabs and active subpanel
	subsizer

	// Mapping from subpanel anem to the button for that tab
	tabBtns: Record<string, Button> = {}

	// The highlight for the selected tab
	highlight: Phaser.GameObjects.Rectangle

	constructor(scene: MenuScene, params) {
		super(scene, width)

		// The non-menu scene which is active, used for changing scenes
		let activeScene = params.activeScene
		this.createContent(activeScene)

		this.layout()

		// After layout is complete, move the highlight to the selected tab button
		this.tweenHighlight(this.tabBtns[selectedTab].getGlobalPosition()[1], true)
	}

	private createContent(activeScene: BaseScene) {
		this.createHeader('Options', width + Space.padSmall*2)

		// Sizer with tabs on left, contents on right
		this.subsizer = this.scene['rexUI'].add.sizer({
			height: height,
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
		this.subpanels['credits'] = this.createCreditsPanel()
		
		// Put the currently selected tab's contents in the main sizer
		const subpanel = this.subpanels[selectedTab]
		this.subsizer.add(subpanel, {expand: true})
		subpanel.show()
	}

	private createTabs()  {
		// Create a rectangle to show which tab is selected
		this.highlight = this.scene.add.rectangle(0, 0, 200, Space.buttonHeight * 1.2, COLOR, 1)
		.setOrigin(0, 0.5)

		let tabsSizer = this.scene['rexUI'].add.fixWidthSizer({space: {line: Space.pad}})


		tabsSizer.addNewLine()

		// Add a button for each of the tabs
		const tabStrings = ['general', 'audio', 'rulebook', 'credits']
		for (let i = 0; i < tabStrings.length; i++) {
			let container = new ContainerLite(this.scene, 0, 0, Space.buttonWidth, Space.buttonHeight)
			let btn = new Buttons.Basic(container, 0, 0, tabStrings[i])
			
			btn.setOnClick(() => {
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

				this.tweenHighlight(btn.getGlobalPosition()[1])
			})

			tabsSizer.add(container)
			.addNewLine()

			// Add the btn to dictionary
			this.tabBtns[tabStrings[i]] = btn
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
			space: {
				// top: Space.pad,
				// bottom: Space.pad,
				left: Space.pad/2,
				right: Space.pad,
			},
			
			panel: {
				child: sizer
			},

			mouseWheelScroller: {
				speed: 1
			},
		})
		.addBackground(this.scene.add.rectangle(0, 0, 1, 1, Color.background2))
		.hide()

		// Add text to the scrollable panel
		let txt = this.scene.add.text(0, 0, rulebookString, Style.basic)
		.setWordWrapWidth(subWidth)

		sizer.add(txt)

		return scrollable
	}

	private createCreditsPanel() {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({width: subWidth})
		let scrollable = this.scene['rexUI'].add.scrollablePanel({
			space: {
				left: Space.pad/2,
				right: Space.pad,
			},
			
			panel: {
				child: sizer
			},

			mouseWheelScroller: {
				speed: 1
			},
		})
		.addBackground(this.scene.add.rectangle(0, 0, 1, 1, Color.background2))
		.hide()

		// Add text to the scrollable panel
		let txt = this.scene.add.text(0, 0, creditsString, Style.basic)
		.setWordWrapWidth(subWidth)

		sizer.add(txt)

		return scrollable
	}
	// Elements within the panels:
	private createAutopass() {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let txtHint = this.scene.add.text(0, 0, 'Autopass:', Style.basic)
		sizer.add(txtHint)
		sizer.addSpace()

		const s = UserSettings._get('autopass') ? 'Enabled' : 'Disabled'
		let container = new ContainerLite(this.scene, 0, 0, Space.buttonWidth, Space.buttonHeight)
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
		let sizer = this.scene['rexUI'].add.sizer({
			width: subWidth,
			orientation: 'vertical',
			space: {item: Space.pad},
		})

		let txtHint = this.scene.add.text(0, 0, 'Animation Speed:', Style.basic)
		sizer.add(txtHint, {align: 'left'})
		
		let slider = this.getSlider(
			UserSettings._get('animationSpeed'),
			(value) => {UserSettings._set('animationSpeed', value)}
			)
		sizer.add(slider)

		return sizer
	}

	private createQuit(activeScene: BaseScene) {
		let sizer = this.scene['rexUI'].add.sizer({width: subWidth})

		let container = new ContainerLite(this.scene, 0, 0, Space.buttonWidth, 50)
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
		let sizer = this.scene['rexUI'].add.sizer({
			width: subWidth,
			orientation: 'vertical',
			space: {item: Space.pad},
		})

		let txtHint = this.scene.add.text(0, 0, 'Master Volume:', Style.basic)
		sizer.add(txtHint)

		let slider = this.getSlider(
			UserSettings._get('volume'),
			(value) => {
				UserSettings._set('volume', value)
				that.scene.sound.volume = value
			}
			)
		sizer.add(slider)

		return sizer
	}

	private createMusicVolume() {
		let sizer = this.scene['rexUI'].add.sizer({
			width: subWidth,
			orientation: 'vertical',
			space: {item: Space.pad},
		})

		let txtHint = this.scene.add.text(0, 0, 'Music Volume:', Style.basic)
		sizer.add(txtHint)

		let slider = this.getSlider(
			UserSettings._get('musicVolume'),
			(value) => {
				UserSettings._set('musicVolume', value)

				let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("music")

				music.volume = value
				music.play()
			}
			)
		sizer.add(slider)

		return sizer
	}

	private createDialogVolume() {
		let sizer = this.scene['rexUI'].add.sizer({
			width: subWidth,
			orientation: 'vertical',
			space: {item: Space.pad},
		})

		let txtHint = this.scene.add.text(0, 0, 'Dialog Volume:', Style.basic)
		sizer.add(txtHint)

		let slider = this.getSlider(
			0, // TODO
			(value) => {
				// TODO
			}
			)
		sizer.add(slider)

		return sizer
	}

	private getSlider(value: number, callback: (value: number) => void) {
		return this.scene['rexUI'].add.slider({
			width: subWidth,
			height: 20,
			orientation: 'x',

			track: this.scene['rexUI'].add.roundRectangle(0, 0, subWidth, 8, 10, Color.sliderTrack),
			indicator: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 12, Color.sliderIndicator),
			thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 20, Color.sliderThumb),
			input: 'drag',

			value: value,
			valuechangeCallback: callback,
		})
	}

	// Tween the higlight moving to the given y (Flush with left side of menu)
	private tweenHighlight(y: number, immediate = false): void {
		this.scene.tweens.add({
			targets: this.highlight,
			x: (Space.windowWidth - width - Space.pad)/2,
			// TODO Buttons aren't centered for some reason
			y: y - 4,

			duration: immediate ? 0 : Time.optionsTabSlide,
			ease: 'Sine.easeInOut',
		})
	}
}
