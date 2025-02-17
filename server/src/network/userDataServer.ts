import { WebSocketServer } from 'ws'
import { v5 as uuidv5 } from 'uuid'

import { USER_DATA_PORT } from '../../../shared/network/settings'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'

import { db } from '../db/db'
import { players } from '../db/schema'
import { eq } from 'drizzle-orm'
import { UserDataServerWS } from '../../../shared/network/userDataWS'

// Add UUID namespace constant
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID v4 namespace

// Create the websocket server
export default function createUserDataServer() {
  const wss = new WebSocketServer({ port: USER_DATA_PORT })

  wss.on('connection', async (socket: WebSocket) => {
    console.log('User-data server connected')
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

      ws.on('sendToken', async ({ email, uuid, jti }) => {
        // Generate UUID v5 from Google's user ID
        const userId = uuidv5(uuid, UUID_NAMESPACE)
        id = userId

        // Check if user exists in database
        const result = await db
          .select()
          .from(players)
          .where(eq(players.id, userId))

        if (result.length === 0) {
          // Create new user entry in database
          await db.insert(players).values({
            id: userId,
            email: email,
            wins: 0,
            losses: 0,
            decks: [],
            inventory: '1000101001011100001',
            completedmissions: '',
          })
          // User doesn't exist yet
          console.log('Creating new user:', email)

          ws.send({ type: 'promptUserInit' })
        } else if (result.length === 1) {
          // Send user their data
          const data = result[0]

          ws.send({
            type: 'sendUserData',
            inventory: data.inventory,
            completedMissions: data.completedmissions,
            decks: data.decks,
          })
        }
      })
        .on('sendDecks', async ({ decks }) => {
          if (!id) return
          await db.update(players).set({ decks }).where(eq(players.id, id))
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
    } catch (e) {
      console.error('Error in match queue:', e)
    }
  })

  console.log('User-data server is running on port: ', USER_DATA_PORT)
}
