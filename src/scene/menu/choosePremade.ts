import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

// TODO Remove, use Buttons namespace
import { ButtonAvatarFull } from '../../lib/buttons/avatarSelect'
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'

import Menu from './menu'
import { Style, BBStyle, Space, Color, Time } from '../../settings/settings'
import avatarDetails from '../../catalog/avatarDetails.json'
import Hint from '../../lib/hint'


export default class ChoosePremade extends Menu {
	selectedAvatar: number

	avatarsSmall: Button[]
	avatarFull: Phaser.GameObjects.Image
	txtName: Phaser.GameObjects.Text
	txtSurname: Phaser.GameObjects.Text
	txtDescription: RexUIPlugin.BBCodeText

	chart: any

	constructor(scene: Phaser.Scene, params) {
		let callback: (number) => void = params.callback
		super(scene, params)

		// Add a background rectangle
		this.scene.add.image(0, 0, 'bg-Texture')
		// this.scene.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, Color.background)
		.setOrigin(0)
		.setInteractive()

		this.selectedAvatar = params.selected | 0
		this.avatarsSmall = []

		this.createSizer(callback)

		// Set the content based on the selected avatar
		this.setContent(avatarDetails[this.selectedAvatar])
	}

	private createSizer(callback: (number) => void): void {
		let sizer = this.scene['rexUI'].add.fixWidthSizer({
			width: Space.windowWidth,
			space: {
				// left: Space.pad,
				right: Space.pad,
				bottom: Space.pad,
				// line: Space.pad,
			}
		}).setOrigin(0)

		sizer.add(this.createHeader())
		.addNewLine()
		.add(this.createPanel())

		this.createButtons(callback).layout()

		// Create chart showing details about selected deck
		this.createChart()

		sizer.layout()
	}

	private createHeader(): any {
		let background = this.scene.add.rectangle(0, 0, 420, 420, Color.background2)

		let panel = this.scene['rexUI'].add.sizer({
			width: Space.windowWidth,
			space: {
				top: Space.pad,
				bottom: Space.pad,
			}
		}).addBackground(background)

		// Add each of the avatars
		panel.addSpace()
		for (let i = 0; i < avatarDetails.length; i++) {
			let container = new ContainerLite(this.scene, 0, 0, Space.avatarSize, Space.avatarSize)
			this.avatarsSmall[i] = new Buttons.Avatar(container, 0, 0, i, () => {
				// Set which avatar is selected
				this.selectedAvatar = i
				this.avatarsSmall.forEach(a => a.deselect())
				this.avatarsSmall[i].select()

				// Adjust displayed content
				this.setContent(avatarDetails[i])
			})

			// Select this avatar if appropriate
			if (i === this.selectedAvatar) {
				this.avatarsSmall[i].select()
			}
			
			panel.add(container)
			.addSpace()
		}

		// Give the background a drop shadow
		this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
			distance: 3,
			angle: -90,
			shadowColor: 0x000000,
		})

		return panel
	}

	// Create all of the content about the selected character
	private createPanel(): void {
		let panel = this.scene['rexUI'].add.sizer({
			// width: Space.windowWidth,
			space: {
				left: Space.pad,
				item: Space.pad,
			},
			align: 'top',
		})

		this.avatarFull = this.scene.add.image(0, 0, `avatar-${avatarDetails[0].name}Full`)
		
		// Scale to fit in the window
		let space = Space.windowHeight - Space.pad * 3 - Space.avatarSize
		let ratio = space / this.avatarFull.height
		this.avatarFull.setScale(ratio)

		panel.add(this.avatarFull)
		.add(this.createText(), {align: 'top'})

		return panel
	}

	private createText(): any {
		let panel = this.scene['rexUI'].add.fixWidthSizer()

		// Hint on which information is displayed
		let hint = new Hint(this.scene)

		// TODO Displayed the selected one
		this.txtName = this.scene.add.text(0, 0, '', Style.announcement)
		this.txtSurname = this.scene.add.text(0, 0, '', Style.surname)
		this.txtDescription = this.scene['rexUI'].add.BBCodeText({
			style: BBStyle.description,
		})
		.setFixedSize(Space.maxTextWidth + Space.padSmall*2, 360)
		.setInteractive()
		.on('areaover', function (key: string) {
			if (key[0] === '_') {
				hint.showCard(key.slice(1))
			} else {
				hint.showKeyword(key)
			}
		})
		.on('areaout', () => {
			hint.hide()
		})

		// Add all this text to the panel
		panel.add(this.txtName)
		.addNewLine()
		.add(this.txtSurname)
		.addNewLine()
		.add(this.txtDescription)

		return panel
	}

	private createButtons(callback: (number) => void): any {
		const width = this.txtDescription.displayWidth

		let panel = this.scene['rexUI'].add.sizer({
			x: this.avatarFull.displayWidth + Space.pad*2,
			y: Space.windowHeight - Space.pad,
			width: width,
			space: {
				item: Space.pad,
			}
		}).setOrigin(0, 1)

		let c1 = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
		let btnCancel = new Buttons.Basic(c1, 0, 0, 'Cancel', () => {
			this.close()
		})
		panel
		.add(c1)
		.addSpace()

		let c2 = new ContainerLite(this.scene, 0, 0, Space.smallButtonWidth, Space.smallButtonHeight)
		let btnSelect = new Buttons.Basic(c2, 0, 0, 'Select', () => {
			callback(this.selectedAvatar)
			this.close()
		})
		panel.add(c2)
		// .addSpace()

		return panel
	}

	private createChart(): void {
		this.chart = this.scene['rexUI'].add.chart(
			Space.windowWidth,
			Space.avatarSize + Space.pad * 2,
			450,
			450,
			{
			type: 'radar',
			data: {
				labels: ['Difficulty', 'Speed', 'Control', 'Max Points', 'Combos'],
				datasets: [
				{
					label: '',
					borderColor: Color.radar,
					pointBackgroundColor: Color.radar,
					data: [1, 1, 1, 1, 1],
				},
				]
			},
			options: {
				animation: {
					duration: Time.chart,
					easing: 'easeOutQuint',
				},
				plugins: {
					legend: {
						display: false,
					},
				},
                scales: {
                	r: {
                		min: 0,
                		max: 5,
                		ticks: {
                			stepSize: 1,
                			display: false
                		},
                		pointLabels: {
                			font: {
                				size: 20
                			}
                		}
                	},
                }
            }
		}).setOrigin(1, 0)
	}

	// Populate the content objects with the given avatar details
	private setContent(details): void {
		// Image
		this.avatarFull.setTexture(`avatar-${details.name}Full`)

		// Text
		this.txtName.setText(`${details.name}`)
		this.txtSurname.setText(`${details.surname}`)
		this.txtDescription.setText(`${details.description}`)

		// Chart
		for (let i = 0; i < details.chart.length; i++) {
			this.chart.setChartData(0, i, details.chart[i])
		}
		this.chart.updateChart()
	}
}
