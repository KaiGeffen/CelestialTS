import 'phaser'
import { Space } from "../settings/settings"


var timeout: NodeJS.Timeout = undefined
const DELAY = 200

// When the window is resized, adjust the dimensions to match the change
export default function addResizeHandler(game: Phaser.Game) {
  window.onresize = () => {
    // Only do this a short delay after resizing stops
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      const width = Math.floor(window.innerWidth)
      const height = Math.floor(window.innerHeight)

      game.scale.resize(width, height)

      Space.windowWidth = width
      Space.windowHeight = height

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
