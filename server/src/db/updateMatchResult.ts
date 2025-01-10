import { eq, sql } from 'drizzle-orm'
import { db } from './db'
import { players } from './schema'

export async function updateMatchResult(
  winnerID: string | null,
  loserID: string | null,
) {
  return

  // Update the winner
  if (winnerID !== null) {
    await db
      .update(players)
      .set({
        wins: sql`${players.wins} + 1`,
      })
      .where(eq(players.id, winnerID))
  }

  // Update the loser
  if (loserID !== null) {
    await db
      .update(players)
      .set({
        losses: sql`${players.losses} + 1`,
      })
      .where(eq(players.id, loserID))
  }

  // TODO update respective elo
}
