import "phaser"
import BaseScene from './baseScene'
import { Style, Space, Color, UserSettings, Time, BBStyle } from '../settings/settings'
import Buttons from "../lib/buttons/buttons"
import Icons from "../lib/buttons/icons"
import Menu from "../lib/menu"
import { CardImage } from "../lib/cardImage"

import { getCard } from "../catalog/catalog"
// import adventureData from "../adventure.json"
// adventureData.reverse()
import { adventureData } from "../adventures/adventure"

const MAP_WIDTH = 3900
const MAP_HEIGHT = 2700

// TODO Make consistent with Journey (Change adventure to journey or vice verca)
export default class AdventureScene extends BaseScene {
	params = {scrollX: 0, scrollY: 0};

	panDirection

	constructor() {
		super({
			key: "AdventureScene"
		})
	}

	create(params): void {
		super.create()

		this.params = params

		// Create the background
		let background = this.add.image(0, 0, 'map-Birds')
			.setOrigin(0)
			.setInteractive()

		// Add navigation arrows
		this.createArrows()

		// Add all of the available nodes
		this.addAdventureData()

		// Add scroll functionality
		this.enableScrolling(background)

		// Make up pop-up for the card you just received, if there is one
		let menu
		if (params.card) {
			const width = 1000
			const height = 250
			let menu = new Menu(
				this,
				width,
				height)

			let txt = this.add.text(0, 0, params.txt, Style.flavor).setOrigin(0)
			let icon = this.add.image(0, 0, params.card.name) //new CardImage(params.card, menu.container).image//
			let textBox = this.rexUI.add.textBox({
				x: 0,
				y: 0,
				width: width,
				height: height,
				icon: icon,
				space: {
					left: Space.pad,
					right: Space.pad,
					top: Space.pad,
					bottom: Space.pad,
					icon: Space.pad
				},
				text: txt
			}).setOrigin(0.5)

			textBox.start(params.txt, Time.vignetteSpeed())

			menu.add([txt, icon, textBox])

			// Reposition the menu to be visible to the camera
			if (params.scrollX !== undefined && params.scrollY !== undefined) {
				menu.container.setPosition(
					params.scrollX + Space.windowWidth / 2,
					params.scrollY + Space.windowHeight / 2)
			}

			params.txt = ''
			params.card = undefined
		}

		// Scroll to the given position
		if (params.scrollX !== undefined) {
			this.cameras.main.scrollX = params.scrollX
			this.cameras.main.scrollY = params.scrollY
		}
	}

	update(): void {
		// If pointer is released, stop panning
		if (!this.input.activePointer.isDown) {
			this.panDirection = undefined
		}

		if (this.panDirection !== undefined) {
			AdventureScene.moveCamera(this.cameras.main, this.panDirection[0], this.panDirection[1])
		}
	}

	// Create the panel containing the missions
	private createPanel(): void {
		let that = this

		let x = Space.pad
		let y = Space.pad
		let width = Space.windowWidth - Space.pad*2
		let height = Space.windowHeight - Space.pad*2

		let fullPanel = this.rexUI.add.scrollablePanel({
			x: x,
			y: y,
			width: width,
			height: height,

			scrollMode: 0,

			background: this.rexUI.add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

			panel: {
				child: this.rexUI.add.fixWidthSizer({
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
				track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xffffff),
				thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),
			},

			mouseWheelScroller: {
				  focus: false,
				  speed: 1
				},

				header: this.rexUI.add.fixWidthSizer({
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
				this.rexUI.add.roundRectangle(0, 0, 0, 0,
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

		this.addAdventureData()

		fullPanel.layout()
	}

	private createArrows(): void {
		let that = this

		const mag = 25

		// Details for each arrow (North, East, South, West)
		const arrows = [
			{
				x: Space.windowWidth/2,
				y: Space.pad,
				direction: [0, -mag]
			},
			{
				x: Space.windowWidth - Space.pad,
				y: Space.windowHeight/2,
				direction: [mag, 0]
			},
			{
				x: Space.windowWidth/2,
				y: Space.windowHeight - Space.pad,
				direction: [0, mag]
			},
			{
				x: Space.pad,
				y: Space.windowHeight/2,
				direction: [-mag, 0]
			},
		]

		for (let i = 0; i < arrows.length; i++) {
			const arrow = arrows[i]

			new Icons.X(this, arrow.x, arrow.y)
			.setDepth(10)
			.setNoScroll()
			.setOnClick(() => {
				that.panDirection = arrow.direction
			})
		}
	}

	// Add all of the missions to the panel
	private addAdventureData(): void {
		let that = this
		let completed = UserSettings._get('completedMissions')

		let unlockedMissions = adventureData.filter(function(mission) {
			// Return whether any of the necessary conditions have been met
			// Prereqs are in CNF (Or of sets of Ands)
			return mission.prereq.some(function(prereqs, _) {
				return prereqs.every(function(id, _) {
					return completed[id]
				})
			})
		})

		// Add each of the adventures as its own line
		unlockedMissions.forEach(mission => {
			// Get the string for this adventure
			let id = mission.id

			// If it has been completed, filled in star, otherwise empty star
			let name = completed[id] ? '★' : '☆'
			name += mission.type === 'card' ? '🂡' : ''
			name += mission.name

			let btn = new Buttons.Basic(that,
				mission.x,
				mission.y,
				`${name}`,
				that.missionOnClick(mission))
		})
	}

	// Return the function for what happens when the given mission node is clicked on
	private missionOnClick(mission): () => void {
		let that = this

		if (mission.type === 'tutorial') {
			return function() {
				that.params.scrollX = that.cameras.main.scrollX
				that.params.scrollY = that.cameras.main.scrollY
    			that.scene.start("TutorialGameScene", {isTutorial: false, deck: undefined, mmCode: `ai:t${mission.tutorial}`, missionID: mission.id})
			}
		}
		else if (mission.type === 'mission') {
			return function() {
				that.params.scrollX = that.cameras.main.scrollX
				that.params.scrollY = that.cameras.main.scrollY
				that.scene.start("AdventureBuilderScene", mission)
			}
		}
		else if (mission.type === 'card') {
			return function() {
				UserSettings._setIndex('inventory', mission.card, true)

				// Complete this mission
				UserSettings._setIndex(
					'completedMissions',
					mission.id,
					true)

				// TODO Clean this impl
				let params = {
					scrollX: that.cameras.main.scrollX,
					scrollY: that.cameras.main.scrollY,
					txt: '',
					card: undefined
				}

				let card = getCard(mission.card)
				if (card !== undefined) {
					params.txt = card.story
					params.card = card
				}

				that.scene.start("AdventureScene", params)
			}
		}
		// else if (mission.type === 'tutorial') {
		// 	return function() {
		// 		that.scene.start("AdventureBuilderScene", mission)
		// 	}
		// }
	}

	private enableScrolling(background: Phaser.GameObjects.GameObject): void {
		let camera = this.cameras.main

		this.input.on('gameobjectwheel', function(pointer, gameObject, dx, dy, dz, event) {
			AdventureScene.moveCamera(camera, dx, dy)
		})
	}

	private static moveCamera(camera, dx, dy): void {
		camera.scrollX = Math.min(
			MAP_WIDTH - Space.windowWidth,
			Math.max(0, camera.scrollX + dx)
			)
		camera.scrollY = Math.min(
			MAP_HEIGHT - Space.windowHeight,
			Math.max(0, camera.scrollY + dy)
			)
	}
}
