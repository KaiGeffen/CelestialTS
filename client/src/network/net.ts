import { URL, PORT } from '../../../shared/network/settings'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'

import { encodeDeck } from '../../../shared/codec'
import Server from './server'

import { Flags } from '../settings/settings'
import { GameScene } from '../scene/gameScene'
import { Mulligan } from '../../../shared/settings'

// TODO Figure out this global scene situation, smells bad
// NOTE Need this because could be normal game scene or tutorial scene (They are different)
var scene

export class MatchWS {
  socket: TypedWebSocket

  constructor(newScene: GameScene) {
    scene = newScene
    // TODO

    const socket = (this.socket = this.getSocket())

    // Each registered event
    socket
      .on('gameStart', () => {
        // TODO This isn't necessary
        console.log('match started')
        // Signal that a match has been found
        scene.signalMatchFound()
      })
      .on('transmitState', (data) => {
        console.log(data.state)
        newScene.queueState(data.state)
      })
      .on('signalError', (data) => {
        // TODO Handle signalling or logging that error on the client
        console.log('Server says that an action was in error.')
      })
      .on('dc', (data) => {
        scene.signalDC()
      })
      .on('opponentEmote', (data) => {
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
    this.socket.send({
      type: 'playCard',
      cardNum: index,
    })
  }

  // TODO standardize mulligan type
  doMulligan(mulligans: Mulligan) {
    this.socket.send({
      type: 'mulligan',
      mulligan: mulligans,
    })
  }

  passTurn() {
    this.socket.send({
      type: 'passTurn',
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

  // Signal to the server that we have emoted
  signalEmote(emoteNumber = 0): void {
    // TODO number
    this.socket.send({
      type: 'emote',
    })
  }

  // TODO Clarify if we reuse a UserSessionWS or create a new ws even for signed in users
  // Get the appropriate websocket for this environment
  // If user is logged in, use the existing ws instead of opening a new one
  private getSocket(): TypedWebSocket {
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
      const fullPath = `wss://celestialtcg.com/ws`
      socket = new TypedWebSocket(fullPath)
    }

    return socket
  }
}

export class MatchPveWS extends MatchWS {
  constructor(
    newScene: GameScene,
    deck: string,
    avatarID: number,
    aiDeck: string,
  ) {
    super(newScene)

    this.socket.onOpen(() => {
      this.socket.send({
        type: 'initPve',
        uuid: '',
        deck: encodeDeck(deck),
        avatar: avatarID,
        aiDeck: encodeDeck(aiDeck),
      })
    })
  }
}

export class MatchPvpWS extends MatchWS {
  constructor(
    newScene: GameScene,
    deck: string,
    avatarID: number,
    password: string,
  ) {
    super(newScene)

    this.socket.onOpen(() => {
      this.socket.send({
        type: 'initPvp',
        uuid: '',
        deck: encodeDeck(deck),
        avatar: avatarID,
        password: password,
      })
    })
  }
}
