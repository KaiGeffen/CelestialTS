import { ServerController } from '../../gameController'
import Card from '../../../../shared/state/card'
import { Mulligan } from '../../../../shared/settings'
import getClientGameModel from '../../../../shared/state/clientGameModel'
import { MatchServerWS } from '../../../../shared/network/matchWS'
import { v5 as uuidv5 } from 'uuid'
import { UUID_NAMESPACE } from '../../../../shared/network/settings'
import { db } from '../../db/db'
import { players } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface Match {
  ws1: MatchServerWS | null
  ws2: MatchServerWS | null
  uuid1: string | null
  uuid2: string | null

  storedDeck: Card[]
  storedAvatar: any

  game: ServerController
  lock: any
}

class Match {
  constructor(
    ws1: MatchServerWS,
    uuid1: string | null = null,
    deck1: Card[] = [],
    avatar1: number,
    ws2: MatchServerWS | null,
    uuid2: string | null = null,
    deck2: Card[] = [],
    avatar2: number,
  ) {
    this.ws1 = ws1
    this.uuid1 = uuid1 ? uuidv5(uuid1, UUID_NAMESPACE) : null
    this.ws2 = ws2
    this.uuid2 = uuid2 ? uuidv5(uuid2, UUID_NAMESPACE) : null

    // Make a new game
    this.game = new ServerController(deck1, deck2, avatar1, avatar2)
    this.game.start()
  }

  // Notify all connected players that the match has started
  async notifyMatchStart() {
    const username1 = await this.getUsername(this.uuid1)
    const username2 = await this.getUsername(this.uuid2)

    await Promise.all(
      this.getActiveWsList().map((ws) =>
        ws.send({
          type: 'matchStart',
          name1: username1,
          name2: username2,
        }),
      ),
    )
  }

  // Notify players of the state of the game
  async notifyState() {
    if (this.game === null) return

    /*
      Send each state since last input
      For actions besides the last pass of a round, this is just 1
      but for recaps it's each slice of the recap
    */
    await Promise.all(
      this.getActiveWsList().map((ws, player) => {
        // Send any recap states
        this.game.model.recentModels[player].forEach((state) =>
          ws.send({
            type: 'transmitState',
            state: getClientGameModel(state, player, true),
          }),
        )

        // Send the normal state
        ws.send({
          type: 'transmitState',
          state: getClientGameModel(this.game.model, player, false),
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
  protected getActiveWsList(): MatchServerWS[] {
    return [this.ws1, this.ws2].filter((ws) => ws !== null)
  }

  async signalEmote(player: number, emoteNumber: number) {
    // TODO Use emoteNumber
    if (player === 0 && this.ws2 !== null) {
      await this.ws2.send({ type: 'opponentEmote' })
    }
    if (player === 1 && this.ws1 !== null) {
      await this.ws1.send({ type: 'opponentEmote' })
    }
  }

  // Given ws is disconnecting, implemented in pvpMatch
  async doExit(disconnectingWs: MatchServerWS) {
    console.log('Base Match class shouldnt received doExit message....')
  }

  // Get the name of player with given uuid
  private async getUsername(uuid: string | null): Promise<string> {
    if (!uuid) return ''

    try {
      const result = await db
        .select({
          username: players.username,
          elo: players.elo,
        })
        .from(players)
        .where(eq(players.id, uuid))
        .limit(1)

      if (result.length === 0) return ''

      return `${result[0].username} (${result[0].elo})`
    } catch (error) {
      console.error('Error fetching username:', error)
      return ''
    }
  }
}

export default Match
