import "phaser"

import Region from './baseRegion'

import { Space, Color, Style, BBStyle, Depth } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'
// import { CardImage } from '../../lib/cardImage'
// import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
// import { Animation, Zone } from '../../lib/animation'
import BaseScene from '../baseScene'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'


export default class ResultsRegion extends Region {
	// Whether the results have been seen already
	seen: boolean

	// Text saying if you won or lost
	txtResult: Phaser.GameObjects.Text

	// Longer text describing how each round went
	txtRoundResults: Phaser.GameObjects.Text

	// Avatar images for both players
	ourAvatar: Phaser.GameObjects.Image
	theirAvatar: Phaser.GameObjects.Image

	// The panel that shows results of the match
	panel

	create (scene: BaseScene): ResultsRegion {
		this.scene = scene
		this.container = scene.add.container(0, 0).setDepth(Depth.results)
		this.seen = false

		// Create background
		let background = scene.add.rectangle(0, 0,
			Space.windowWidth, Space.windowHeight,
			Color.darken, 0.9
			)
		.setOrigin(0)
		.setInteractive()
		.on('pointerdown', () => {this.hide()})
		this.container.add(background)

		// Images
		this.createContent()

		// Buttons 
		this.createButtons()

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// If the game isn't over, hide this
		if (state.winner === null) {
			this.hide()
			return
		}

		// If we are in a recap, hide this
		if (isRecap) {
			this.hide()
			return
		}

		// If the results have been shown before, hide this
		if (this.seen) {
			this.hide()
			return
		}

		// Avatars
		// Results TODO
		const av1 = avatarNames[state.avatars[0]]
		const av2 = avatarNames[state.avatars[1]]
		this.ourAvatar.setTexture(`avatar-${av1}Full`)
		this.theirAvatar.setTexture(`avatar-${av2}Full`)

		this.show()
		this.seen = true
	}

	hide(): void {
		this.panel.setVisible(false)
		super.hide()
	}

	show(): void {
		this.panel.setVisible(true)
		.layout()
		super.show()
	}

	private createButtons() {
		// Exit
		let y = Space.windowHeight - (Space.pad + Space.largeButtonHeight/2)
		new Buttons.Basic(this.container, Space.windowWidth/2 + Space.pad + Space.largeButtonWidth, y, 'Exit', this.exitCallback())

		// Replay
		new Buttons.Basic(this.container, Space.windowWidth/2, y, 'Replay', this.newMatchCallback())
		
		// TODO Hint
		// let txtHint = this.scene.add.text(
		// 	Space.windowWidth/2,
		// 	y - Space.largeButtonHeight/2,
		// 	'With the same deck',
		// 	Style.small
		// 	).setOrigin(0.5, 0)
		// this.container.add(txtHint)
		

		// Review
		new Buttons.Basic(this.container, Space.windowWidth/2 - Space.pad - Space.largeButtonWidth, y, 'Review', this.reviewCallback())
	}

	private createContent() {
		// Win/Lose text
		this.txtResult = this.scene.add.text(Space.windowWidth/2, Space.pad, 'Victory', Style.announcement).setOrigin(0.5, 0)

		// Create the panel with more details about the results
		this.createResultsPanel()

		// Your avatar
		// TODO 360
		this.ourAvatar = this.scene.add.image(Space.windowWidth/2 - 300, Space.windowHeight/2, 'avatar-JulesFull')
		.setInteractive()
		this.theirAvatar = this.scene.add.image(Space.windowWidth/2 + 300, Space.windowHeight/2, 'avatar-MiaFull')
		.setInteractive()

		this.container.add([
			this.txtResult,
			this.ourAvatar,
			this.theirAvatar,
			])
	}

	private createResultsPanel() {
		let background = this.createBackground()

		let panel = this.createPanel()

		this.panel = this.scene['rexUI'].add.scrollablePanel({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: 300,
			height: 600,

			background: background,

			header: this.createHeader(),

			panel: {
				child: panel
			},
			space: {
				bottom: Space.padSmall
			}
			})
		.setDepth(Depth.results)

		this.updateOnScroll(panel, this.panel)


		// // TODO Make this dynamic
		// const s = `Hey there\nuwu`

		// let foo = this.scene.add.text(400, 400, s, Style.basic)
		// // .setDepth(100)

		// this.panel.add(foo)
		// console.log(this.panel)
		// this.panel.layout()
	}

	private createBackground() {
		let background = this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 50, Color.background)

		// Add a border around the shape TODO Make a class for this to keep it dry
		let postFxPlugin = this.scene.plugins.get('rexOutlinePipeline')
		postFxPlugin['add'](background, {
			thickness: 1,
			outlineColor: Color.border,
		})

		return background
	}

	private createHeader(): ContainerLite {
		let container = new ContainerLite(this.scene, 0, 0, 300, 50)

		let txt = this.scene.add['rexBBCodeText'](0, 0, '[size=30][u]Results:[/u][/size]', BBStyle.basic).setOrigin(0.5)

		container.add(txt)

		return container
	}

	private createPanel() {
		let panel = this.scene['rexUI'].add.fixWidthSizer({
			align: 'center',
			space: {
				left: Space.pad,
				right: Space.pad,
			}
		})

		const s = `Round 1
0 - [color=${Color.resultsWin}]1[/color]

Round 2
2 - 2

Round 3
4 - [color=${Color.resultsWin}]5[/color]

Round 4
0 - 0

Round 5
2 - [color=${Color.resultsWin}]7[/color]

Round 6
3 - [color=${Color.resultsWin}]4[/color]

Round 1
0 - [color=${Color.resultsWin}]1[/color]

Round 2
2 - 2

Round 3
4 - [color=${Color.resultsWin}]5[/color]

Round 4
0 - 0

Round 5
2 - [color=${Color.resultsWin}]7[/color]

Round 6
3 - 4`

		this.txtRoundResults = this.scene.add['rexBBCodeText'](0, 0, s, BBStyle.basic)
		panel.add(this.txtRoundResults)

		return panel
	}

	private exitCallback(): () => void {
		let that = this
		return function() {
			that.scene.doBack()
		}
	}

	private newMatchCallback(): () => void {
		let that = this
		return function() {
			// Restarts the game scene with same arguments (Deck, matchmaking, etc)
			that.scene.scene.restart()
		}
	}

	private reviewCallback(): () => void {
		let that = this
		return function() {
			that.hide()
		}
	}

	// TODO Make dry with other scenes
	// Update the panel when user scrolls with their mouse wheel
	private updateOnScroll(panel, scrollablePanel) {
		let that = this

		this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
			// Return if the pointer is outside of the panel
			if (!panel.getBounds().contains(pointer.x, pointer.y)) {
				return
			}

			// Scroll panel down by amount wheel moved
			scrollablePanel.childOY -= dy

			// Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
			scrollablePanel.t = Math.max(0, scrollablePanel.t)
			scrollablePanel.t = Math.min(0.999999, scrollablePanel.t)
		})
	}
}