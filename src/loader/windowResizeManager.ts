import 'phaser'
import { Space } from "../settings/settings"


// When the window is resized, adjust the dimensions to match the change
export default function addResizeHandler(game: Phaser.Game) {
  window.addEventListener('resize', () => {
    const width = Math.floor(window.innerWidth)
    const height = Math.floor(window.innerHeight)

    game.scale.resize(width, height)

    Space.windowWidth = width
    Space.windowHeight = height

    // Reload the active scene
    game.scene.scenes.forEach(scene => {
      if (game.scene.isActive(scene)) {
          // TODO Come up with a redraw method to adjust to the new dimensions
          // this.scene.start(scene)
      }
    })
  })
}
