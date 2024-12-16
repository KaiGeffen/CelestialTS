import Match from './match.js'
import { Card } from '../../../../shared/state/card.js'
import { Game } from '../../../../shared/state/gameModel.js'
import { ServerController } from '../../gameController.js'

interface PveMatch {
  ws1: WebSocket
  uuid1: string | null

  storedDeck: any
  storedAvatar: any

  game: Game
  lock: any
}

class PveMatch extends Match {
  constructor(ws: WebSocket, aiDeck: Card[], uuid: string | null = null) {
    super(ws, uuid)

    // TODO Get ai avatar
    this.addDeck(1, aiDeck, 0)
  }
}

export default PveMatch
