import { parse } from 'url'

import {
  TypedWebSocket,
  createEvent,
} from '../../../shared/network/typedWebSocket.js'

import PveMatch from './match/pveMatch.js'
import PvpMatch from './match/pvpMatch.js'
import Match from './match/match.js'

class MatchQueue {
  static enqueue(socket: WebSocket, req: Request) {
    // PlayerNumber is whether you are player 0 or 1
    const [match, playerNumber] = createMatch(socket, req)
    registerEvents(socket, match, playerNumber)
  }
}

function createMatch(socket: WebSocket, req: Request): [Match, number] {
  const aiDeck = []
  const uuid = null
  return [new PveMatch(socket, aiDeck, uuid), 0]

  // // Check the path
  // const url = parse(req.url, true)
  // const mode = url.query.mode
  // if (Array.isArray(url.query.uuid)) {
  //   throw new Error('UUID should not be an array')
  // }
  // /*
  //  TODO It's slightly insecure to be passing the uuid in plain like this
  //  It means that an attacked could proxy and change the uuid, or read
  //  the uuid. This could instead go in the init message,
  //  once the secure connection is established.
  //  */
  // const uuid = url.query.uuid

  // switch (mode) {
  //   case 'pvp':
  //     console.log('PvP game requested')
  //     // Handle PvP matchmaking
  //     // TODO PVP NUMBER IS WRONG
  //     return [new PvpMatch(socket, uuid), 1]
  //   case 'ai':
  //     console.log('AI game requested')
  //     //TODO
  //     const aiDeck = []
  //     return [new PveMatch(socket, aiDeck, uuid), 0]
  //   default:
  //     console.error('Invalid mode')
  //     socket.close(1008, 'Invalid mode')
  // }
}

// TODO Move to a separate file
function registerEvents(socket: WebSocket, match: Match, playerNumber: number) {
  const ws = new TypedWebSocket(socket)

  // Each of the events and its callback
  const initEvent = createEvent('init', (data) => {
    console.log('Initializing a match with data:', data)
    match.addDeck(playerNumber, data.deck, data.avatar)
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
  const registeredEvents = [
    initEvent,
    playCardEvent,
    mulliganEvent,
    passTurnEvent,
    exitMatchEvent,
    emoteEvent,
  ]

  // Register each of the events
  registeredEvents.forEach(({ event, callback }) => {
    ws.on(event, callback)
  })
  ws.send({ type: 'both_players_connected', value: true })
}

// Password matches dictionary
const PWD_MATCHES: { [key: string]: Match } = {}

export default MatchQueue
