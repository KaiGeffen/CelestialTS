import Match from './match'
import Card from '../../../../shared/state/card'
import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'
import { PASS } from '../../../../shared/settings'
import { getAction } from '../../ai'

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
  protected async opponentActs() {
    // const model = this.game.getClientModel(1)
    // const action = getAction(model)
    // this.game.onPlayerInput(1, action)

    ;[0, 1, 2, 3, 4, 5, PASS].forEach((action) => {
      if (this.game.onPlayerInput(1, action)) {
        return
      }
    })
    await this.notifyState()
    // await this.lock
    // const opponentModel = new ClientModel(this.game.get_client_model(1))
    // const opponentAction = AI.get_action(opponentModel)

    // const valid = this.game.on_player_input(1, opponentAction)

    // if (valid) await this.notifyState()
  }

  async doMulligan(player, mulligan) {
    await super.doMulligan(player, mulligan)

    // TODO Opponent makes smarter mulligan
    this.game.doMulligan(1, [false, false, false])
    await this.notifyState()
  }

  // async addAiOpponent(i: number | null = null) {
  //   await this.addDeck(1, get_computer_deck(i), 0)
  //   this.vs_ai = true
  // }
}

export default PveMatch
