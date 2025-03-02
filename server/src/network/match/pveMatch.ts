import Match from './match'
import { getAction } from '../../ai'
import getClientGameModel from '../../../../shared/state/clientGameModel'
import { MatchServerWS } from '../../../../shared/network/matchWS'
import { Deck } from '../../../../shared/types/deck'

class PveMatch extends Match {
  constructor(ws: MatchServerWS, uuid: string, deck: Deck, aiDeck: Deck) {
    super(ws, uuid, deck, null, null, aiDeck)
  }

  async notifyState() {
    await super.notifyState()

    // Opponent will act if it's their turn
    if (
      this.game.model.priority === 1 &&
      !this.game.model.mulligansComplete.includes(false) &&
      this.game.model.winner === null
    ) {
      await this.opponentActs()
    }
  }

  // TODO Implement ai opponent, for now just pass
  protected async opponentActs() {
    const model = getClientGameModel(this.game.model, 1, false)
    const action = getAction(model)
    if (this.game.onPlayerInput(1, action)) {
      await this.notifyState()
    } else {
      console.error('Computer opponent chose invalid action')
    }

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
