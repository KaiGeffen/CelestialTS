import 'phaser'
import { Space, refreshSpace } from "../settings/space"


var timeout: NodeJS.Timeout = undefined
const DELAY = 200

// When the window is resized, adjust the dimensions to match the change
export default function addResizeHandler(game: Phaser.Game) {
  window.onresize = () => {
    // Only do this a short delay after resizing stops
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      refreshSpace()
      
      game.scale.setGameSize(Space.windowWidth, Space.windowHeight)

      // If in a match, don't reload
      // TODO Do reload, but better handle disconnects/reconnects
      // if (game.scene.getScene('StandardGameScene').scene.isActive()
      //   || game.scene.getScene('AdventureGameScene').scene.isActive()) {
      //   return
      // }

      // // If not in a match, reload the scene
      // game.scene.scenes.forEach(scene => {
      //   if (game.scene.isActive(scene)) {
      //     scene.scene.restart()
      //   }
      // })
    }, DELAY)
  }
}
