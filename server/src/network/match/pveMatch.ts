import Match from './match'
import Card from '../../../../shared/state/card'
import GameModel from '../../../../shared/state/gameModel'
import { ServerController } from '../../gameController'
import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'
import { PASS } from '../../../../shared/settings'

class PveMatch extends Match {
  constructor(
    ws: TypedWebSocket,
    uuid: string,
    deck: Card[],
    avatar: number,
    aiDeck: Card[],
  ) {
    super(
      ws,
      uuid,
      deck,
      avatar,
      null,
      null,
      aiDeck,
      0, // TODO ai avatar choice
    )
  }

  async notifyState() {
    await super.notifyState()

    // Opponent will act if it's their turn
    if (
      this.game.model.priority === 1 &&
      !this.game.model.mulligansComplete.includes(false)
    ) {
      await this.opponentActs()
    }
  }

  // TODO Implement ai opponent, for now just pass
  async opponentActs() {
    this.game.onPlayerInput(1, PASS)
    await this.notifyState()
    // await this.lock
    // const opponentModel = new ClientModel(this.game.get_client_model(1))
    // const opponentAction = AI.get_action(opponentModel)

    // const valid = this.game.on_player_input(1, opponentAction)

    // if (valid) await this.notifyState()
  }

  async doMulligan(player, mulligan) {
    // Opponent first mulligans nothing
    this.game.doMulligan(1, [false, false, false, false])

    // if (this.vs_ai) this.game.model.sound = null TODO idk why this happen

    await super.doMulligan(player, mulligan)
  }

  // async addAiOpponent(i: number | null = null) {
  //   await this.addDeck(1, get_computer_deck(i), 0)
  //   this.vs_ai = true
  // }
}

export default PveMatch
