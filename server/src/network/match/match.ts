import { ServerController } from '../../gameController'
import Card from '../../../../shared/state/card'
import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'

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
  }

  // Notify all connected players that the match has started
  async notifyMatchStart() {
    await Promise.all(
      this.getActiveWsList().map((ws) =>
        // TODO Change this to 'game starting' or something
        ws.send({ type: 'both_players_connected', value: true }),
      ),
    )
  }

  // Notify players of the state of the game
  async notifyState() {
    if (this.game === null) return

    await Promise.all(
      this.getActiveWsList().map((ws, index) =>
        ws.send({
          type: 'transmit_state',
          state: this.game.getClientModel(index),
        }),
      ),
    )
  }

  // TODO Use the same Mulligan type throughout
  async doMulligan(player: number, mulligan: boolean[]) {
    this.game.doMulligan(player, mulligan)
    await this.notifyState()
  }

  // Get the list of all active websockets connected to this match
  private getActiveWsList(): TypedWebSocket[] {
    return [this.ws1, this.ws2].filter((ws) => ws !== null)
  }

  async notifyExit(disconnectingWs: TypedWebSocket | null = null) {
    if (this.game === null || this.game.model.get_winner() !== null) return

    if (this.ws1 === disconnectingWs) this.ws1 = null
    else if (this.ws2 === disconnectingWs) this.ws2 = null

    const messages = []
    if (this.ws1 !== null && !this.ws1.readyState)
      messages.push(this.ws1.send(JSON.stringify({ type: 'dc' })))
    if (this.ws2 !== null && !this.ws2.readyState)
      messages.push(this.ws2.send(JSON.stringify({ type: 'dc' })))

    if (messages.length) await Promise.all(messages)
  }

  async doAction(player: number, action: any, version: number) {
    let valid: boolean
    await this.lock
    valid = this.game.on_player_input(player, action, version)

    if (valid) {
      await this.notifyState()
    } else {
      const ws = player === 0 ? this.ws1 : this.ws2
      await notifyError(ws)
    }
  }

  // TODO Implement emotes
  async signalEmote(player: number, emoteNumber: number) {
    return
    if (this.game === null) return

    // const msg = JSON.stringify({ type: 'opponent_emote', value: emoteNumber })
    // if (player === 0 && this.ws2 !== null) await this.ws2.send(msg)
    // if (player === 1 && this.ws1 !== null) await this.ws1.send(msg)
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
