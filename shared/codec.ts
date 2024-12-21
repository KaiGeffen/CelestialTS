import Catalog from './state/catalog'
import Card from './state/card'

const delims = ['¡', '™', '£']
const full_state_delim = 'ª'

// Get a card given by its id
function getCard(id: string): Card {
  return Catalog.allCards.find((card) => card.id === parseInt(id))
}

function encodeCard(card: Card): string {
  return card.id.toString()
}

function decodeCard(s: string): Card {
  let sections = s.split(delims[2])

  return getCard(sections[0])
}

function encodeDeck(deck: Card[] | string): string {
  if (deck === undefined || deck === '') {
    return ''
  }

  let cards = []
  if (typeof deck === 'string') {
    cards = deck.split(':').map((id) => {
      return getCard(id)
    })
  } else {
    cards = deck
  }

  return cards.map(encodeCard).join(delims[1])
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

// Encode / decode a string for deck's code such that user can copy / paste it
function encodeShareableDeckCode(s: string): string {
  return s
    .split(':')
    .map((cardId) => {
      let hexString = parseInt(cardId).toString(16).toUpperCase()
      let padded = hexString.padStart(3, '0')
      return padded
    })
    .join('')
}
function decodeShareableDeckCode(s: string): string {
  try {
    return (s.match(/.{1,3}/g) ?? [])
      .map((charTuple) => {
        return encodeCard(getCard(parseInt(charTuple, 16).toString()))
      })
      .join(':')
  } catch (error) {
    return undefined
  }
}

export {
  encodeCard,
  decodeCard,
  encodeDeck,
  decodeDeck,
  encodeShareableDeckCode,
  decodeShareableDeckCode,
}
