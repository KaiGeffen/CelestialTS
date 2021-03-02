import { Card, collectibleCards } from "./catalog";


const delims = ['¡', '™', '£']

function encodeCard(card: Card): string {
	return card.id.toString()
}

function decodeCard(s: string): Card {
	// Todo dynamic text
	let id: number = +s;

	collectibleCards.forEach( (card) => {
		if (id === card.id) {
			return card
		}
	})

	return undefined;
}

function encodeDeck(deck: Card[]): string {
	return deck.map(encodeCard).join(delims[1])
}

function decodeDeck(s: string): Card[] {
	let cardStrings: string[] = s.split(delims[1])
	return cardStrings.map(decodeCard)
}

export {encodeCard, decodeCard, encodeDeck, decodeDeck}

