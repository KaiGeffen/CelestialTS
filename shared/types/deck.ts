// Cosmetic settings for a deck
export interface DeckCosmetics {
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
