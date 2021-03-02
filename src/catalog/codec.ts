import { Card, collectibleCards } from "./catalog";
import Story from "../story"


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
	let cardStrings: string[] = s.split(delims[1])

	return cardStrings.map(decodeCard)
}

function decodeStory(s: string): Story {
	let story = new Story()
	if (s === '') return story

	s.split(delims[1]).forEach( function(act) {
		let l = act.split(delims[2])

		let card = decodeCard(l[0])
		let owner = +l[1]

		story.addAct(card, owner, -1)
	})
	
	return story
}


export {encodeCard, decodeCard, encodeDeck, decodeDeck, decodeStory}
