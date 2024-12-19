import allCards from './state/catalog'
import Card from './state/card'

const delims = ['¡', '™', '£']
const full_state_delim = 'ª'

// Get a card given by its id
function getCard(id: string): Card {
  return allCards.find((card) => card.id === parseInt(id))
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
      // TODO These are in client
      // keywords: baseCard.keywords,
      // references: baseCard.references,
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

// function decodeStory(s: string): Story {
//   let story = new Story()
//   if (s === '') return story

//   s.split(delims[0]).forEach(function (act) {
//     let l = act.split(delims[1])

//     let card = decodeCard(l[0])
//     let owner = +l[1]

//     story.addAct(card, owner, -1)
//   })

//   return story
// }

// // TODO Make a more robust status module once the desired functionality is known
// const allStatuses = ['Inspired', 'Inspire', 'Nourish', 'Starve', 'Restricted']

// function decodeStatuses(s: string): Status[] {
//   let result: Status[] = []

//   // Split the string into substrings
//   s.split(delims[0]).forEach(function (ss) {
//     // If any of those are statuses, add them to the list
//     if (Status[ss] !== undefined) {
//       result.push(Status[ss])
//     }
//   })

//   return result

//   // if (s === '') return []

//   // let statuses = s.split(delims[0])

//   // let result = ''
//   // allStatuses.forEach(function(statusType) {

//   // 	let count = 0
//   // 	statuses.forEach(function(status) {
//   // 		if (status === statusType) {
//   // 			count++
//   // 		}
//   // 	})

//   // 	if (count > 0) result += `${statusType} ${count}, `
//   // })

//   // return result.slice(0, -2)
// }

// function decodeRecap(s: string): Recap {
//   let arr = s.split(full_state_delim)
//   let simpleRecap = arr[0]
//   arr = arr.slice(1)

//   // The list of states player sees before/after each act in the story
//   let stateList: ClientState[] = arr.map((s) => new ClientState(JSON.parse(s)))

//   let sections = simpleRecap.split(delims[0])
//   let sums = sections[0].split(delims[1]).map(parseFloat)
//   let wins = sections[1].split(delims[1]).map(parseFloat)
//   let safety = sections[2].split(delims[1]).map(parseFloat)

//   let plays = sections.slice(3)

//   function decodePlay(play: string): Play {
//     let l = play.split(delims[1])

//     let card = decodeCard(l[0])
//     let owner = +l[1]
//     // Text isn't used anymore
//     let text = l[2]

//     return new Play(card, owner, text)
//   }

//   let playList = plays.map(decodePlay)

//   return new Recap(sums, wins, safety, playList, stateList)
// }

// // Random 1-to-1 function that obfuscates the id scheme for cards
// // and ensures that a deck with n cards always has a string of n * c chars (And vice-verca)

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
  // decodeStory,
  // decodeStatuses,
  // decodeRecap,
  encodeShareableDeckCode,
  decodeShareableDeckCode,
}
