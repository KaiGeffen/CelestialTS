import { WebSocketServer } from 'ws'
import MatchQueue from './matchQueue'

import { URL, PORT } from '../../../shared/network/settings'
import {
  TypedWebSocket,
  createEvent,
} from '../../../shared/network/typedWebSocket'

// Create the websocket server
export default function createMatchServer() {
  const wss = new WebSocketServer({ port: PORT })

  wss.on('connection', async (socket: WebSocket) => {
    console.log('Client connected')

    // Determine what type of connection it is
    // Signin
    // Matchmaking for a signed in player
    // Matchmaking for guest player
    MatchQueue.enqueue(socket)
  })

  console.log('Match server is running on port: ', PORT)
}
