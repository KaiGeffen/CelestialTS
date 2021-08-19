import Card from './card'
import { decodeCard } from './codec'


// export enum Animation {
// 	Draw,
// 	Discard,
// 	TutorDeck,
// 	TutorDiscard,
// 	Create,
// 	Shuffle,
// 	Mill,
// 	Top
// }
export enum Zone {
	Hand,
	Deck,
	Discard,
	Story,

	Create,
	Shuffle,
}

export class Animation {
	from: Zone
	to: Zone
	card: Card
	index: number

	constructor(from, to, card, index) {
		this.from = from
		this.to = to
		this.card = card
		this.index = index
	}
}

function decodeAnimation(from: string, to: string, target: string): Animation {
	// let dict = {
	// 	'draw': Animation.Draw,
	// 	'discard': Animation.Discard,
	// 	'tutor_deck': Animation.TutorDeck,
	// 	'tutor_discard': Animation.TutorDiscard,
	// 	'create': Animation.Create,
	// 	'shuffle': Animation.Shuffle,
	// 	'mill': Animation.Mill,
	// 	'top': Animation.Top
	// }
	let dict = {
		'Hand': Zone.Hand,
		'Deck': Zone.Deck,
		'Discard': Zone.Discard,
		'Story': Zone.Story,

		'Create': Zone.Create,
		'Shuffle': Zone.Shuffle,
	}

	// If going to your hand, the target is referenced by index, otherwise it's a card
	let card: Card = undefined
	let index: number = undefined

	if (dict[to] === Zone.Hand) { // TODO Or Story
		index = parseInt(target)
	}
	else {
		card = decodeCard(target)
	}

	// return dict[s]
	return new Animation(
		dict[from],
		dict[to],
		card,
		index)
}

export function decodeAnimationList(l: [from: string, to: string, target: string][]): Animation[] {
	return l.map(s => decodeAnimation(...s))
}
