import * as net from 'net'
import * as CardCodec from './CardCodec'
import { ServerController } from './logic/ServerController'
import {
  LOCAL,
  PORT,
  INIT_MSG,
  GET_STATE,
  DO_ACTION,
  MULLIGAN_MSG,
  NO_UPDATE,
  UPDATE,
  VALID_CHOICE,
  INVALID_CHOICE,
} from './internet/Settings'

let threadCounter = 0
let deck1: any = null
let game: any = null
let gameOver = false

class ThreadedTCPRequestHandler {
  private socket: net.Socket
  private player: number

  constructor(socket: net.Socket) {
    this.socket = socket
    this.player = threadCounter++
    this.handle()
  }

  private async handle() {
    try {
      let deckReceived = false
      while (!deckReceived) {
        const msg = await this.readMessage()
        console.log(`Received msg: "${msg}"`)

        if (msg.startsWith(INIT_MSG)) {
          const deck = CardCodec.decodeDeck(msg.split(':', 1)[1])

          if (!deck1) {
            deck1 = deck
            while (!game) {
              await this.sleep(1000)
            }
          } else {
            game = new ServerController(deck1, deck)
            game.start()
          }

          this.socket.write('Deck received')
          deckReceived = true
        }
      }

      while (true) {
        const msg = await this.readMessage()

        if (msg.startsWith(GET_STATE)) {
          const clientVersionNum = parseInt(msg.split(':', 1)[1])

          if (clientVersionNum === game.model.versionNo) {
            this.socket.write(NO_UPDATE)
          } else {
            const serializedModel = JSON.stringify(
              game.getClientModel(this.player)
            )
            const response = `${UPDATE}:${serializedModel}`
            this.socket.write(response)
          }
        } else if (msg.startsWith(DO_ACTION)) {
          const action = parseInt(msg.split(':', 1)[1])
          const valid = game.onPlayerInput(this.player, action)

          if (valid) {
            this.socket.write(VALID_CHOICE)
          } else {
            this.socket.write(INVALID_CHOICE)
          }
        } else if (msg.startsWith(MULLIGAN_MSG)) {
          const mulligans = CardCodec.decodeMulligans(msg.split(':', 1)[1])
          game.doMulligan(this.player, mulligans)
        } else {
          this.socket.write(INVALID_CHOICE)
        }
      }
    } catch (e) {
      console.error(e)
      gameOver = true
    }
  }

  private readMessage(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.once('data', (data) => {
        resolve(data.toString().trim())
      })
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

const server = net.createServer((socket) => {
  new ThreadedTCPRequestHandler(socket)
})

server.listen(PORT, LOCAL, () => {
  console.log(`Server listening on ${LOCAL}:${PORT}`)
})

process.on('SIGINT', () => {
  gameOver = true
  server.close(() => {
    console.log('Server shut down')
    process.exit(0)
  })
})
