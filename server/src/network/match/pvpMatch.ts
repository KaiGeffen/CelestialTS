import Match from './match'
import Card from '../../../../shared/state/card'
import { MatchServerWS } from '../../../../shared/network/matchWS'

class PvpMatch extends Match {
  constructor(
    ws1: MatchServerWS,
    uuid1: string,
    deck1: Card[],
    avatar1: number,
    ws2: MatchServerWS,
    uuid2: string,
    deck2: Card[],
    avatar2: number,
  ) {
    super(ws1, uuid1, deck1, avatar1, ws2, uuid2, deck2, avatar2)

    // Add close handlers for both websockets
    ws1.onClose(() => {
      if (this.ws2?.ws.readyState === 1) {
        this.ws2.send({ type: 'dc' })
      }
    })
    ws2.onClose(() => {
      if (this.ws1?.ws.readyState === 1) {
        this.ws1.send({ type: 'dc' })
      }
    })
  }
}

export default PvpMatch
