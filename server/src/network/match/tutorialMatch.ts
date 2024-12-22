import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'
import { TutorialController } from '../../logic/tutorialController'
import PveMatch from './pveMatch'

class TutorialMatch extends PveMatch {
  constructor(ws: TypedWebSocket, num: number) {
    // TODO Weird to start a normal game, then erase it
    super(ws, '', [], 0, [])

    this.game = new TutorialController(num)
    this.game.start()
  }

  protected async opponentActs() {
    this.game.onPlayerInput(1, 10)
    await this.notifyState()
  }
}

export default TutorialMatch
