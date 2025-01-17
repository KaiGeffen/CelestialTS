import { WebSocketServer } from 'ws'
import MatchQueue from './matchQueue'

import { URL, MATCH_PORT } from '../../../shared/network/settings'

/*
 This prevents async promises in the indivual websockets from causing the server to crash
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Create the websocket server
export default function createMatchServer() {
  const wss = new WebSocketServer({ port: MATCH_PORT })

  wss.on('connection', async (socket: WebSocket) => {
    try {
      console.log('Client connected')
      MatchQueue.enqueue(socket)
    } catch (e) {
      console.error('Error in match queue:', e)
    }
  })

  console.log('Match server is running on port: ', MATCH_PORT)
}
