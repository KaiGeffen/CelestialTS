export enum Animation {
	Draw,
	Discard,
	TutorDeck,
	TutorDiscard,
	Create,
	Shuffle,
	Mill
}

function decodeAnimation(s: string): Animation {
	let dict = {
		'draw': Animation.Draw,
		'discard': Animation.Discard,
		'tutor_deck': Animation.TutorDeck,
		'tutor_discard': Animation.TutorDiscard,
		'create': Animation.Create,
		'shuffle': Animation.Shuffle,
		'mill': Animation.Mill
	}

	return dict[s]
}

export function decodeAnimationList(l: string[]): Animation[] {
	return l.map(s => decodeAnimation(s))
}
