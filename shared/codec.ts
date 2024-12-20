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

  let baseCard = getCard(sections[0])

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
      story: '',
    }

    return new Card(data)
  }
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
