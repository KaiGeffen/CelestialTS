import { Deck } from './deck'

export interface MatchHistoryEntry {
  time: Date

  elo: number
  deck: Deck

  opponentUsername: string
  opponentElo: number
  opponentDeck: Deck

  roundsWon: number
  roundsLost: number
  roundsTied: number

  wasWin: boolean
}
