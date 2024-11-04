import {
  URL,
  PORT,
  createSocket,
  TypedWebSocket,
  WrappedServerSocket,
} from '../../../shared/network/settings'

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
        console.log(data)
        console.log('players connected', data)
        if (data.value) {
          // Send the initial message, including things like the deck we are using
          this.socket.ws.send(initMessage)

          // Signal that a match has been found
          scene.signalMatchFound()
        }
      })
      .on('transmit_state', (data) => {
        console.log('transmit state', data)
        // if (data.value) {
        //   // Send the initial message, including things like the deck we are using
        //   this.socket.send(initMessage)

        //   // Signal that a match has been found
        //   scene.signalMatchFound()
        // }
      })

    // TODO Learning, these are the message types being listened for (Keys of the payloads)
    // socket.on('both_players_connected', (data) => {
    //     console.log(data)
    //     if (data.value) {
    //       // Send the initial message, including things like the deck we are using
    //       this.socket.send(initMessage)

    //       // Signal that a match has been found
    //       scene.signalMatchFound()
    //     }
    //   }
    // )
    // case 'transmit_state':
    // 	console.log('Received game state:', msg.state);
    // 	let state = new ClientState(msg.value)

    // 	if (state.versionNumber > versionNumber) {
    // 		scene.queueState(state)
    // 	}
    // 	break;

    // socket.onmessage = (event) => {
    //   console.log('got some sort of message')
    //   if (typeof event.data === 'string') {
    //     this.handleMessage(JSON.parse(event.data))
    //   } else {
    //     throw new Error(
    //       `MatchWebsocket expected string response data but received: ${typeof event.data}`
    //     )
    //   }
    // }

    socket.onclose = () => {
      console.log('Disconnected from the server')
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  // Handle a message response from server
  private handleMessage(msg) {
    switch (msg.type) {
      // TODO Types for these
      case 'both_players_connected':
        console.log('Both players are connected!')
        if (msg.value) {
          // Send the initial message, including things like the deck we are using
          this.socket.send(initMessage)

          // Signal that a match has been found
          scene.signalMatchFound()
        }
        break

      case 'transmit_state':
        console.log('Received game state:', msg.state)
        let state = new ClientState(msg.value)

        if (state.versionNumber > versionNumber) {
          scene.queueState(state)
        }
        break

      case 'signal_error':
        console.log('Server says that an action was in error.')
        // TODO Handle signalling or logging that error on the client
        break

      case 'dc':
        console.log('Opponent has disconnected.')
        scene.signalDC()
        break

      case 'opponent_emote':
        console.log('Opponent emote received:', msg.emote)
        scene.emote(msg.value)
        break

      default:
        console.warn('Unknown message type:', msg.type)
    }
  }

  playCard(index: number) {
    let msg = {
      type: 'play_card',
      value: index,
      version: versionNumber,
    }
    this.socket.send(JSON.stringify(msg))
  }

  // String in the format '001' to mulligan just 3rd card, etc
  doMulligan(mulligans: string) {
    let msg = {
      type: 'mulligan',
      value: mulligans,
    }
    this.socket.send(JSON.stringify(msg))
  }

  passTurn() {
    let msg = {
      type: 'pass_turn',
      version: versionNumber,
    }
    this.socket.send(JSON.stringify(msg))
  }

  // Signal to server that we are exiting this match
  exitMatch() {
    // If user is logged in, send a message but keep the ws
    if (Server.loggedIn()) {
      let msg = {
        type: 'exit_match',
      }
      this.socket.send(JSON.stringify(msg))
    }
    // TODO Remove if UserSessionWS is separate from this
    // If user is anon, close socket
    else {
      this.socket.close(1000)
    }
  }

  // Set the version number of the state that the client is seeing
  // Set the
  setVersionNumber(vn: number): void {
    versionNumber = vn
  }

  // Signal to the server that we have emoted
  signalEmote(emoteNumber = 0): void {
    const msg = JSON.stringify({
      type: 'emote',
      value: emoteNumber,
    })

    this.socket.send(msg)
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
      // TODO
      socket = new TypedWebSocket(`ws://${URL}:${PORT}`)
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

const playCardEvent = createSocket<'play_card'>('play_card', (data) => {
  console.log('Playing a card:', data.card)
})

// TODO There's some clever way to ensure that all SocketMessages are covered
// const registeredEvents = [initEvent, playCardEvent]
