import EloRank from 'elo-rank'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { players } from './schema'

const K_FACTOR = 32 // Standard K-factor used in chess
const elo = new EloRank(K_FACTOR)

export async function updateMatchResult(winnerId: string, loserId: string) {
  console.log('The uuid are:', winnerId, loserId)

  const [winner, loser] = await Promise.all([
    db.select().from(players).where(eq(players.id, winnerId)),
    db.select().from(players).where(eq(players.id, loserId)),
  ])

  console.log('The players are:', winner, loser)

  const winnerRating = winner[0].elo
  const loserRating = loser[0].elo

  // Calculate expected scores
  const expectedScoreWinner = elo.getExpected(winnerRating, loserRating)
  const expectedScoreLoser = elo.getExpected(loserRating, winnerRating)

  // Update ratings (1 for win, 0 for loss)
  const newWinnerRating = elo.updateRating(expectedScoreWinner, 1, winnerRating)
  const newLoserRating = elo.updateRating(expectedScoreLoser, 0, loserRating)

  console.log('result', winner, loser, newWinnerRating, newLoserRating)

  await Promise.all([
    db
      .update(players)
      .set({
        elo: newWinnerRating,
        wins: winner[0].wins + 1,
        lastactive: new Date().toISOString(),
      })
      .where(eq(players.id, winnerId)),

    db
      .update(players)
      .set({
        elo: newLoserRating,
        losses: loser[0].losses + 1,
        lastactive: new Date().toISOString(),
      })
      .where(eq(players.id, loserId)),
  ])
}
