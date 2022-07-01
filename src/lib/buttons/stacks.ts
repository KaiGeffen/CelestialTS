import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import { Color } from '../../settings/settings'


export class DeckButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
		)
	{
		super(within, x, y, 
		{
			text: {
				text: '',
				interactive: false
			},
			icon: {
				name: 'Deck',
				interactive: true
			},
		})
	}

	setText(s: string): Button {
		let result = super.setText(s)

		const hint = `You have ${s} cards in your deck.\nClick to see them all (unordered).`
		this.makeHintable(hint)

		return result
	}
}


export class DiscardButton extends Button {
	constructor(
		within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number,
		y: number,
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
	}

	setText(s: string): Button {
		let result = super.setText(s)

		const hint = `You have ${s} cards in your discard pile.\nClick to see them all.`
		this.makeHintable(hint)

		return result
	}
}
