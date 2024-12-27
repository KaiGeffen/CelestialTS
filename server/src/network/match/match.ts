import { ServerController } from '../../gameController'
import Card from '../../../../shared/state/card'
import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'
import { Mulligan } from '../../../../shared/settings'
import getClientGameModel from '../../../../shared/state/clientGameModel'

interface Match {
  ws1: TypedWebSocket | null
  ws2: TypedWebSocket | null
  uuid1: string | null
  uuid2: string | null

  storedDeck: Card[]
  storedAvatar: any

  game: ServerController | null
  lock: any
}

class Match {
  constructor(
    ws1: TypedWebSocket,
    uuid1: string | null = null,
    deck1: Card[] = [],
    avatar1: number,
    ws2: TypedWebSocket,
    uuid2: string | null = null,
    deck2: Card[] = [],
    avatar2: number,
  ) {
    this.ws1 = ws1
    this.uuid1 = uuid1
    this.ws2 = ws2
    this.uuid2 = uuid2

    // Make a new game
    this.game = new ServerController(deck1, deck2, avatar1, avatar2)
    this.game.start()
  }

  // Notify all connected players that the match has started
  async notifyMatchStart() {
    await Promise.all(
      this.getActiveWsList().map((ws) => ws.send({ type: 'gameStart' })),
    )
  }

  // Notify players of the state of the game
  async notifyState() {
    if (this.game === null) return

    await Promise.all(
      this.getActiveWsList().map((ws, index) => {
        /*
       Send each state since last input
       For actions besides the last pass of a round, this is just 1
       but for recaps it's each slice of the recap
       */
        // Send any recap states
        this.game.model.recentModels[index].forEach((state) =>
          ws.send({
            type: 'transmitState',
            state: state,
          }),
        )

        // Send the normal state
        ws.send({
          type: 'transmitState',
          state: getClientGameModel(this.game.model, index, false),
        })
      }),
    )
  }

  async doMulligan(player: number, mulligan: Mulligan) {
    this.game.doMulligan(player, mulligan)
    await this.notifyState()
  }

  // Given player does the given action
  async doAction(player: number, action: number) {
    const valid = this.game.onPlayerInput(player, action)

    if (valid) {
      await this.notifyState()
    } else {
      const ws = player === 0 ? this.ws1 : this.ws2
      // TODO
      // await this.notifyError(ws)
    }
  }

  // Get the list of all active websockets connected to this match
  private getActiveWsList(): TypedWebSocket[] {
    return [this.ws1, this.ws2].filter((ws) => ws !== null)
  }

  async signalEmote(player: number, emoteNumber: number) {
    if (player === 0 && this.ws2 !== null) {
      await this.ws2.send({ type: 'emote' })
    }
    if (player === 1 && this.ws1 !== null) {
      await this.ws1.send({ type: 'emote' })
    }
  }

  // Given ws is disconnecting
  async doExit(disconnectingWs: TypedWebSocket) {
    if (this.game === null || this.game.model.getWinner() !== null) return

    // Null the ws that has disconnected
    if (this.ws1 === disconnectingWs) this.ws1 = null
    else if (this.ws2 === disconnectingWs) this.ws2 = null

    // Notify remaining player of the disconnect
    await Promise.all(
      this.getActiveWsList().map((ws) => ws.send({ type: 'dc' })),
    )
  }
}

function addWin(uuid: string) {
  // Implement logic to record a win for the player with the given uuid
  console.log(`Player with UUID ${uuid} has won.`)
}

function addLoss(uuid: string) {
  // Implement logic to record a loss for the player with the given uuid
  console.log(`Player with UUID ${uuid} has lost.`)
}

export default Match
