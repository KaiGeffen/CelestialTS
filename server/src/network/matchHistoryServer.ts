import express from 'express'
import cors from 'cors'
import { and, desc, eq, or } from 'drizzle-orm'
import { v5 as uuidv5 } from 'uuid'
import {
  MATCH_HISTORY_PORT,
  UUID_NAMESPACE,
} from '../../../shared/network/settings'
import { db } from '../db/db'
import { matchHistory } from '../db/schema'

export default function createMatchHistoryServer() {
  const app = express()

  // Enable CORS
  app.use(cors())

  // GET endpoint for match history data
  app.get('/match_history/:uuid', async (req, res) => {
    const uuid = req.params.uuid
      ? uuidv5(req.params.uuid, UUID_NAMESPACE)
      : null

    console.log('Fetching match history for user:', uuid)

    try {
      const matches = await db
        .select()
        .from(matchHistory)
        .where(
          or(
            eq(matchHistory.player1_id, uuid),
            eq(matchHistory.player2_id, uuid),
          ),
        )
        .orderBy(desc(matchHistory.match_date))
        .limit(50)

      // Transform the data to match our frontend expectations
      const transformedMatches = matches.map((match) => {
        const isPlayer1 = match.player1_id === uuid
        return {
          match_date: match.match_date,
          opponent_username: isPlayer1
            ? match.player2_username
            : match.player1_username,
          opponent_elo: isPlayer1 ? match.player2_elo : match.player1_elo,
          rounds_won: isPlayer1 ? match.rounds_won : match.rounds_lost,
          rounds_lost: isPlayer1 ? match.rounds_lost : match.rounds_won,
          rounds_tied: match.rounds_tied,
          deck_name: isPlayer1 ? match.player1_deck : match.player2_deck,
          opponent_deck: isPlayer1 ? match.player2_deck : match.player1_deck,
        }
      })

      res.json(transformedMatches)
    } catch (error) {
      console.error('Error fetching match history:', error)
      res.status(500).json({ error: 'Failed to fetch match history' })
    }
  })

  // Start the server
  app.listen(MATCH_HISTORY_PORT, () => {
    console.log('Match history server is running on port:', MATCH_HISTORY_PORT)
  })
}
