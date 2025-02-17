import Match from './match'
import Card from '../../../../shared/state/card'
import { MatchServerWS } from '../../../../shared/network/matchWS'
import { updateMatchResult } from '../../db/updateMatchResult'

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

  // Given ws is disconnecting
  async doExit(disconnectingWs: MatchServerWS) {
    // Don't send disconnect message if the game has already ended
    if (this.game === null || this.game.model.winner !== null) return

    // Update match result, counting the disconnecting player as the loser
    const winner = this.ws1 === disconnectingWs ? 1 : 0
    await this.updateMatchResult(winner)

    // Null the ws that has disconnected
    if (this.ws1 === disconnectingWs) this.ws1 = null
    else if (this.ws2 === disconnectingWs) this.ws2 = null

    // Notify remaining player of the disconnect
    await Promise.all(
      this.getActiveWsList().map((ws: MatchServerWS) =>
        ws.send({ type: 'dc' }),
      ),
    )
  }

  async notifyState(): Promise<void> {
    await super.notifyState()

    // If there is a winner, update wins/losses/elo accordingly
    console.log('This game has a winner:', this.game.model.winner)
    if (this.game.model.winner !== null) {
      await this.updateMatchResult(this.game.model.winner)
    }
  }

  // Update the database records for this match
  private async updateMatchResult(winner: number) {
    // If either uuid is null, don't update the database
    if (!this.uuid1 || !this.uuid2) {
      console.log('No uuid found, skipping updateMatchResult')
      return
    }

    const idWinner = winner === 0 ? this.uuid1 : this.uuid2
    const idLoser = winner === 0 ? this.uuid2 : this.uuid1

    await updateMatchResult(idWinner, idLoser)
  }
}

export default PvpMatch
