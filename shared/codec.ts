import Catalog from './state/catalog'
import Card from './state/card'

const delims = ['¡', '™', '£']
const full_state_delim = 'ª'

// TODO Deprecate this

// Get a card given by its id
function getCard(id: string): Card {
  return Catalog.getCardById(parseInt(id))
}

function encodeCard(card: Card): string {
  return card.id.toString()
}

function decodeCard(s: string): Card {
  let sections = s.split(delims[2])

  return getCard(sections[0])
}

// Encode / decode a string for deck's code such that user can copy / paste it
function encodeShareableDeckCode(deck: number[]): string {
  return deck
    .map((id) => {
      let hexString = id.toString(16).toUpperCase()
      let padded = hexString.padStart(3, '0')
      return padded
    })
    .join('')
}
function decodeShareableDeckCode(s: string): number[] {
  if (!s) return []
  try {
    return (s.match(/.{1,3}/g) ?? []).map((charTuple) => {
      const id = parseInt(charTuple, 16)

      // Check if each card id is valid
      if (Catalog.getCardById(id) === undefined) {
        throw new Error('Invalid card id')
      }

      return id
    })
  } catch (error) {
    return undefined
  }
}

export { decodeCard, encodeShareableDeckCode, decodeShareableDeckCode }
