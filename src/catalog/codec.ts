import { Card, collectibleCards } from "./catalog";


const delims = ['¡', '™', '£']

function encodeCard(card: Card): string {
	return card.id.toString()
}

function decodeCard(s: string): Card {
	// Todo dynamic text
	let id: number = +s;
	
	return collectibleCards.find(card => card.id === id)
}

function encodeDeck(deck: Card[]): string {
	return deck.map(encodeCard).join(delims[1])
}

function decodeDeck(s: string): Card[] {
	console.log('Decoding deck ', s)
	let cardStrings: string[] = s.split(delims[1])
	console.log('to these strings', cardStrings)
	let result: Card[] = cardStrings.map(decodeCard)
	console.log(result)
	return result
}

export {encodeCard, decodeCard, encodeDeck, decodeDeck}

