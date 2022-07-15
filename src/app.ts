import "phaser"

import MenuScene from "./scene/menuScene"
import PreloadScene from "./scene/preloadScene"
import HomeScene from "./scene/homeScene"
import { StandardGameScene, AdventureGameScene, TutorialGameScene } from "./scene/gameScene"
import { BuilderScene, AdventureBuilderScene } from "./scene/builderScene"

import CreditsScene from "./scene/creditsScene"
import AdventureScene from "./scene/adventureScene"

import { Color, Space } from "./settings/settings"

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js'
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js'
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin.js'
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilterpipeline-plugin.js'
import DissolvePipelinePlugin from 'phaser3-rex-plugins/plugins/dissolvepipeline-plugin.js'
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js'
import DropShadowPipelinePlugin from 'phaser3-rex-plugins/plugins/dropshadowpipeline-plugin.js';
import ContainerLitePlugin from 'phaser3-rex-plugins/plugins/containerlite-plugin.js';
// import UIComponent from 'phaser3-rex-plugins/templates/ui/ui-components.js'


const config: Phaser.Types.Core.GameConfig = {
  title: "Celestial",
  width: Space.windowWidth,
  height: Space.windowHeight,
  parent: "game",
  disableContextMenu: true,
  powerPreference: 'high-performance',
  backgroundColor: Color.background,
  dom: {
    createContainer: true
  },
  scene: [PreloadScene, HomeScene,
  MenuScene,
  CreditsScene,
  StandardGameScene, AdventureGameScene, TutorialGameScene,
  AdventureBuilderScene,
  BuilderScene,
  AdventureScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
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
    {
      key: 'rexDropShadowPipeline',
      plugin: DropShadowPipelinePlugin,
      start: true
    },
    {
      key: 'rexContainerLitePlugin',
      plugin: ContainerLitePlugin,
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

    // TODO Move to its own file
    // Adjust window display whenever resized
    window.addEventListener('resize', () => {
      const width = Math.floor(window.innerWidth)
      const height = Math.floor(window.innerHeight)

      this.scale.resize(width, height)

      Space.windowWidth = width
      Space.windowHeight = height

      // Reload the active scene
      this.scene.scenes.forEach(scene => {
        if (this.scene.isActive(scene)) {
          // TODO Come up with a redraw method to adjust to the new dimensions
          // this.scene.start(scene)
        }
      })
    });
  }
}

window.onload = () => {
  var game = new CelestialGame(config)
}
