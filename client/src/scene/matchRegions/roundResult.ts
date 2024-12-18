import 'phaser'
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'
import GameModel from '../../../../shared/state/gameModel'
import { Color, Space, Style, Depth, Time } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'

// Shows the current scores of the night's performance
// As well as any buttons
export default class RoundResultRegion extends Region {
  roundResult: Phaser.GameObjects.Sprite

  create(scene: BaseScene): RoundResultRegion {
    this.scene = scene
    this.container = scene.add.container().setDepth(Depth.roundResult)

    // Image in the center saying if you won/lost/tied
    this.roundResult = scene.add
      .sprite(Space.windowWidth / 2, Space.windowHeight / 2, 'icon-RoundWin', 2)
      .setAlpha(0)
      .setInteractive()

    this.container.add(this.roundResult)

    return this
  }

  displayState(state: GameModel, isRecap: boolean): void {
    this.deleteTemp()

    // TODO
    // On the final state of the recap, animate the text of round results
    // if (isRecap && state.isRecapEnd()) {
    //   this.animateResult(state)
    // }
  }

  // Animate the results of this round
  // TODO Temporary, replace with crisper animation
  private animateResult(state: GameModel): void {
    let s
    if (state.recap.sums[0] > state.recap.sums[1]) {
      s = 'Win'
    } else if (state.recap.sums[0] < state.recap.sums[1]) {
      s = 'Lose'
    } else {
      s = 'Tie'
    }

    // Set what image displays
    const name = `icon-Round${s}`
    this.roundResult.setTexture(name, 0).play(name)

    // Tween it fading in and out
    this.scene.tweens.add({
      targets: this.roundResult,
      duration: 200,
      hold: 2000,
      ease: 'Sine.easeInOut',
      alpha: 1,
      yoyo: true,
      onStart: () => {
        this.roundResult.setAlpha(0)
      },
      onComplete: () => {
        this.roundResult.setAlpha(0)
      },
    })
  }
}
