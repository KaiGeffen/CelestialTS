import { WebSocketServer } from 'ws'

import { USER_DATA_PORT } from '../../../shared/network/settings'
import {
  TypedWebSocket,
  createEvent,
} from '../../../shared/network/typedWebSocket'

/*
 This prevents async promises in the indivual websockets from causing the server to crash
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

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
      const ws = new TypedWebSocket(socket)

      //
      ws.on('sendToken', ({ email, uuid, jti }) => {
        console.log('Users token included email: ', email)

        ws.send({ type: 'promptUserInit' })
      })
        .on('sendDecks', (decks) => {
          console.log('Client is sending decks:', decks)
        })
        .on('sendInventory', (inventory) => {
          console.log('Client is sending inventory:', inventory)
        })
        .on('sendCompletedMissions', (missions) => {
          console.log('Client is sending completed missions:', missions)
        })

      console.log('Client connected to user-data server')
    } catch (e) {
      console.error('Error in match queue:', e)
    }
  })

  console.log('User-data server is running on port: ', USER_DATA_PORT)
}
