import { calculate } from 'elo-rating'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { players } from './schema'

const K_FACTOR = 32 // Standard K-factor used in chess

export async function updateMatchResult(winnerId: string, loserId: string) {
  const [winner, loser] = await Promise.all([
    db.select().from(players).where(eq(players.id, winnerId)),
    db.select().from(players).where(eq(players.id, loserId)),
  ])

  const result = calculate(winner[0].elo, loser[0].elo, true, K_FACTOR)

  console.log('result', winner, loser, result)

  await Promise.all([
    db
      .update(players)
      .set({
        elo: result.playerRating,
        wins: winner[0].wins + 1,
        lastactive: new Date().toISOString(),
      })
      .where(eq(players.id, winnerId)),

    db
      .update(players)
      .set({
        elo: result.opponentRating,
        losses: loser[0].losses + 1,
        lastactive: new Date().toISOString(),
      })
      .where(eq(players.id, loserId)),
  ])
}
