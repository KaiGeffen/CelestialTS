import "phaser"
import BaseScene from './baseScene'
import { Style, Space, Color, UserSettings, Time, BBStyle } from '../settings/settings'
import Button from "../lib/button"
import Menu from "../lib/menu"
import { CardImage } from "../lib/cardImage"

import { getCard } from "../catalog/catalog"
import adventureData from "../adventure.json"
adventureData.reverse()


const MAP_WIDTH = 3900
const MAP_HEIGHT = 2700

export default class AdventureScene extends BaseScene {
	constructor() {
		super({
			key: "AdventureScene"
		})
	}

	create(params): void {
		super.create()

		// Create the background
		let background = this.add.image(0, 0, 'map-Birds')
			.setOrigin(0)
			.setInteractive()

		// Add all of the available nodes
		this.addAdventureData()

		// Add scroll functionality
		this.enableScrolling(background)

		// Make up pop-up for the card you just received, if there is one
		if (params.card) {
			const width = 1000
			const height = 250
			let menu = new Menu(
				this,
				width,
				height)

			let txt = this.add.text(0, 0, params.txt, Style.basic).setOrigin(0)
			let icon = this.add.image(0, 0, params.card.name) //new CardImage(params.card, menu.container).image//
			let textBox = this['rexUI'].add['textBox']({
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

			params.txt = ''
			params.card = undefined
		}

		// Scroll to the given position
		// if (params.scroll) {
		// 	this.panel.childOY = params.scroll
		// }
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

			let btn = new Button(that,
				Math.random() * MAP_WIDTH,
				Math.random() * MAP_HEIGHT,
				`${name}`,
				that.missionOnClick(mission))
		})
	}

	// Return the function for what happens when the given mission node is clicked on
	private missionOnClick(mission): () => void {
		let that = this

		if (mission.type === 'mission') {
			return function() {
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
					// scroll: that.panel.childOY,
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
		let camera: Phaser.Cameras.Scene2D.Camera = this.cameras.main

		this.input.on('gameobjectwheel', function(pointer, gameObject, dx, dy, dz, event) {
			camera.scrollX = Math.min(
				MAP_WIDTH - Space.windowWidth,
				Math.max(0, camera.scrollX + dx)
				)
			camera.scrollY = Math.min(
				MAP_HEIGHT - Space.windowHeight,
				Math.max(0, camera.scrollY + dy)
				)
		})
	}
}
