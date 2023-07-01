import 'phaser';
import MenuScene from '../menuScene'
import Menu from './menu'
import Card from '../../lib/card'
import { CardImage, FullSizeCardImage } from '../../lib/cardImage'
import { Style, BBStyle, Space } from '../../settings/settings'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';


const cardX = Space.windowWidth - Space.buttonWidth - Space.pad*2 - Space.fullCardWidth/2

// A card is focused and has its options available
export default class FocusMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, 0)

		let card = params.card
		let callback = params.callback
		let cost = params.cost
		let btnString = params.btnString
		let closeOnClick = params.closeOnClick

		this.createContent(card, callback, cost, btnString, closeOnClick)
		
		// this.layout()
	}

	private createContent(card: Card, callback: () => void, cost: number, btnString: string, closeOnClick: boolean): void {
		// TODO Generalize when cards have more than 1 reference max
		let refs = card.getReferencedCards()
		if (refs.length > 0) {
			this.createReferenceContent(card, refs[0])
		}

		this.createKeywords(card)
		this.createCard(card, cost)
		this.createButtons(callback, btnString, closeOnClick)
	}

	private createKeywords(card: Card): void {
		const width = cardX - Space.fullCardWidth/2 - Space.pad*2
		const x = cardX - Space.fullCardWidth/2 - Space.pad
		const s = card.getHintText()

		let txt = this.scene.rexUI.add.BBCodeText(
			x,
			Space.windowHeight/2,
			s,
			{
				...BBStyle.hint,
				wrap: {mode: 'word', width: width},
			})
		.setOrigin(1, 0.5)
		.setVisible(s !== '')
	}

	private createCard(card: Card, cost: number): Phaser.GameObjects.Container {
		// Full size CardImage within a container
		let container = this.scene.add.container(cardX, Space.windowHeight/2)
		let cardImage = new FullSizeCardImage(card, container, true)
		
		// Set the card's custom cost, if it has one
		if (cost !== undefined) {
			cardImage.setCost(cost)
		}

		return container
	}

	private createButtons(callback: () => void, btnString: string, closeOnClick: boolean): void {
		const x = Space.windowWidth - Space.pad - Space.buttonWidth/2
		if (btnString !== '') {
			new Buttons.Basic(this.scene, x, Space.windowHeight/3, btnString, () => {
				callback()

				if (closeOnClick) {
					this.endScene()
				}
			}, true)
		}
		new Buttons.Basic(this.scene, x, 2 * Space.windowHeight/3, 'Cancel', () => {
			this.endScene()
		}, true)
	}

	private createReferenceContent(card: Card, ref: Card): void {
		let container = this.createCard(ref, undefined)
		.setDepth(-1)
		container.setX(container.x + Space.pad)
		.setY(container.y - Space.pad)
		
		// Button to switch between card and reference
		const x = Space.windowWidth - Space.pad - Space.buttonWidth/2
		let btn = new Buttons.Basic(this.scene, x, Space.windowHeight/2, `${ref.name}`)
		btn.setOnClick(() => {
			// Flip referenced card above/below focused card
			container.setDepth(container.depth * -1)

			// Set the name of card to see
			if (container.depth < 0) {
				btn.setText(`${ref.name}`)
			}
			else {
				btn.setText(`${card.name}`)
			}
		})
	}
}
