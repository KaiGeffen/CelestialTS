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

function decodeAnimation(from: string, to: string, target: string, extraTarget: string): Animation {
	let dict = {
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

	// If going to your hand or story, the target is referenced by index, otherwise it's a card
	let card: Card = undefined
	let index: number = undefined
	let index2: number = undefined
	let status: Status = undefined

	// TODO This is hacky, just send all fields from server
	if (dict[to] === Zone.Hand || dict[from] === Zone.Mulligan || dict[to] === Zone.Story) {
		index = parseInt(target)


		if (dict[from] === dict[to]) {
			card = decodeCard(extraTarget)
		}
	}
	else if (dict[from] === Zone.Status) {
		status = Status[target]
	}
	else if (dict[from] === dict[to]) {
		card = decodeCard(target)
	}
	else {
		card = decodeCard(target)
	}

	// If coming from the story, the target has an additional index for its position therein
	if (dict[from] === Zone.Story) {
		index2 = parseInt(extraTarget)
	}
	else if (dict[from] === Zone.Transform) {
		card = decodeCard(extraTarget)
	}

	// return dict[s]
	return new Animation(
		dict[from],
		dict[to],
		card,
		index,
		index2,
		status)
}

export function decodeAnimationList(l: [from: string, to: string, target: string, extraTarget: string][]): Animation[] {
	return l.map(s => decodeAnimation(...s))
}
