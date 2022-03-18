import 'phaser'

import ClientState from '../../lib/clientState'
import { Space } from '../../settings/settings'

// Amount of room to leave to the right of the last card
const minRoom = 300 + Space.cardWidth/2

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
		const lastCardOffset = dx * state.hand.length
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
		const lastCardOffset = dx * state.opponentHandSize
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

	static ourDeck(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x = 30 - dx
		return [x - container.x, 550 - container.y]
	}

	static theirDeck(container: Phaser.GameObjects.Container, i = 0): [number, number] {
		const dx = 3 * i
		const x = 30 - dx
		return [x - container.x, 250 - container.y]
	}
}
