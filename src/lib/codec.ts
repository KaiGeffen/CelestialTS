import { allCards } from "../catalog/catalog"
import Card from './card'
import Story from './story'
import Recap from './recap'
import ClientState from './clientState'
import { Status } from './status'


const delims = ['¡', '™', '£']
const full_state_delim = 'ª'

function encodeCard(card: Card): string {
	return card.id.toString()
}

function decodeCard(s: string): Card {
	let sections = s.split(delims[2])

	let cardId = parseInt(sections[0])
	let baseCard = allCards.find(card => card.id === cardId)

	if (sections.length == 1) {
		return baseCard
	} else {
		let dynamicText = sections[1]

		let points = parseInt(dynamicText.split(':')[1].split(',')[0])

		// NOTE A new copy of the card is created so that all instances (of Bastet, for example) won't have the same dynamic text
		let data = {
			name: baseCard.name,
			id: baseCard.id,
			cost: baseCard.cost,
			points: points,
			text: baseCard.text,
			dynamicText: dynamicText,
			catalogText: '',
			rarity: baseCard.rarity,
			story: ''
		}

		return new Card(data)
	}
}

function encodeDeck(deck: Card[]): string {
	return deck.map(encodeCard).join(delims[1])
}

function decodeDeck(s: string): Card[] {
	if (s === '') return []

	let cardStrings: string[] = s.split(delims[1])

	let result = cardStrings.map(decodeCard)

	if (result.includes(undefined)) {
		result = undefined
	}

	return result
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
const allStatuses = ['Inspired', 'Inspire', 'Nourish', 'Starve', 'Restricted']

function decodeStatuses(s: string): Status[] {
	let result: Status[] = []
	
	// Split the string into substrings
	s.split(delims[0]).forEach(function(ss) {

		// If any of those are statuses, add them to the list
		if (Status[ss] !== undefined) {
			result.push(Status[ss])
		}
	})

	return result

	// if (s === '') return []

	// let statuses = s.split(delims[0])

	// let result = ''
	// allStatuses.forEach(function(statusType) {

	// 	let count = 0
	// 	statuses.forEach(function(status) {
	// 		if (status === statusType) {
	// 			count++
	// 		}
	// 	})

	// 	if (count > 0) result += `${statusType} ${count}, `
	// })

	// return result.slice(0, -2)
}

function decodeRecap(s: string): Recap {
	let arr = s.split(full_state_delim)
	let simpleRecap = arr[0]
	arr = arr.slice(1)

	// The list of states player sees before/after each act in the story
	let stateList: ClientState[] = arr.map(s => new ClientState(JSON.parse(s)))

	let sections = simpleRecap.split(delims[0])
	let sums = sections[0].split(delims[1]).map(parseFloat)
	let wins = sections[1].split(delims[1]).map(parseFloat)
	let safety = sections[2].split(delims[1]).map(parseFloat)

	let plays = sections.slice(3)

	function decodePlay(play: string): [Card, number, string] {
		let l = play.split(delims[1])

		let card = decodeCard(l[0])
		let owner = +l[1]
		let text = l[2]

		return [card, owner, text]
	}

	let playList = plays.map(decodePlay)

	return new Recap(sums, wins, safety, playList, stateList)
}

export {encodeCard, decodeCard, encodeDeck, decodeDeck, decodeStory, decodeStatuses, decodeRecap}
