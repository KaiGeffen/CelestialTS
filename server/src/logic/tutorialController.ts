import { ServerController } from './ServerController'
import { ServerModel } from './ServerModel'
import { dove, mercy, dash, uprising, stars, fruit, cosmos } from './Catalog'

class TutorialController extends ServerController {
  private model: ServerModel

  constructor(num?: number) {
    super()

    const p_decks = [
      [
        dove,
        dove,
        dove,
        dove,
        dove,
        mercy,
        dash,
        mercy,
        dove,
        dash,
        dove,
        dash,
        dove,
        dove,
      ],
      [
        uprising,
        dove,
        mercy,
        dash,
        stars,
        stars,
        dove,
        stars,
        stars,
        uprising,
        stars,
        mercy,
        dove,
        stars,
      ],
      [
        uprising,
        dove,
        dove,
        fruit,
        dash,
        dove,
        dove,
        stars,
        cosmos,
        fruit,
        uprising,
        dove,
        stars,
        fruit,
        dove,
      ],
    ]
    const o_decks = [
      [
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
      ],
      [
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
      ],
      [
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dove,
        dash,
        dash,
        dash,
        dove,
        dash,
        dash,
        stars,
      ],
    ]

    let player_deck = [
      mercy,
      mercy,
      dove,
      dash,
      mercy,
      dove,
      dove,
      dash,
      dove,
      dove,
      dash,
      dove,
      dash,
      dove,
      dove,
    ]
    let ai_deck = [
      dove,
      mercy,
      dove,
      dove,
      mercy,
      dove,
      dove,
      dove,
      mercy,
      dove,
      dove,
      dove,
      dove,
      dove,
      dove,
    ]

    if (num !== undefined) {
      player_deck = p_decks[num]
      ai_deck = o_decks[num]
    }
    this.model = new ServerModel(player_deck, ai_deck, 0, 0, false)

    if (num !== undefined) {
      this.model.wins[0] = 2
    }
  }

  start() {
    super.start()
    this.model.priority = 0
  }

  doMulligan(player: number, mulligans: any) {
    this.model.mulligans_complete[player] = true
  }

  doUpkeep() {
    super.doUpkeep()
    this.model.priority = 0
  }

  doTakedown() {
    if (this.model.wins[0] >= 2) {
      super.doTakedown()
      return
    }

    this.model.score = [0, 0]
    const wins = [0, 0]

    this.model.recap.reset()
    this.model.story.run(this.model, true)

    if (this.model.score[0] > this.model.score[1]) {
      if (this.model.score[0] > 0) {
        wins[0] += 1
      }
    } else if (this.model.score[1] > this.model.score[0]) {
      if (this.model.score[1] > 0) {
        wins[1] += 1
      }
    }

    this.model.wins[0] += wins[0]
    this.model.wins[1] += wins[1]

    this.model.recap.addTotal(this.model.score, wins, [0, 0])
    this.model.story.saveEndState(this.model)
    this.model.story.clear()
  }
}

export { TutorialController }
