import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import { Color } from '../../settings/settings'


export class DeckButton extends Button {
	owner: number

	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		owner: number,
		)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false,
				offsetX: 3,
				offsetY: 5,
			},
			icon: {
				name: 'Deck',
				interactive: true
			},
		})

		this.owner = owner
	}

	setText(s: string): Button {
		let result = super.setText(s)

		let hint
		if (this.owner === 0) {
			hint = `You have ${s} cards in your deck.\nClick to see them all (unordered).`
		}
		else {
			hint = `They have ${s} cards in their deck.\nClick to see their last shuffle.`
		}
		this.makeHintable(hint)

		return result
	}
}


export class DiscardButton extends Button {
	owner: number

	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		owner: number,
		)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false
			},
			icon: {
				name: 'Discard',
				interactive: true
			},
		})

		this.owner = owner
	}

	setText(s: string): Button {
		let result = super.setText(s)

		let hint
		if (this.owner === 0) {
			hint = `You have ${s} cards in your discard pile.\nClick to see them all.`
		}
		else {
			hint = `They have ${s} cards in their discard pile.\nClick to see them all.`
		}
		this.makeHintable(hint)

		return result
	}
}
