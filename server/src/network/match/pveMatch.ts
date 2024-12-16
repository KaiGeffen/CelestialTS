import Match from './match'
import { Card } from '../../../../shared/state/card'
import { GameModel } from '../../../../shared/state/gameModel'
import { ServerController } from '../../gameController'

interface PveMatch {
  ws1: WebSocket
  uuid1: string | null

  storedDeck: any
  storedAvatar: any

  game: any
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
