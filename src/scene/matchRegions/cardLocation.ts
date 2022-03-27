// Locations for all of the cards on screen based on their region and index

import 'phaser'

import ClientState from '../../lib/clientState'
import { Space } from '../../settings/settings'

// Amount of room to leave to the right of the last card in either hand
const minRoom = 300 + Space.cardWidth

// This describes where on screen each card in each region should appear
// so that regions can move their cards to the appropriate locations for
// other regions
export default class CardLocation {
	static ourHand(state: ClientState, i: number, container: Phaser.GameObjects.Container): [number, number] {
		// X of the first card in their hand
		const x0 = 300

		let dx = (Space.cardWidth + Space.pad)

		// If their hand has too many cards for the screen size, scale down
		// Amount of room to leave to the right of the last card
		const maxOffset = Space.windowWidth - x0 - minRoom

		// Find the amount that we must scale down by
		// offset of last card <= maxOffset
		// This may be multiplied by a constant to fit within the max
		const lastCardOffset = dx * (state.hand.length - 1)
		if (lastCardOffset > maxOffset) {
			dx *= maxOffset / lastCardOffset
		}

		// Offset from the first card
		const xOffset = dx * i
		const x = x0 + xOffset

		const y = Space.windowHeight - Space.handHeight + Space.cardHeight/2

		return [x - container.x, y - container.y]
	}

	static theirHand(state: ClientState, i: number, container: Phaser.GameObjects.Container): [number, number] {
		// X of the first card in their hand
		const x0 = 300

		let dx = (Space.cardWidth + Space.pad)

		// If their hand has too many cards for the screen size, scale down
		const maxOffset = Space.windowWidth - x0 - minRoom

		// Find the amount that we must scale down by
		// offset of last card <= maxOffset
		// This may be multiplied by a constant to fit within the max
		const lastCardOffset = dx * (state.opponentHandSize - 1)
		if (lastCardOffset > maxOffset) {
			dx *= maxOffset / lastCardOffset
		}

		// Offset from the first card
		const xOffset = dx * i
		const x = x0 + xOffset

		// y = regionHeight - h/2
		const y = 150 - Space.cardHeight/2

		return [x - container.x, y - container.y]
	}

	static story(state:ClientState, i: number, container: Phaser.GameObjects.Container, owner: number): [number, number] {
		const x0 = 300
		const dx = Space.cardWidth - Space.storyXOverlap
		const x = x0 + dx * i

		// TODO squishing
		let y
		switch (owner) {
			case undefined:
				y = Space.windowHeight/2
				break
			case 0:
				y = Space.windowHeight/2 + (Space.cardHeight/2 - Space.storyYOverlap)
				break
			case 1:
				y = Space.windowHeight/2 - (Space.cardHeight/2 - Space.storyYOverlap)
				break
		}

		return [x - container.x, y - container.y]
	}

	static ourDeck(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x = 30 - dx
		const y = Space.windowHeight/2 + Space.cardHeight/2 + Space.pad
		return [x - container.x, y - container.y]
	}

	static theirDeck(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x = 30 - dx
		const y = Space.windowHeight/2 - Space.cardHeight/2 - Space.pad
		return [x - container.x, y - container.y]
	}

	static ourDiscard(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x0 = Space.windowWidth - 30
		const x = x0 + dx
		const y = Space.windowHeight/2 + Space.cardHeight/2 + Space.pad
		return [x - container.x, y - container.y]
	}

	static theirDiscard(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x0 = Space.windowWidth - 30
		const x = x0 + dx
		const y = Space.windowHeight/2 - Space.cardHeight/2 - Space.pad
		return [x - container.x, y - container.y]
	}

	static overlay(container: Phaser.GameObjects.Container, i = 0, total: number): [number, number] {
		const cardsPerRow = 15

		// TODO Center this horizontally, wrap vertically if we hit ~20 cards
		const iFromMiddle = Math.min(cardsPerRow, total)
		const x0 = Space.windowWidth/2 - Math.min(cardsPerRow - 1, total - 1) * 60/2
		const dx = 60 * (i % cardsPerRow)
		const x = x0 + dx
		
		const extraRows = Math.floor((total - 1) / cardsPerRow)
		const y0 = Space.windowHeight/2 - extraRows * (Space.cardHeight + Space.pad)/2
		const dy = (Space.cardHeight + Space.pad) * Math.floor(i / cardsPerRow)
		const y = y0 + dy
		return [x - container.x, y - container.y]
	}

	static mulligan(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const x0 = Space.windowWidth/2 - Space.cardWidth - Space.pad
		const x = x0 + i * (Space.cardWidth + Space.pad)
		const y = Space.windowHeight/2
		return [x - container.x, y - container.y]
	}
}
