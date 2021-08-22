import Card from './card'
import { decodeCard } from './codec'
import { Status } from './status'


export enum Zone {
	Hand,
	Deck,
	Discard,
	Story,
	Gone,

	Create,
	Shuffle,
	Status,
}

export class Animation {
	from: Zone
	to: Zone
	card: Card
	index: number
	status: Status

	constructor(from, to, card, index, status) {
		this.from = from
		this.to = to
		this.card = card
		this.index = index
		this.status = status
	}
}

function decodeAnimation(from: string, to: string, target: string): Animation {
	let dict = {
		'Hand': Zone.Hand,
		'Deck': Zone.Deck,
		'Discard': Zone.Discard,
		'Story': Zone.Story,
		'Gone': Zone.Gone,

		'Shuffle': Zone.Shuffle,
		'Status': Zone.Status,
	}

	// If going to your hand, the target is referenced by index, otherwise it's a card
	let card: Card = undefined
	let index: number = undefined
	let status: Status = undefined

	if (dict[to] === Zone.Hand) { // TODO Or Story
		index = parseInt(target)
	}
	else if (dict[from] === Zone.Status) {
		status = Status[target]
	}
	else {
		card = decodeCard(target)
	}

	// return dict[s]
	return new Animation(
		dict[from],
		dict[to],
		card,
		index,
		status)
}

export function decodeAnimationList(l: [from: string, to: string, target: string][]): Animation[] {
	return l.map(s => decodeAnimation(...s))
}
