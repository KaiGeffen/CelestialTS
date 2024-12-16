import Match from './match.js'

interface pvpMatch {
  game: any
  ws1: WebSocket | null
  ws2: WebSocket | null
  storedDeck: any
  storedAvatar: any
  lock: any
  uuid1: string | null
  uuid2: string | null
}

class pvpMatch extends Match {
  constructor(ws: WebSocket, uuid: string | null = null) {
    super(ws, uuid)
    this.ws1 = ws
    this.uuid1 = uuid
  }

  has_begun() {
    return this.game !== null
  }

  async notify_number_players_connected() {
    const ready = this.ws2 !== null || this.vs_ai
    const message = JSON.stringify({
      type: 'both_players_connected',
      value: ready,
    })

    const active_ws = []
    if (this.ws1 !== null) active_ws.push(this.ws1)
    if (this.ws2 !== null) active_ws.push(this.ws2)

    await Promise.all(active_ws.map((ws) => ws.send(message)))
  }

  async notify_state() {
    if (this.game === null) return

    const winner = this.game.model.get_winner()
    if (winner === 0) {
      if (this.uuid1 !== null) {
        add_win(this.uuid1)
        this.uuid1 = null
      }
      if (this.uuid2 !== null) {
        add_loss(this.uuid2)
        this.uuid2 = null
      }
    } else if (winner === 1) {
      if (this.uuid1 !== null) {
        add_loss(this.uuid1)
        this.uuid1 = null
      }
      if (this.uuid2 !== null) {
        add_win(this.uuid2)
        this.uuid2 = null
      }
    }

    const messages = []
    if (this.ws1 !== null) messages.push(this.ws1.send(this.state_event(0)))
    if (this.ws2 !== null) messages.push(this.ws2.send(this.state_event(1)))

    await Promise.all(messages)

    if (
      this.vs_ai &&
      this.game.model.priority === 1 &&
      !this.game.model.mulligans_complete.includes(false)
    ) {
      await this.opponent_acts()
    }
  }

  state_event(player: number) {
    return JSON.stringify({
      type: 'transmit_state',
      value: this.game.get_client_model(player),
    })
  }

  async notify_exit(disconnecting_ws: WebSocket | null = null) {
    if (this.game === null || this.game.model.get_winner() !== null) return

    if (this.ws1 === disconnecting_ws) this.ws1 = null
    else if (this.ws2 === disconnecting_ws) this.ws2 = null

    const messages = []
    if (this.ws1 !== null && !this.ws1.readyState)
      messages.push(this.ws1.send(JSON.stringify({ type: 'dc' })))
    if (this.ws2 !== null && !this.ws2.readyState)
      messages.push(this.ws2.send(JSON.stringify({ type: 'dc' })))

    if (messages.length) await Promise.all(messages)
  }

  add_player_2(ws: WebSocket, uuid: string | null = null) {
    this.ws2 = ws
    this.uuid2 = uuid
    return this
  }

  async do_mulligan(player: number, mulligan: boolean[]) {
    await this.lock
    this.game.do_mulligan(player, mulligan)

    if (this.vs_ai) this.game.model.sound_effect = null

    await this.notify_state()

    if (this.vs_ai) this.game.do_mulligan(1, [false, false, false, false])
  }

  async do_action(player: number, action: any, version: number) {
    let valid: boolean
    await this.lock
    valid = this.game.on_player_input(player, action, version)

    if (valid) {
      await this.notify_state()
    } else {
      const ws = player === 0 ? this.ws1 : this.ws2
      await notify_error(ws)
    }
  }

  async signal_emote(player: number, emote_number: number) {
    if (this.game === null) return

    const msg = JSON.stringify({ type: 'opponent_emote', value: emote_number })
    if (player === 0 && this.ws2 !== null) await this.ws2.send(msg)
    if (player === 1 && this.ws1 !== null) await this.ws1.send(msg)
  }

  async add_deck(player: number, deck: any, avatar: any) {
    await this.lock
    if (this.stored_deck === null) {
      this.stored_deck = deck
      this.stored_avatar = avatar
    } else {
      if (player === 0) {
        this.game = new ServerController(
          deck,
          this.stored_deck,
          avatar,
          this.stored_avatar,
        )
      } else {
        this.game = new ServerController(
          this.stored_deck,
          deck,
          this.stored_avatar,
          avatar,
        )
      }
      this.game.start()

      const deck_to_string = (d: any) =>
        d.map((card: any) => card.name).join(', ')

      const d1 =
        player === 0 ? deck_to_string(deck) : deck_to_string(this.stored_deck)
      const d2 =
        player === 0 ? deck_to_string(this.stored_deck) : deck_to_string(deck)

      let s = 'Game started between ips:'
      if (this.ws1 !== null) s += ` ${this.ws1.url} `
      if (this.ws2 !== null) s += ` ${this.ws2.url} `
      s += `\nDecks:\n${d1}\n${d2}\n`
      console.log(s)
    }
  }

  async opponent_acts() {
    await this.lock
    const opponent_model = new ClientModel(this.game.get_client_model(1))
    const opponent_action = AI.get_action(opponent_model)

    const valid = this.game.on_player_input(1, opponent_action)

    if (valid) await this.notify_state()
  }
}

function add_win(uuid: string) {
  // Implement logic to record a win for the player with the given uuid
  console.log(`Player with UUID ${uuid} has won.`)
}

function add_loss(uuid: string) {
  // Implement logic to record a loss for the player with the given uuid
  console.log(`Player with UUID ${uuid} has lost.`)
}

export default pvpMatch
