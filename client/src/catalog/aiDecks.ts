import { Deck } from '../../../shared/types/deck'

const decks: Deck[] = [
  {
    name: 'Hyperthin Sun',
    cards: [56, 65, 65, 51, 12, 12, 7, 7, 7, 4, 4, 4, 4, 4, 4],
    cosmetics: {
      avatar: 0,
    },
  },
  {
    name: 'Death',
    cards: [21, 20, 20, 17, 17, 14, 14, 6, 3, 3, 3, 3, 3, 0, 0],
    cosmetics: {
      avatar: 1,
    },
  },
  {
    name: 'Oak Cling',
    cards: [23, 20, 19, 19, 19, 19, 13, 11, 12, 1, 1, 1, 1, 1, 1],
    cosmetics: {
      avatar: 1,
    },
  },
  {
    name: 'Is this pet idk',
    cards: [71, 11, 11, 11, 11, 34, 34, 33, 33, 33, 4, 28, 28, 28, 0],
    cosmetics: {
      avatar: 4,
    },
  },
  {
    name: 'Future top out',
    cards: [22, 22, 15, 60, 10, 11, 8, 8, 8, 4, 4, 2, 2, 2, 2],
    cosmetics: {
      avatar: 4,
    },
  },
]

export default function getRandomAiDeck(): Deck {
  return decks[Math.floor(Math.random() * decks.length)]
}
