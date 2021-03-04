import "phaser";
import { WelcomeScene } from "./welcomeScene";
import { GameScene } from "./gameScene";
import { BuilderScene } from "./builderScene"

const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: 1100,
  height: 650,
  parent: "game",
  scene: [WelcomeScene, GameScene, BuilderScene],
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
