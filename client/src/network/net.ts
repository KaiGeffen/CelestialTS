import { URL, PORT } from '../../../shared/network/settings'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'

import { encodeDeck } from '../lib/codec'
import ClientState from '../lib/clientState'
import Server from './server'

import { Flags } from '../settings/settings'
import { string } from 'zod'

// The version-number of that state that the client is displaying, for use with verifying with server
export var versionNumber: number
// NOTE Need this because could be normal game scene or tutorial scene (They are different)
var scene
// NOTE This can change, but the listener is only created once, so it needs to reference this var
var initMessage

export class MatchWS {
  socket: TypedWebSocket

  constructor(deck: string, newScene, mmCode, avatarID: number) {
    scene = newScene

    console.log('Making a new websocket for this match')
    const socket = (this.socket = this.getSocket(mmCode))

    // Each registered event
    socket
      .on('both_players_connected', (data) => {
        console.log('players connected', data)
        if (data.value) {
          // Send the initial message, including things like the deck we are using
          this.socket.send({
            type: 'init',
            deck: deck,
            avatar: avatarID,
          })

          // Signal that a match has been found
          scene.signalMatchFound()
        }
      })
      .on('transmit_state', (data) => {
        console.log('Received state: ', data)
      })
      .on('signal_error', (data) => {
        // TODO Handle signalling or logging that error on the client
        console.log('Server says that an action was in error.')
      })
      .on('dc', (data) => {
        scene.signalDC()
      })
      .on('opponent_emote', (data) => {
        scene.emote(0)
      })

    socket.ws.onclose = () => {
      console.log('Disconnected from the server')
    }

    socket.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  playCard(index: number) {
    let msg = {
      type: 'play_card',
      value: index,
      version: versionNumber,
    }
    this.socket.ws.send(JSON.stringify(msg))
  }

  // String in the format '001' to mulligan just 3rd card, etc
  doMulligan(mulligans: string) {
    // TODO
    this.socket.send({
      type: 'mulligan',
    })
  }

  passTurn() {
    this.socket.send({
      type: 'pass_turn',
    })
    // TODO Why is version number used
  }

  // Signal to server that we are exiting this match
  exitMatch() {
    // If user is logged in, send a message but keep the ws
    if (Server.loggedIn()) {
      this.socket.send({
        type: 'exit_match',
      })
    }
    // TODO Remove if UserSessionWS is separate from this
    // If user is anon, close socket
    else {
      this.socket.ws.close(1000)
    }
  }

  // Set the version number of the state that the client is seeing
  // Set the
  setVersionNumber(vn: number): void {
    versionNumber = vn
  }

  // Signal to the server that we have emoted
  signalEmote(emoteNumber = 0): void {
    // TODO number
    this.socket.send({
      type: 'emote',
    })
  }

  // TODO Clarify if we reuse a UserSessionWS or create a new ws even for signed in users
  // Get the appropriate websocket for this environment / matchmaking code
  // If user is logged in, use the existing ws instead of opening a new one
  private getSocket(mmCode): TypedWebSocket {
    // Establish a websocket based on the environment
    let socket
    if (Server.loggedIn()) {
      socket = null // TODO Server.getWS()
    } else if (Flags.local) {
      // TODO Change mmcode to mode
      socket = new TypedWebSocket(`ws://${URL}:${PORT}?mode=pvp`)
    } else {
      // The WS location on DO
      let loc = window.location
      const fullPath = `wss://celestialtcg.com/ws/${mmCode}`
      socket = new TypedWebSocket(fullPath)
    }

    return socket
  }
}

// Putting registered events here for now TODO

// Each of the events and its callback

// const playCardEvent = createSocket<'play_card'>('play_card', (data) => {
//   console.log('Playing a card:', data.card)
// })

// TODO There's some clever way to ensure that all SocketMessages are covered
// const registeredEvents = [initEvent, playCardEvent]
