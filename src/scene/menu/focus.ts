import 'phaser';
import MenuScene from '../menuScene'
import Menu from './menu'
import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, BBStyle, Space } from '../../settings/settings'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import Buttons from '../../lib/buttons/buttons'
import Button from '../../lib/buttons/button'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';


// A card is focused and has its options available
export default class FocusMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, 0)

		let card = params.card
		let callback = params.callback

		this.createContent(card, callback)
		
		// this.layout()
	}

	private createContent(card: Card, callback: () => void): void {
		this.createKeywords(card)
		this.createCard(card)
		this.createButtons(callback)
	}

	private createKeywords(card: Card): void {
		const width = Space.windowWidth/2 - Space.cardWidth/2 - Space.pad*2
		const x = Space.windowWidth/2 - Space.cardWidth/2 - Space.pad - width/2
		let txt = this.scene.rexUI.add.BBCodeText(
			x,
			Space.windowHeight/2,
			card.getHintText(),
			{
				...BBStyle.hint,
				wrap: {mode: 'word', width: width},
			})
		.setOrigin(0.5)
	}

	private createCard(card: Card): void {
		// CardImage within a container
		let container = this.scene.add.container(Space.windowWidth/2, Space.windowHeight/2)
		let cardImage = new CardImage(card, container, true)
	}

	private createButtons(callback: () => void): void {
		const x = Space.windowWidth * 5/6
		new Buttons.Basic(this.scene, x, Space.windowHeight/3, 'Play', callback, true)
		new Buttons.Basic(this.scene, x, 2 * Space.windowHeight/3, 'Cancel', () => { this.endScene() }, true)
	}
}
