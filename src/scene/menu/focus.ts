import 'phaser';
import MenuScene from '../menuScene'
import Menu from './menu'
import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, Space } from '../../settings/settings'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'

// A message to the user
const width = Space.windowWidth

export default class FocusMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		let card = params.card
		let callback = params.callback

		this.createContent(card, callback)
		
		this.layout()
	}

	private createContent(card: Card, callback: () => void): void {
		let sizer = this.scene['rexUI'].add.sizer({
			width: Space.windowWidth,
			space: {item: Space.pad},
		})

		sizer.add(this.createKeywords())
		sizer.add(this.createCard(card))
		sizer.add(this.createButtons(callback))

		this.sizer.add(sizer)
	}

	private getSizer() {
		return this.scene['rexUI'].add.fixWidthSizer({
			width: (Space.windowWidth - Space.pad*2)/3,
			space: {
				item: Space.pad,
				left: Space.pad,
				right: Space.pad,
			}
		})
	}

	private createKeywords() {
		let sizer =  this.getSizer()

		// CardImage within a container
		// let container = new ContainerLite(this.scene, 0, 0, Space.cardWidth, Space.cardHeight)
		// let cardImage = new CardImage(card, container, true)

		// // Text
		let txt = this.scene.add.text(0, 0, 'fjdsklfjdsklfjdsklf', Style.basic)
		.setWordWrapWidth(width - Space.cardWidth - Space.pad * 3)

		sizer
		// .add(container)
		.add(txt)

		// Add this new sizer to the main sizer		
		// const padding = {space: {

		// 	left: Space.pad,
		// 	right: Space.pad,
		// }}

		// this.sizer.add(sizer, padding)
		// .addNewLine()

		return sizer
	}

	private createCard(card: Card) {
		let sizer = this.getSizer()

		// CardImage within a container
		let container = new ContainerLite(this.scene, 0, 0, Space.cardWidth, Space.cardHeight)
		let cardImage = new CardImage(card, container, true)

		sizer.add(container)
		return sizer
	}

	private createButtons(callback: () => void) {
		let sizer = this.getSizer()

		let containerPlay = new ContainerLite(this.scene)
		new Buttons.Basic(containerPlay, 0, Space.windowHeight/3, 'Play', callback, true)
		let containerCancel = new ContainerLite(this.scene)
		new Buttons.Basic(containerCancel, 0, 2 * Space.windowHeight/3, 'Cancel', () => { this.endScene() }, true)

		sizer.add(containerPlay)
		.add(containerCancel)

		return sizer
	}
}
