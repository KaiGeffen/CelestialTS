import { Card } from './state/card'
import allCards from './state/catalog'
import { Status } from './state/effects'
import { Story } from './state/story'

const DELIM1 = '¡'
const DELIM2 = '™'
const DELIM_DYN_TEXT = '£'
const DELIM_FULL_STATE = 'ª'

function encodeCard(card: any): string {
  for (const catalogEntry of allCards) {
    if (card.name === catalogEntry.name) {
      if (card.dynamicText) {
        return `${card.id}${DELIM_DYN_TEXT}${card.dynamicText}`
      } else {
        return `${card.id}`
      }
    }
  }
  console.error(`Encoding error for card ${card}`)
  throw new Error('Card encoding broken')
}

function encodeDeck(deck: any[]): string {
  return deck.map(encodeCard).join(DELIM2)
}

function decodeCard(s: string): any {
  const sections = s.split(DELIM_DYN_TEXT)
  const cardId = parseInt(sections[0], 10)
  const dynamicText = sections.length > 1 ? sections[1] : null

  let card = null
  for (const c of allCards) {
    if (cardId === c.id) {
      card = c
      break
    }
  }

  // TODO Shouldn't just be a dictionary
  if (dynamicText) {
    card = { ...card, text: dynamicText }
  }

  return card
}

function decodeDeck(deckCodes: string): any[] {
  if (deckCodes) {
    const cards =
      deckCodes.includes(DELIM2) || deckCodes.includes(DELIM_DYN_TEXT)
        ? deckCodes.split(DELIM2)
        : deckCodes.split(':')
    return cards.map(decodeCard)
  } else {
    return []
  }
}

function encodeStory(stack: any[]): string {
  const encodeAct = (play: any) => {
    const [cardId, owner] = play
    return `${encodeCard(cardId)}${DELIM2}${owner}`
  }

  return stack.map(encodeAct).join(DELIM1)
}

function decodeStory(s: string): Story {
  const story = new Story()
  if (!s) {
    return story
  }

  for (const act of s.split(DELIM1)) {
    const [cardStr, ownerStr] = act.split(DELIM2)
    const card = decodeCard(cardStr)
    const owner = parseInt(ownerStr, 10)
    story.addAct(card, owner, Source.HAND)
  }

  return story
}

function encodeRecap(recap: Recap, shallow: boolean): string {
  let result = `${recap.sums[0]}${DELIM2}${recap.sums[1]}${DELIM1}${recap.wins[0]}${DELIM2}${recap.wins[1]}${DELIM1}${recap.safety[0]}${DELIM2}${recap.safety[1]}`

  if (recap.story) {
    result += DELIM1

    const encodePlay = (play: any) => {
      const [card, owner, text] = play
      return `${encodeCard(card)}${DELIM2}${owner}${DELIM2}${text}`
    }

    result += recap.story.map(encodePlay).join(DELIM1)
  }

  if (recap.stateList && !shallow) {
    result += DELIM_FULL_STATE
    result += recap.getStateList(0).map(JSON.stringify).join(DELIM_FULL_STATE)
  }

  return result
}

function decodeRecap(s: string): Recap {
  s = s.split(DELIM_FULL_STATE)[0]

  const recap = s.split(DELIM1, 4)
  const sums = recap[0].split(DELIM2).map(Number)
  const wins = recap[1].split(DELIM2).map(Number)
  const safety = recap[2].split(DELIM2).map(Number)

  if (recap.length === 3) {
    return new Recap(sums, wins, safety)
  }

  const plays = recap[3].split(DELIM1)

  const decodePlay = (play: string) => {
    const [cardStr, ownerStr, text] = play.split(DELIM2)
    const card = decodeCard(cardStr)
    const owner = parseInt(ownerStr, 10)
    return [card, owner, text]
  }

  const story = plays.map(decodePlay)
  return new Recap(story, sums, wins, safety)
}

function encodeStatuses(statuses: Status[]): string {
  return statuses.map((status) => status.value).join(DELIM1)
}

function decodeStatuses(s: string): Status[] {
  if (!s) {
    return []
  }
  return s.split(DELIM1).map((stat) => new Status(stat))
}

function encodeMulligans(mulligans: boolean[]): string {
  return mulligans.map((mulligan) => (mulligan ? '1' : '0')).join('')
}

function decodeMulligans(s: string): boolean[] {
  return Array.from(s).map((c) => {
    if (c === '1') {
      return true
    } else if (c === '0') {
      return false
    } else {
      throw new Error(`Invalid mulligans: ${s}`)
    }
  })
}
