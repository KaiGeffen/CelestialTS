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

		// y = regionHeight - h/2
		const y = Space.windowHeight - 150 + Space.cardHeight/2

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
		const dx = Space.cardWidth - Space.storyOverlap
		const x = x0 + dx * i
		// TODO Squishing

		let y
		if (owner === undefined) {
			y = Space.windowHeight/2
		} else {
			y = owner === 0 ? Space.windowHeight/2 + 80 : Space.windowHeight/2 - 80			
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

	static overlay(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 60 * i
		const x = 200 + dx
		const y = Space.windowHeight/2
		return [x - container.x, y - container.y]
	}
}
