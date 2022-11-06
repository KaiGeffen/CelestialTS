import "phaser"
import BaseScene from './baseScene'
import { Style, Space, Color, UserSettings, Time, BBStyle, Ease } from '../settings/settings'
import Buttons from "../lib/buttons/buttons"
import Button from "../lib/buttons/button"
import Icons from "../lib/buttons/icons"
import Menu from "../lib/menu"
import { CardImage } from "../lib/cardImage"

import { getCard } from "../catalog/catalog"
// import adventureData from "../adventure.json"
// adventureData.reverse()
import { adventureData } from "../adventures/adventure"

const MAP_WIDTH = 6000
const MAP_HEIGHT = 4800

// TODO Make consistent with Journey (Change adventure to journey or vice verca)
export default class AdventureScene extends BaseScene {
	params = {scrollX: 4650 - Space.windowWidth/2, scrollY: 700 - Space.windowHeight/2};

	panDirection

	map: Phaser.GameObjects.Image

	animatedBtns: Button[]

	constructor() {
		super({
			key: "AdventureScene"
		})
	}

	create(params): void {
		super.create()

		this.params = {...this.params, ...params}

		// Create the background
		this.map = this.add.image(0, 0, 'story-Map')
			.setOrigin(0)
			.setInteractive()

		// Add navigation arrows + zoom
		this.createNavigation()

		// Add all of the available nodes
		this.addAdventureData()

		if (params.stillframe !== undefined) {
			this.createStillframe(params)
		}
		else {
			// Add scroll functionality by default if not showing a stillframe
			this.enableScrolling()
		}

		// Make up pop-up for the card you just received, if there is one
		if (params.card) {
			this.createCardPopup(params)
		}

		// Scroll to the given position
		this.cameras.main.scrollX = this.params.scrollX
		this.cameras.main.scrollY = this.params.scrollY
	}

	update(time, delta): void {
		// If pointer is released, stop panning
		if (!this.input.activePointer.isDown) {
			this.panDirection = undefined
		}

		if (this.panDirection !== undefined) {
			AdventureScene.moveCamera(this.cameras.main, this.panDirection[0], this.panDirection[1])
		}

		// Switch the frame of the animated elements every frame
		// Go back and forth from frame 0 to 1
		this.animatedBtns.forEach(btn => {
			// Switch every half second, roughly
			let frame = Math.floor(2 * time / 1000) % 2 === 0 ? 0 : 1
			btn.icon.setFrame(frame)
		})
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

	private createNavigation(): void {
		const mag = 25
		const pad = 60

		// Create zoom in button
		// const camera = this.cameras.main
		// new Buttons.Basic(this,
		// 	Space.windowWidth - Space.largeButtonWidth/2 - Space.iconSize - Space.pad * 2,
		// 	Space.largeButtonHeight/2 + Space.pad,
		// 	'Zoom',
		// 	() => {
		// 		if (this.map.scale === 1) {
		// 			this.map.setScale(1/2)
		// 			camera.scrollX = camera.scrollX / 2
		// 			camera.scrollY = camera.scrollY / 2
		// 		}
		// 		else {
		// 			this.map.setScale(1)
		// 			camera.scrollX = camera.scrollX * 2
		// 			camera.scrollY = camera.scrollY * 2
		// 		}
		// 	}
		// )
		// .setNoScroll()
		// .setDepth(10)

		// Details for each arrow (North, East, South, West)
		const arrows = [
			{
				x: Space.windowWidth/2,
				y: pad,
				direction: [0, -mag]
			},
			{
				x: Space.windowWidth - pad,
				y: Space.windowHeight/2,
				direction: [mag, 0]
			},
			{
				x: Space.windowWidth/2,
				y: Space.windowHeight - pad,
				direction: [0, mag]
			},
			{
				x: pad,
				y: Space.windowHeight/2,
				direction: [-mag, 0]
			},
		]

		for (let i = 0; i < arrows.length; i++) {
			const arrow = arrows[i]

			let icon = new Icons.Arrow(this, arrow.x, arrow.y, i)
			.setDepth(10)
			.setNoScroll()
			.setOnClick(() => {
				this.panDirection = arrow.direction
			})
		}
	}

	// Create a popup for the card specified in params
	private createCardPopup(params): void {
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

	// Create a stillframe animation specified in params
	private createStillframe(params): void {
		// TODO Make dry with the searching tutorial class implementation

		let container = this.add.container().setDepth(11)

		let img = this.add.image(Space.windowWidth/2, 0, `story-Story 4`)
		.setOrigin(0.5, 0)
		.setInteractive()

		// Ensure that image fits perfectly in window
		const scale = Space.windowWidth / img.displayWidth
		img.setScale(scale)

		// Text background
		let background = this.add.image(0, Space.windowHeight - 225, 'bg-Texture')
		.setOrigin(0)
		.setAlpha(0.8)
		this.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			shadowColor: 0x000000,
		})

		// Add text
		let txt = this.add.text(0, 0, '', Style.stillframe)

		const s = "Impressive, all that life, all that wonder. You are welcomed in of course."//" But if I might share one thing that I've learned in my time here... It's that someday, everything blows away."

		let textbox = this.rexUI.add.textBox({
			text: txt,
			x: Space.pad,
			y: background.y,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
			},
		})
		.start(s, 50)
		.setOrigin(0)

		container.add([img, background, txt, textbox])

		// Add an okay button
		let btn = new Buttons.Basic(
			container,
			Space.windowWidth - Space.pad - Space.largeButtonWidth/2,
			Space.windowHeight - Space.pad - Space.largeButtonHeight/2,
			'Continue',
			() => {
				container.setVisible(false)

				// Allow scrolling once the stillframe is gone
				this.enableScrolling()
			})

		// Scroll the image going down
		this.add.tween({
			targets: img,
			duration: 6000,
			ease: Ease.stillframe,
			y: Space.windowHeight - img.displayHeight,
			onStart: () => {
				img.y = 0
			},
		})

		// Set the param to undefined so it doesn't persist
		params.stillframe = undefined
	}

	// Add all of the missions to the panel
	private addAdventureData(): void {
		let that = this
		let completed: boolean[] = UserSettings._get('completedMissions')

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
		this.animatedBtns = []
		unlockedMissions.filter(mission => {
			// // Don't show unlocked cards that user has already received
			// if (mission.type === 'card' && UserSettings._get('completedMissions')[mission.id]) {
			// 	return false
			// }

			return true
		}).forEach(mission => {
			// Get the string for this adventure
			let id = mission.id			

			let btn = new Buttons.Mission(that,
				mission.x,
				mission.y,
				that.missionOnClick(mission),
				mission.type)

			// If user hasn't completed this mission, animate it
			if (!completed[mission.id]) {
				this.animatedBtns.push(btn)
			}
			else {
				btn.setAlpha(0.5)
			}
		})
	}

	// Return the function for what happens when the given mission node is clicked on
	private missionOnClick(mission): () => void {
		let that = this

		if (mission.type === 'tutorial') {
			return function() {
				that.params = {
					scrollX: that.cameras.main.scrollX,
					scrollY: that.cameras.main.scrollY,
				}
    			that.scene.start("TutorialGameScene", {isTutorial: false, deck: undefined, mmCode: `ai:t${mission.id}`, missionID: mission.id})
			}
		}
		else if (mission.type === 'mission') {
			return function() {
				that.params = {
					scrollX: that.cameras.main.scrollX,
					scrollY: that.cameras.main.scrollY,
				}
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

	private enableScrolling(): void {
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
