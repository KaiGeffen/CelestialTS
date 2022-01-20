import "phaser"
import BaseScene from './baseScene'
import { Style, Space, Color } from '../settings/settings'
import Button from "../lib/button"

import adventureData from "../adventure.json"

export default class AdventureScene extends BaseScene {
	constructor() {
		super({
			key: "AdventureScene"
		})
	}

	create(): void {
		super.create()

		// Rex object
		this.createPanel()
	}

	// Create the panel containing the missions
	private createPanel(): void {
		let that = this

		let x = Space.pad
		let y = Space.pad
		let width = Space.windowWidth - Space.pad*2
		let height = Space.windowHeight - Space.pad*2

		let fullPanel = this['rexUI'].add.scrollablePanel({
			x: x,
			y: y,
			width: width,
			height: height,

			scrollMode: 0,

			background: this['rexUI'].add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

			panel: {
				child: this['rexUI'].add.fixWidthSizer({
					space: {
						// left: Space.pad,
						right: Space.pad - 10,
						top: Space.pad - 10,
						bottom: Space.pad - 10,
						// item: Space.pad,
						line: Space.pad,
					}
				})
			},

			slider: {
				input: 'drag',
				track: this['rexUI'].add.roundRectangle(0, 0, 20, 10, 10, 0xffffff),
				thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),
			},

			mouseWheelScroller: {
				  focus: false,
				  speed: 1
				},

				header: this['rexUI'].add.fixWidthSizer({
					height: 100,
					align: 'center',
					space: {
						left: Space.pad,
						right: Space.pad,
						top: Space.pad,
						bottom: Space.pad,
						item: Space.pad,
						line: Space.pad
					}
				}).addBackground(
				this['rexUI'].add.roundRectangle(0, 0, 0, 0,
					{tl: 0, tr: 16, bl: 0, br: 16},
					Color.menuHeader),
				{right: 10, bottom: 10}
				),

				space: {
					right: 10,
					left: 10,
					top: 10,
					bottom: 10,
				}
			}).setOrigin(0)
		.layout()
		let panel = fullPanel.getElement('panel')

		// Add each of the adventures as its own line
		adventureData.forEach(adventure => {
			let name = adventure.name
			let btn = new Button(that, 0, 0, `${name}`, () => {
				that.scene.start("AdventureBuilderScene", adventure)
			})
			panel.add(btn)
			panel.addNewLine()
		})

		fullPanel.layout()
	}
}
