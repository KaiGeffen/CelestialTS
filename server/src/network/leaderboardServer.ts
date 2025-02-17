import express from 'express'
import cors from 'cors'
import { desc, sql } from 'drizzle-orm'

import { LEADERBOARD_PORT } from '../../../shared/network/settings'
import { db } from '../db/db'
import { players } from '../db/schema'

export default function createLeaderboardServer() {
  const app = express()

  // Enable CORS
  app.use(cors())

  // GET endpoint for leaderboard data
  app.get('/leaderboard', async (req, res) => {
    try {
      console.log('Getting the leaderboard for you....')
      const leaderboardData = await db
        .select({
          email: players.email,
          wins: players.wins,
          losses: players.losses,
          elo: players.elo,
        })
        .from(players)
        .orderBy(desc(players.elo))
        .limit(100)

      console.log('leaderboard data is,', leaderboardData)

      const rankedData = leaderboardData.map((player, index) => ({
        ...player,
        rank: index + 1,
      }))

      console.log('Leaderboard data:', rankedData)

      res.json(rankedData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      res.status(500).json({ error: 'Failed to fetch leaderboard data' })
    }
  })

  // Start the server
  app.listen(LEADERBOARD_PORT, () => {
    console.log('Leaderboard server is running on port:', LEADERBOARD_PORT)
  })
}
