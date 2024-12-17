import { parse } from 'url'
import Card from '../../../shared/state/card'

import {
  TypedWebSocket,
  createEvent,
} from '../../../shared/network/typedWebSocket'
import { decodeDeck } from '../../../shared/codec'

import PveMatch from './match/pveMatch'
import PvpMatch from './match/pvpMatch'
import Match from './match/match'
import pvpMatch from './match/pvpMatch'
import { decode } from 'punycode'
import { MULLIGAN_MSG } from './old/settings'
import { PASS } from '../../../shared/settings'

/*
List of ongoing games
List of players in queue, tied with their game if they have one
Disconnecting then reconnecting puts you back in your game
Init includes information about the game type you're looking for
*/

interface WaitingPlayer {
  ws: TypedWebSocket
  uuid: string
  deck: Card[]
  avatar: number
}

// Players searching for a match with password as key
let searchingPlayers: { [key: string]: WaitingPlayer } = {}

class MatchQueue {
  static enqueue(socket: WebSocket) {
    const ws = new TypedWebSocket(socket)

    // Register the init events
    const initPve = createEvent('initPve', async (data) => {
      const match = new PveMatch(
        ws,
        data.uuid,
        decodeDeck(data.deck),
        data.avatar,
        decodeDeck(data.aiDeck),
      )
      registerEvents(ws, match, 0)

      // Start the match
      await match.notifyMatchStart()
    })
    const initPvp = createEvent('initPvp', async (data) => {
      const password = data.password

      // An opponent is found, start the match for both
      if (searchingPlayers[data.password]) {
        // Create a PvP match
        const otherPlayer: WaitingPlayer = searchingPlayers[data.password]
        const match = new pvpMatch(
          ws,
          data.uuid,
          decodeDeck(data.deck),
          data.avatar,
          otherPlayer.ws,
          otherPlayer.uuid,
          otherPlayer.deck,
          otherPlayer.avatar,
        )

        // registerEvents(socket, match, playerNumber)
        delete searchingPlayers[data.password]
        // TODO Maybe just delete the last one? Somehow don't lose to race conditions

        registerEvents(ws, match, 0)
        registerEvents(otherPlayer.ws, match, 1)

        // Notify both players that they are connected
        await match.notifyMatchStart()
      } else {
        // Queue the player with their information
        const waitingPlayer = {
          ws: ws,
          uuid: data.uuid,
          deck: decodeDeck(data.deck),
          avatar: data.avatar,
        }
        searchingPlayers[data.password] = waitingPlayer
      }
    })
  }
}

// class MatchQueue {
//   static enqueue(socket: WebSocket, req: Request) {
//     // PlayerNumber is whether you are player 0 or 1
//     const [match, playerNumber] = createMatch(socket, req)
//     registerEvents(socket, match, playerNumber)
//   }
// }

/*
Enqueueing is just registering the events
The init event will create a game match
Then later events will do those actions in the game if it's active

*/

// TODO Move to a separate file
// Register each of the events that the server receives during a match
function registerEvents(
  ws: TypedWebSocket,
  match: Match,
  playerNumber: number,
) {
  const playCardEvent = createEvent('play_card', (data) => {
    const cardNum = data.card
    const versionNo = 0 // TODO
    match.doAction(playerNumber, cardNum, versionNo)
  })

  const mulliganEvent = createEvent('mulligan', (data) => {
    match.doMulligan(playerNumber, data.mulligan)
  })

  const passTurnEvent = createEvent('pass_turn', (data) => {
    const versionNo = 0 // TODO
    match.doAction(playerNumber, PASS, versionNo)
  })

  const exitMatchEvent = createEvent('exit_match', (data) => {
    match.notifyExit(ws)
  })

  const emoteEvent = createEvent('emote', (data) => {
    const emote = 0 // TODO
    match.signalEmote(playerNumber, emote)
  })

  // TODO There's some clever way to ensure that all SocketMessages are covered
  const registeredEvents = [
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
}

// Password matches dictionary
const PWD_MATCHES: { [key: string]: Match } = {}

export default MatchQueue

/*

      // Create a match or wait for an opponent
      if (data.mode === 'pve') {
        // Create a PvE match
        const aiDeck = []
        const uuid = null
        return [new PveMatch(socket, aiDeck, uuid), 0]
      }
      if (data.mode === 'pvp') {
        if (searchingPlayers[data.password]) {
          // Create a PvP match
          const otherPlayer = searchingPlayers[data.password]
          new pvpMatch(socket)

          const aiDeck = []
          const uuid = null
          return [new PveMatch(socket, aiDeck, uuid), 0]

          const [match, playerNumber] = createMatch(socket, req)
          registerEvents(socket, match, playerNumber)
          const [otherMatch, otherPlayerNumber] = createMatch(otherPlayer, req)
          registerEvents(otherPlayer, otherMatch, otherPlayerNumber)
          delete searchingPlayers[data.password]
        }
        if (data.password === '') {
        }
      } else {
        // Create a PvE match
      }
      match.addDeck(playerNumber, deck, data.avatar)
      ws.send({ type: 'init', avatar: 1, deck: 'helllo' })
      */
