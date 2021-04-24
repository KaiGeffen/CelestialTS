import "phaser"
import WelcomeScene from "./scene/welcomeScene"
import GameScene from "./scene/gameScene"
import BuilderScene from "./scene/builderScene"
import CreditsScene from "./scene/creditsScene"
import { TutorialScene1, TutorialScene2 } from "./scene/tutorialScene"
import { ColorSettings, Space } from "./settings"



const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: Space.windowWidth,
  height: Space.windowHeight,
  parent: "game",
  scene: [WelcomeScene, CreditsScene, GameScene, BuilderScene, TutorialScene1, TutorialScene2],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: ColorSettings.background
}

export class CelestialGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
  }
}

window.onload = () => {
  var game = new CelestialGame(config)
}
