import EloRank from 'elo-rank'
import { eq, sql } from 'drizzle-orm'
import { db } from './db'
import { players } from './schema'

const K_FACTOR = 32 // Standard K-factor used in chess
const elo = new EloRank(K_FACTOR)
const BASE_ELO = 1000

export async function updateMatchResult(
  winnerId: string | null,
  loserId: string | null,
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

  // Calculate expected scores
  const expectedScoreWinner = elo.getExpected(winnerElo, loserElo)
  const expectedScoreLoser = elo.getExpected(loserElo, winnerElo)

  // Update ratings (1 for win, 0 for loss)
  const newWinnerRating = elo.updateRating(expectedScoreWinner, 1, winnerElo)
  const newLoserRating = elo.updateRating(expectedScoreLoser, 0, loserElo)

  await Promise.all([
    winnerId !== null &&
      db
        .update(players)
        .set({
          elo: newWinnerRating,
          wins: sql`${players.wins} + 1`,
        })
        .where(eq(players.id, winnerId)),

    loserId !== null &&
      db
        .update(players)
        .set({
          elo: newLoserRating,
          losses: sql`${players.losses} + 1`,
        })
        .where(eq(players.id, loserId)),
  ])
}
