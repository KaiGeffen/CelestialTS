import { ServerController } from '../../gameController.js'

interface Match {
  ws1: WebSocket | null
  ws2: WebSocket | null
  uuid1: string | null
  uuid2: string | null

  storedDeck: any
  storedAvatar: any

  game: ServerController | null
  lock: any
}

class Match {
  constructor(ws: WebSocket, uuid: string | null = null) {
    this.ws1 = ws
    this.uuid1 = uuid
  }

  async addDeck(player: number, deck: any, avatar: any) {
    await this.lock
    if (this.storedDeck === null) {
      this.storedDeck = deck
      this.storedDeck = avatar
    } else {
      if (player === 0) {
        this.game = new ServerController(
          deck,
          this.storedDeck,
          avatar,
          this.storedDeck,
        )
      } else {
        this.game = new ServerController(
          this.storedDeck,
          deck,
          this.storedDeck,
          avatar,
        )
      }
      this.game.start()
    }
  }

  // TODO Below is written by ai
  hasBegun() {
    return this.game !== null
  }

  async notifyNumberPlayersConnected() {
    const ready = this.ws2 !== null || this.vs_ai
    const message = JSON.stringify({
      type: 'both_players_connected',
      value: ready,
    })

    const activeWs = []
    if (this.ws1 !== null) activeWs.push(this.ws1)
    if (this.ws2 !== null) activeWs.push(this.ws2)

    await Promise.all(activeWs.map((ws) => ws.send(message)))
  }

  async notifyState() {
    if (this.game === null) return

    const winner = this.game.model.get_winner()
    if (winner === 0) {
      if (this.uuid1 !== null) {
        addWin(this.uuid1)
        this.uuid1 = null
      }
      if (this.uuid2 !== null) {
        addLoss(this.uuid2)
        this.uuid2 = null
      }
    } else if (winner === 1) {
      if (this.uuid1 !== null) {
        addLoss(this.uuid1)
        this.uuid1 = null
      }
      if (this.uuid2 !== null) {
        addWin(this.uuid2)
        this.uuid2 = null
      }
    }

    const messages = []
    if (this.ws1 !== null) messages.push(this.ws1.send(this.stateEvent(0)))
    if (this.ws2 !== null) messages.push(this.ws2.send(this.stateEvent(1)))

    await Promise.all(messages)

    if (
      this.vs_ai &&
      this.game.model.priority === 1 &&
      !this.game.model.mulligans_complete.includes(false)
    ) {
      await this.opponentActs()
    }
  }

  stateEvent(player: number) {
    return JSON.stringify({
      type: 'transmit_state',
      value: this.game.get_client_model(player),
    })
  }

  async notifyExit(disconnectingWs: WebSocket | null = null) {
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

  addPlayer2(ws: WebSocket, uuid: string | null = null) {
    this.ws2 = ws
    this.uuid2 = uuid
    return this
  }

  async doMulligan(player: number, mulligan: boolean[]) {
    await this.lock
    this.game.do_mulligan(player, mulligan)

    if (this.vs_ai) this.game.model.sound = null

    await this.notifyState()

    if (this.vs_ai) this.game.do_mulligan(1, [false, false, false, false])
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

  async signalEmote(player: number, emoteNumber: number) {
    if (this.game === null) return

    const msg = JSON.stringify({ type: 'opponent_emote', value: emoteNumber })
    if (player === 0 && this.ws2 !== null) await this.ws2.send(msg)
    if (player === 1 && this.ws1 !== null) await this.ws1.send(msg)
  }

  async addAiOpponent(i: number | null = null) {
    await this.addDeck(1, get_computer_deck(i), 0)
    this.vs_ai = true
  }

  async addSpecificAiOpponent(deckCode: string) {
    await this.addDeck(1, CardCodec.decode_deck(deckCode), 0)
    this.vs_ai = true
  }

  async opponentActs() {
    await this.lock
    const opponentModel = new ClientModel(this.game.get_client_model(1))
    const opponentAction = AI.get_action(opponentModel)

    const valid = this.game.on_player_input(1, opponentAction)

    if (valid) await this.notifyState()
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
