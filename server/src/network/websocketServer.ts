import * as WebSocket from 'ws'
import * as http from 'http'
import * as url from 'url'
import * as CardCodec from './CardCodec'
import * as AI from './AI'
import { ServerController } from './logic/ServerController'
import { TutorialController } from './logic/TutorialController'
import { get_computer_deck } from './logic/Catalog'
import { ClientModel } from './logic/ClientModel'
import { authenticate, add_win, add_loss } from './Authenticate'

const PORT = 8080
const LOCAL = 'localhost'

interface GameMatch {
  game: any
  ws1: WebSocket | null
  ws2: WebSocket | null
  stored_deck: any
  stored_avatar: any
  vs_ai: boolean
  lock: any
  uuid1: string | null
  uuid2: string | null
}

class GameMatch {
  constructor(ws: WebSocket, uuid: string | null = null) {
    this.ws1 = ws
    this.uuid1 = uuid
    this.lock = new Promise<void>((resolve) => resolve())
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

  async add_ai_opponent(i: number | null = null) {
    await this.add_deck(1, get_computer_deck(i), 0)
    this.vs_ai = true
  }

  async add_specific_ai_opponent(deck_code: string) {
    await this.add_deck(1, CardCodec.decode_deck(deck_code), 0)
    this.vs_ai = true
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
          this.stored_avatar
        )
      } else {
        this.game = new ServerController(
          this.stored_deck,
          deck,
          this.stored_avatar,
          avatar
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

class TutorialMatch extends GameMatch {
  constructor(ws: WebSocket, num: number | null = null) {
    super(ws)
    this.vs_ai = true

    this.game = new TutorialController(num)
    this.game.start()
    this.game.do_mulligan(0, [false, false, false])
    this.game.do_mulligan(1, [false, false, false])
    this.game.model.version_no = 0
  }

  async add_deck(player: number, deck: any, avatar: any) {
    return
  }
}

async function notify_error(ws: WebSocket | null) {
  const msg = JSON.stringify({ type: 'signal_error' })
  if (ws !== null) await ws.send(msg)
}

const PWD_MATCHES: { [key: string]: GameMatch } = {}
const matches_lock = new Promise<void>((resolve) => resolve())

async function serveMain(ws: WebSocket, req: http.IncomingMessage) {
  const path = url.parse(req.url || '', true).pathname?.substring(1) || ''

  if (path === 'tokensignin') {
    await authenticate(ws)
    return
  }

  const [match, player] = await get_match(ws, path)

  ws.on('message', async (message: string) => {
    const data = JSON.parse(message)
    await handle_game_messages(data, match, player)
  })

  ws.on('close', async () => {
    await match_cleanup(path, match, ws)
  })
}

async function match_cleanup(
  path: string,
  match: GameMatch,
  ws: WebSocket | null = null
) {
  if (match === null) return

  await matches_lock
  if (!match.has_begun()) {
    if (PWD_MATCHES[path]) {
      console.log(`Player left before getting into a game. ${path}`)
      delete PWD_MATCHES[path]
    }
  }

  await match.notify_exit(ws)
}

async function get_match(
  ws: WebSocket,
  path: string,
  uuid: string | null = null
): Promise<[GameMatch, number]> {
  let match: GameMatch
  let player: number

  if (path === 'ai') {
    player = 0
    match = new GameMatch(ws, uuid)
    await match.add_ai_opponent()
  } else if (path.startsWith('ai-')) {
    player = 0
    match = new GameMatch(ws, uuid)
    const i = parseInt(path.substring(3))
    await match.add_ai_opponent(i)
  } else if (path.startsWith('ai:t')) {
    player = 0
    const tutorial_number = parseInt(path.substring(4))
    match = new TutorialMatch(ws, tutorial_number)
  } else if (path.startsWith('ai:')) {
    player = 0
    match = new GameMatch(ws, uuid)
    const deck_code = path.substring(3)
    await match.add_specific_ai_opponent(deck_code)
  } else if (path === 'tutorial') {
    player = 0
    match = new TutorialMatch(ws)
  } else {
    await matches_lock
    if (!PWD_MATCHES[path]) {
      player = 0
      match = new GameMatch(ws, uuid)
      PWD_MATCHES[path] = match
    } else {
      player = 1
      match = PWD_MATCHES[path].add_player_2(ws, uuid)
      delete PWD_MATCHES[path]
    }
  }

  await match.notify_number_players_connected()

  return [match, player]
}

async function handle_game_messages(
  data: any,
  match: GameMatch,
  player: number
) {
  if (data.type === 'init') {
    const deck = CardCodec.decode_deck(data.value)
    const avatar = data.avatar

    await match.add_deck(player, deck, avatar)
    await match.notify_state()
  } else if (data.type === 'mulligan') {
    const mulligan = CardCodec.decode_mulligans(data.value)
    await match.do_mulligan(player, mulligan)
    await match.notify_state()
  } else if (data.type === 'play_card') {
    await match.do_action(player, data.value, data.version)
  } else if (data.type === 'pass_turn') {
    await match.do_action(player, 10, data.version)
  } else if (data.type === 'emote') {
    await match.signal_emote(player, data.value)
  } else {
    console.log(data.type)
  }
}

const server = http.createServer()
const wss = new WebSocket.Server({ server })

wss.on('connection', serveMain)

server.listen(PORT, LOCAL, () => {
  console.log(`Server started on ${LOCAL}:${PORT}`)
})
