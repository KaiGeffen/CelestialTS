import EloRank from 'elo-rank'
import { eq, sql } from 'drizzle-orm'
import { db } from './db'
import { matchHistory, players } from './schema'
import { Deck } from '../../../shared/types/deck'

const K_FACTOR = 32 // Standard K-factor used in chess
const elo = new EloRank(K_FACTOR)
const BASE_ELO = 1000

export async function updateMatchResult(
  winnerId: string | null,
  loserId: string | null,
  winnerDeck: Deck,
  loserDeck: Deck,
  roundsWLT: [number, number, number],
) {
  const winnerElo =
    winnerId === null
      ? BASE_ELO
      : await db
          .select()
          .from(players)
          .where(eq(players.id, winnerId))
          .limit(1)
          .then((result) => (result.length ? result[0].elo : BASE_ELO))

  const loserElo =
    loserId === null
      ? BASE_ELO
      : await db
          .select()
          .from(players)
          .where(eq(players.id, loserId))
          .limit(1)
          .then((result) => (result.length ? result[0].elo : BASE_ELO))

  // Update the match history database
  await db.insert(matchHistory).values({
    player1_id: winnerId,
    player2_id: loserId,
    player1_username: winnerDeck.name,
    player2_username: loserDeck.name,
    player1_elo: winnerElo,
    player2_elo: loserElo,
    player1_deck: winnerDeck.name,
    player2_deck: loserDeck.name,
    player1_avatar: winnerDeck.cosmetics.avatar,
    player2_avatar: loserDeck.cosmetics.avatar,
    rounds_won: roundsWLT[0],
    rounds_lost: roundsWLT[1],
    rounds_tied: roundsWLT[2],
  })

  // Calculate expected scores
  const expectedScoreWinner = elo.getExpected(winnerElo, loserElo)
  const expectedScoreLoser = elo.getExpected(loserElo, winnerElo)

  // Update ratings (1 for win, 0 for loss)
  const newWinnerRating = elo.updateRating(expectedScoreWinner, 1, winnerElo)
  const newLoserRating = elo.updateRating(expectedScoreLoser, 0, loserElo)

  if (winnerId !== null) {
    await db
      .update(players)
      .set({
        elo: newWinnerRating,
        wins: sql`${players.wins} + 1`,
      })
      .where(eq(players.id, winnerId))
  }
  if (loserId !== null) {
    await db
      .update(players)
      .set({
        elo: newLoserRating,
        losses: sql`${players.losses} + 1`,
      })
      .where(eq(players.id, loserId))
  }
}
