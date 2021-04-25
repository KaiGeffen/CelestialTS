import "phaser"
import WelcomeScene from "./scene/welcomeScene"
import GameScene from "./scene/gameScene"
import BuilderScene from "./scene/builderScene"
import CreditsScene from "./scene/creditsScene"
import { TutorialScene1, TutorialScene2 } from "./scene/tutorialScene"
import { ColorSettings, Space } from "./settings"

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js';


const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: Space.windowWidth,
  height: Space.windowHeight,
  parent: "game",
  scene: [WelcomeScene, CreditsScene, GameScene, BuilderScene, TutorialScene1, TutorialScene2],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: ColorSettings.background,
  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: UIPlugin,
      mapping: 'rexUI'
    }],
    global: [{
      key: 'rexRoundRectanglePlugin',
      plugin: RoundRectanglePlugin,
      start: true
    }]
  }
}

export class CelestialGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
  }
}

window.onload = () => {
  var game = new CelestialGame(config)

  if (location.port === '4949') {
    game.sound.volume = 0
  } else {
    game.sound.volume = 0.4
  }
  
}
