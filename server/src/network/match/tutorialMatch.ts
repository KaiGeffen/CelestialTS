import { TypedWebSocket } from '../../../../shared/network/typedWebSocket'
import { TutorialController } from '../../logic/tutorialController'
import PveMatch from './pveMatch'
import { PASS } from '../../../../shared/settings'

class TutorialMatch extends PveMatch {
  constructor(ws: TypedWebSocket, num: number) {
    // TODO Weird to start a normal game, then erase it
    super(ws, '', [], 0, [])

    this.game = new TutorialController(num)
    this.game.start()
  }

  protected async opponentActs() {
    let success = false
    ;[0, 1, 2, 3, 4, 5, PASS].forEach((action) => {
      if (!success) {
        success ||= this.game.onPlayerInput(1, action)
      }
    })
    await this.notifyState()
  }
}

export default TutorialMatch
