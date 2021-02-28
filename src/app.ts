import "phaser";
import { WelcomeScene } from "./welcomeScene";
import { GameScene } from "./gameScene";
import { ScoreScene } from "./scoreScene";
import { BuilderScene } from "./builderScene"
const config: Phaser.Types.Core.GameConfig = {
  title: "Starfall",
  width: 1000,
  height: 650,
  parent: "game",
  scene: [WelcomeScene, GameScene, ScoreScene, BuilderScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  backgroundColor: "#202070"
};

export class StarfallGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new StarfallGame(config);
};
