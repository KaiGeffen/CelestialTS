import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import { Style } from '../../settings/settings'
import { keywords } from '../../catalog/keywords'


function getHint(btn: Button, status: string): string {
	let keyword = keywords.find((value) => {
		return value.key === status
	})

	let s = keyword.text

	// Remove the first X (In image data)
	s = s.replace(' X', '')

	// Get the value from the given status button
	s = s.split(/\bX\b/).join(btn.getText())

	return s
}


class KeywordButton extends Button {
	setText(s: string): Button {
		let result = super.setText(s)

		this.makeHintable()

		return result
	}

	// Keep the text centered
	setOrigin(...args): Button {
		this.icon.setOrigin(...args)
		
		return this
	}
}


export class InspireButton extends KeywordButton {
	constructor(within: Phaser.GameObjects.Container,
		x: number, y: number,
		text: string = '',
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false,
				style: Style.basic,
			},
			icon: {
				name: `Inspire`,
				interactive: true,
			},
			callbacks: {
				click: f,
			}
		})

		this.txt.setPosition(x + 52, y + 17)
	}

	makeHintable(): Button {
		const s = getHint(this, 'Inspired')

		return super.makeHintable(s)
	}
}

export class NourishButton extends KeywordButton {
	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		text: string = '',
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false,
				style: Style.basic,
			},
			icon: {
				name: `Nourish`,
				interactive: true
			},
			callbacks: {
				click: f,
			}
		})

		this.txt.setPosition(x + 52, y + 17)
	}

	makeHintable(): Button {
		const s = getHint(this, 'Nourish')

		return super.makeHintable(s)
	}
}

export class SightButton extends KeywordButton {
	constructor(within: Phaser.GameObjects.Container,
		x: number, y: number,
		text: string = '',
		f: () => void = function() {})
	{
		super(within, x, y, 
		{
			text: {
				text: text,
				interactive: false,
				style: Style.basic,
			},
			icon: {
				name: `Sight`,
				interactive: true,
			},
			callbacks: {
				click: f,
			}
		})

		this.txt.setPosition(x + 11, y - 15)
	}

	makeHintable(): Button {
		const s = `${getHint(this, 'Sight')}\nYour opponent doesn't know this.`

		return super.makeHintable(s)
	}
}