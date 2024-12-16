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

  wss.on('connection', (socket: WebSocket, req: Request) => {
    console.log('Client connected')

    // Determine what type of connection it is
    // Signin
    // Matchmaking for a signed in player
    // Matchmaking for guest player
    MatchQueue.enqueue(socket, req)

    // Ensure cleanup
    return

    const ws = new TypedWebSocket(socket)

    // Communicate to client how many players have connected
    ws.send({ type: 'both_players_connected', value: true })

    // Register each of the events
    registeredEvents.forEach(({ event, callback }) => {
      ws.on(event, callback)
    })
  })

  console.log('Match server is running on port: ', PORT)
}

// Each of the events and its callback
const initEvent = createEvent('init', (data) => {
  console.log('Initializing a match with data:', data)
})

const playCardEvent = createEvent('play_card', (data) => {
  console.log('Playing a card:', data)
})

const mulliganEvent = createEvent('mulligan', (data) => {
  console.log('Mulligan with data:', data)
})

const passTurnEvent = createEvent('pass_turn', (data) => {
  console.log('Passing turn with data:', data)
})

const exitMatchEvent = createEvent('exit_match', (data) => {
  console.log('Exiting match with data:', data)
})

const emoteEvent = createEvent('emote', (data) => {
  console.log('Emote with data:', data)
})

// TODO There's some clever way to ensure that all SocketMessages are covered
const registeredEvents = [initEvent, playCardEvent]
