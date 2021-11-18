import "phaser"
import PreloadScene from "./scene/preloadScene"
import WelcomeScene from "./scene/welcomeScene"
import GameScene from "./scene/gameScene"
import { BuilderScene, TutorialBuilderScene, DraftBuilderScene } from "./scene/builderScene"

import CreditsScene from "./scene/creditsScene"
import StoreScene from "./scene/storeScene"
import ChoiceScene from "./scene/choiceScene"
import { AnubisCatalogScene, RobotsCatalogScene, StalkerCatalogScene, LordCatalogScene, BastetCatalogScene, HorusCatalogScene } from "./scene/catalogScene"
import { TutorialScene1, TutorialScene2 } from "./scene/tutorialScene"
import DraftMatchScene from "./scene/draftMatchScene"

import { Color, Space } from "./settings/settings"

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js'
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js'
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin.js'
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilterpipeline-plugin.js'
import DissolvePipelinePlugin from 'phaser3-rex-plugins/plugins/dissolvepipeline-plugin.js'
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js'
// import UIComponent from 'phaser3-rex-plugins/templates/ui/ui-components.js'


const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: Space.windowWidth,
  height: Space.windowHeight,
  parent: "game",
  transparent: true,
  dom: {
    createContainer: true
  },
  scene: [PreloadScene, WelcomeScene, CreditsScene, StoreScene,
  ChoiceScene,
  AnubisCatalogScene, RobotsCatalogScene, StalkerCatalogScene, LordCatalogScene, BastetCatalogScene, HorusCatalogScene,
  GameScene, DraftMatchScene,
  BuilderScene, TutorialBuilderScene, DraftBuilderScene,
  TutorialScene1, TutorialScene2],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: Color.background,
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
    },
    {
      key: 'rexInputTextPlugin',
      plugin: InputTextPlugin,
      start: true
    },
    {
      key: 'rexBBCodeTextPlugin',
      plugin: BBCodeTextPlugin,
      start: true
    },
    {
      key: 'rexGlowFilterPipeline',
      plugin: GlowFilterPipelinePlugin,
      start: true
    },
    {
      key: 'rexDissolvePipeline',
      plugin: DissolvePipelinePlugin,
      start: true
    },
    {
      key: 'rexOutlinePipeline',
      plugin: OutlinePipelinePlugin,
      start: true
    },
    ]
  }
}

export class CelestialGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)

    // Set the size of the movies in the background based on the window size
    let vMain = document.getElementById('v-main')
    let vRecap = document.getElementById('v-recap')

    vMain.setAttribute('width', window.innerWidth.toString())
    vMain.setAttribute('height', Space.windowHeight.toString())

    vRecap.setAttribute('width', window.innerWidth.toString())
    vRecap.setAttribute('height', Space.windowHeight.toString())
  }
}

window.onload = () => {
  var game = new CelestialGame(config)
}
