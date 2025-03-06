import { WebSocketServer } from 'ws'
import { v5 as uuidv5 } from 'uuid'

import {
  USER_DATA_PORT,
  UUID_NAMESPACE,
} from '../../../shared/network/settings'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'

import { db } from '../db/db'
import { players } from '../db/schema'
import { eq } from 'drizzle-orm'
import { UserDataServerWS } from '../../../shared/network/userDataWS'
import { Deck } from '../../../shared/types/deck'

// Create the websocket server
export default function createUserDataServer() {
  const wss = new WebSocketServer({ port: USER_DATA_PORT })

  wss.on('connection', async (socket: WebSocket) => {
    try {
      /* Request user's token
       socket.send('request_token')
       Register events for send_token
      
       Register send_token
       If invalid, respond with invalid token
       If uuid is in list of already signed in users, respond with already signed in
       Otherwise get user data
       If no data found, prompt user fields
        Set those values in the database
       Otherwise, send user data
       Register events for updating fields in the db
       * user_progress, decks, inventory, completed_missions, 
       When user queues for a match, on the client side they send the uuid and the token
       New matches are added to the live-match db
       When they complete (By win/loss/tie) they are moved to history
       If they time out, also added to history
       A user queueing first looks for ongoing matchs in the live-match db
       They are reconnected if one is found

       Other supported commands:
       get_leaderboard, get_match_history(uuid)

       In that event, register events to 

      */
      const ws: UserDataServerWS = new TypedWebSocket(socket)

      // Remember the user once they've signed in
      let id: string = null
      let potentialEmail: string = null

      ws.on('sendToken', async ({ email, uuid, jti }) => {
        // Generate UUID v5 from Google's user ID
        const userId = uuidv5(uuid, UUID_NAMESPACE)
        id = userId
        potentialEmail = email

        // Check if user exists in database
        const result = await db
          .select()
          .from(players)
          .where(eq(players.id, userId))

        if (result.length === 0) {
          ws.send({ type: 'promptUserInit' })
        } else if (result.length === 1) {
          // Send user their data
          const data = result[0]

          let decks: Deck[] = []
          try {
            decks = data.decks.map((deck) => JSON.parse(deck))
          } catch (e) {
            console.error('Error parsing decks:', e)
          }

          ws.send({
            type: 'sendUserData',
            inventory: data.inventory,
            completedMissions: data.completedmissions,
            decks,
          })

          // Update last active time
          await db
            .update(players)
            .set({ lastactive: new Date().toISOString() })
            .where(eq(players.id, id))
        }
      })
        .on('sendDecks', async ({ decks }) => {
          if (!id) return
          await db
            .update(players)
            .set({ decks: decks.map((deck) => JSON.stringify(deck)) })
            .where(eq(players.id, id))
        })
        .on('sendInventory', async ({ inventory }) => {
          if (!id) return
          await db.update(players).set({ inventory }).where(eq(players.id, id))
        })
        .on('sendCompletedMissions', async ({ missions }) => {
          if (!id) return
          await db
            .update(players)
            .set({ completedmissions: missions })
            .where(eq(players.id, id))
        })
        .on(
          'sendInitialUserData',
          async ({ username, decks, inventory, missions }) => {
            if (!id) {
              throw new Error('User sent initial user data before signing in')
            }

            // Create new user entry in database
            await db.insert(players).values({
              id: id,
              email: potentialEmail,
              username: username,
              wins: 0,
              losses: 0,
              elo: 1000,
              decks: decks.map((deck) => JSON.stringify(deck)),
              inventory: inventory,
              completedmissions: missions,
              lastactive: new Date().toISOString(),
            })
          },
        )
    } catch (e) {
      console.error('Error in match queue:', e)
    }
  })

  console.log('User-data server is running on port: ', USER_DATA_PORT)
}
