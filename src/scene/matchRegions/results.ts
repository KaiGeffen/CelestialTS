import "phaser"

import Region from './baseRegion'

import { Space, Color, Style, Depth } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'
// import { CardImage } from '../../lib/cardImage'
// import { cardback } from '../../catalog/catalog'
import ClientState from '../../lib/clientState'
// import { Animation, Zone } from '../../lib/animation'
import BaseScene from '../baseScene'


export default class ResultsRegion extends Region {
	// Whether the results have been seen already
	seen: boolean

	txtResult: Phaser.GameObjects.Text

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

		this.show()
		this.seen = true
	}

	hide(): void {
		console.log('here')
		this.panel.setVisible(false)
		super.hide()
	}

	show(): void {
		this.panel.setVisible(true)
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
		this.txtResult = this.scene.add.text(Space.windowWidth/2, Space.pad, 'Foo', Style.announcement)

		// Create the panel with more details about the results
		this.createResultsPanel()

		// Your avatar
		// TODO 360
		let ourAvatar = this.scene.add.image(Space.windowWidth/2 - 300, Space.windowHeight/2, 'avatar-JulesFull')
		let theirAvatar = this.scene.add.image(Space.windowWidth/2 + 300, Space.windowHeight/2, 'avatar-MiaFull')

		this.container.add([
			this.txtResult,
			ourAvatar,
			theirAvatar,
			])
	}

	private createResultsPanel() {
		let background = this.createBackground()

		this.panel = this.scene['rexUI'].add.scrollablePanel({
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			width: 300,
			height: 600,

			background: background,

			panel: {
				child: this.scene['rexUI'].add.fixWidthSizer({
					space: {
						left: Space.pad,
						right: Space.pad,
						top: 70 + Space.pad, // TODO 70 is the filter height
						bottom: Space.pad - 10,
						item: Space.pad,
						line: Space.pad,
					}
				})
			}})
		.setDepth(Depth.results)

		let foo = this.scene.add.image(0, 0, 'icon-Share')

		this.panel.add(foo)
		this.panel.layout()
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
}