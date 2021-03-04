import { Card, allCards } from "./catalog";
import Story from "../story"


const delims = ['¡', '™', '£']

function encodeCard(card: Card): string {
	return card.id.toString()
}

function decodeCard(s: string): Card {
	// Todo dynamic text
	let id: number = +s;
	let result = allCards.find(card => card.id === id)

	return result
}

function encodeDeck(deck: Card[]): string {
	return deck.map(encodeCard).join(delims[1])
}

function decodeDeck(s: string): Card[] {
	if (s === '') return []

	let cardStrings: string[] = s.split(delims[1])

	return cardStrings.map(decodeCard)
}

function decodeStory(s: string): Story {
	let story = new Story()
	if (s === '') return story

	s.split(delims[0]).forEach( function(act) {
		let l = act.split(delims[1])

		let card = decodeCard(l[0])
		let owner = +l[1]

		story.addAct(card, owner, -1)
	})
	
	return story
}

// TODO Make a more robust status module once the desired functionality is known
const allStatuses = ['Inspires', 'Nourish', 'Starve', 'Restricted']

function decodeStatuses(s: string): string {
	if (s === '') return ''

	let statuses = s.split(delims[0])

	let result = ''
	allStatuses.forEach(function(statusType) {

		let count = 0
		statuses.forEach(function(status) {
			if (status === statusType) {
				count++
			}
		})

		if (count > 0) result += `${statusType} ${count}, `
	})

	return result.slice(0, -2)
}

export {encodeCard, decodeCard, encodeDeck, decodeDeck, decodeStory, decodeStatuses}
