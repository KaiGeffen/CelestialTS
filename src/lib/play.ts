import Card from './card'


export default class Play {
	card: Card
	owner: number
	text: string

	constructor(card: Card, owner: number, text: string) {
		this.card = card
		this.owner = owner
		this.text = text
	}
}
