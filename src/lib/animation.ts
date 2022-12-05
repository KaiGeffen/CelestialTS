import Card from './card'
import { decodeCard } from './codec'
import { Status } from './status'


export enum Zone {
	Hand,
	Deck,
	Discard,
	Story,
	Gone,

	Mulligan,
	Create,
	Shuffle,
	Status,
	Transform,
}

export class Animation {
	from: Zone
	to: Zone
	card: Card
	index: number
	index2: number
	status: Status

	constructor(from, to, card, index, index2, status) {
		this.from = from
		this.to = to
		this.card = card
		this.index = index
		this.index2 = index2
		this.status = status
	}
}

function decodeAnimation(animation: animationData): Animation {
	const dict = {
		'Hand': Zone.Hand,
		'Deck': Zone.Deck,
		'Discard': Zone.Discard,
		'Story': Zone.Story,
		'Gone': Zone.Gone,

		'Mulligan': Zone.Mulligan,
		'Shuffle': Zone.Shuffle,
		'Status': Zone.Status,
		'Transform': Zone.Transform,
	}

	let card = animation.card === null ? null : decodeCard(animation.card)

	let status = animation.zone_from === 'Status' ? animation.index : null

	// return dict[s]
	return new Animation(
		dict[animation.zone_from],
		dict[animation.zone_to],
		card,
		animation.index,
		animation.index2,
		status)
}

interface animationData {
	zone_from,
	zone_to,
	card,
	index,
	index2
}

export function decodeAnimationList(l: animationData[]): Animation[] {
	return l.map(animation => decodeAnimation(animation))
}
