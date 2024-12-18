import { URL, PORT } from '../../../shared/network/settings'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'

import { encodeDeck } from '../lib/codec'
import ClientState from '../lib/clientState'
import Server from './server'

import { Flags } from '../settings/settings'
import { GameScene } from '../scene/gameScene'

// The version-number of that state that the client is displaying, for use with verifying with server
export var versionNumber: number
// NOTE Need this because could be normal game scene or tutorial scene (They are different)
var scene
// NOTE This can change, but the listener is only created once, so it needs to reference this var
var initMessage

export class MatchWS {
  socket: TypedWebSocket

  constructor(deck: string, newScene: GameScene, mmCode, avatarID: number) {
    scene = newScene
    // TODO
    versionNumber = -1

    console.log('Making a new websocket for this match')
    const socket = (this.socket = this.getSocket(mmCode))

    console.log('Socket:', socket)
    socket.onOpen(() => {
      socket.send({
        type: 'initPve',
        uuid: '',
        deck: encodeDeck(deck),
        avatar: avatarID,
        aiDeck: encodeDeck(deck),
      })
    })

    // Each registered event
    socket
      .on('game_start', () => {
        // TODO This isn't necessary
        console.log('match started')
        // Signal that a match has been found
        scene.signalMatchFound()
      })
      .on('transmit_state', (data) => {
        console.log('Received state: ', data)
        if (data.state.versionNo > versionNumber)
          newScene.queueState(data.state)
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
    console.log('Playing card:', index)
    this.socket.send({
      type: 'playCard',
      card: index,
      version: versionNumber,
    })
  }

  // TODO standardize mulligan type
  doMulligan(mulligans: [boolean, boolean, boolean]) {
    this.socket.send({
      type: 'mulligan',
      mulligan: mulligans,
    })
  }

  passTurn() {
    this.socket.send({
      type: 'passTurn',
      version: versionNumber,
    })
  }

  // Signal to server that we are exiting this match
  exitMatch() {
    // If user is logged in, send a message but keep the ws
    if (Server.loggedIn()) {
      this.socket.send({
        type: 'exitMatch',
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

  // TODO Remove mmCode from this
  // TODO Clarify if we reuse a UserSessionWS or create a new ws even for signed in users
  // Get the appropriate websocket for this environment
  // If user is logged in, use the existing ws instead of opening a new one
  private getSocket(mmCode): TypedWebSocket {
    // Establish a websocket based on the environment
    let socket
    if (Server.loggedIn()) {
      socket = null // TODO Server.getWS()
    } else if (Flags.local) {
      socket = new TypedWebSocket(`ws://${URL}:${PORT}`)
      // socket = new TypedWebSocket(`ws://${URL}:${PORT}?mode=pvp`)
    } else {
      // The WS location on DO
      // let loc = window.location
      const fullPath = `wss://celestialtcg.com/ws/${mmCode}`
      socket = new TypedWebSocket(fullPath)
    }

    return socket
  }
}
