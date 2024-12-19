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
    try {
      console.log('Client connected')
      MatchQueue.enqueue(socket)
    } catch (e) {
      console.error('Error in match queue:', e)
    }
  })

  console.log('Match server is running on port: ', PORT)
}
