import "phaser"
import { WelcomeScene } from "./scene/welcomeScene"
import { GameScene } from "./scene/gameScene"
import { BuilderScene } from "./scene/builderScene"


const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: 1100,
  height: 650,
  parent: "game",
  scene: [WelcomeScene, GameScene, BuilderScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  backgroundColor: "#202070"
}

export class CelestialGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
  }
}

window.onload = () => {
  var game = new CelestialGame(config)
}
