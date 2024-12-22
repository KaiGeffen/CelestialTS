import Card from '../card'
import GameModel from '../gameModel'

class Rat extends Card {
  play(player: number, game: GameModel, index: number, bonus: number): void {
    if (game.breath[player] >= 2) {
      game.breath[player] -= 2
      for (const act of game.story.acts) {
        if (act.owner === player) {
          bonus += 1
        }
      }
    }

    super.play(player, game, index, bonus)

    if (game.hand[player].length === 0) {
      this.draw(1, game, player)
    }
  }
}
const rat = new Rat({
  name: 'Rat',
  cost: 0,
  points: 0,
  id: 2000,
})

export { rat }
