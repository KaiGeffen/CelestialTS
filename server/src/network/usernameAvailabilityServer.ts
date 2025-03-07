import express from 'express'
import cors from 'cors'
import { eq } from 'drizzle-orm'

import { USERNAME_AVAILABILITY_PORT } from '../../../shared/network/settings'
import { db } from '../db/db'
import { players } from '../db/schema'

export default function createUsernameAvailabilityServer() {
  const app = express()
  app.use(cors())

  app.get('/check_username_availability/:username', async (req, res) => {
    try {
      console.log('Checking username:')
      console.log(req.params.username)
      const username = req.params.username
      const existingUser = await db
        .select({ username: players.username })
        .from(players)
        .where(eq(players.username, username))
        .limit(1)

      console.log('Number of users with that is', existingUser.length)

      res.json({ exists: existingUser.length > 0 })
    } catch (error) {
      console.error('Error checking username:', error)
      res.status(500).json({ error: 'Failed to check username' })
    }
  })

  app.listen(USERNAME_AVAILABILITY_PORT, () => {
    console.log(
      'Username check server is running on port:',
      USERNAME_AVAILABILITY_PORT,
    )
  })
}
