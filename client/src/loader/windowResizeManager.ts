import 'phaser'
import { Space, refreshSpace } from '../settings/space'

var timeout: NodeJS.Timeout = undefined
const DELAY = 200

// When the window is resized, adjust the dimensions to match the change
export default function addResizeHandler(game: Phaser.Game) {
  window.onresize = () => {
    // Only do this a short delay after resizing stops
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      refreshSpace()

      game.scale.setGameSize(Space.windowWidth, Space.windowHeight).refresh()
    }, DELAY)
  }
}
