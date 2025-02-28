// Cosmetic settings for a deck
export interface DeckCosmetics {
  // Avatar id
  avatar: number
  // TODO More cosmetics
}

// Complete deck type
export interface Deck {
  name: string
  // Array of card IDs
  cards: number[]
  cosmetics: DeckCosmetics
}

// For database storage, we can serialize the deck to a string
export function serializeDeck(deck: Deck): string {
  return JSON.stringify(deck)
}

// And deserialize from database
export function deserializeDeck(deckString: string): Deck {
  return JSON.parse(deckString)
}
