import 'phaser'
import Button from '../../lib/buttons/button'
import Icons from '../../lib/buttons/icons'
import GameModel from '../../../../shared/state/gameModel'
import {
  Style,
  Color,
  Space,
  Time,
  Ease,
  Flags,
  UserSettings,
} from '../../settings/settings'
import { GameScene } from '../gameScene'
import Region from './baseRegion'
import { MechanicsSettings } from '../../../../shared/settings'

// During the round, shows Pass button, who has passed, and who has priority
export default class PassRegion extends Region {
  callback: () => void
  recapCallback: () => void

  // The callback once the winner has been declared
  showResultsCallback: () => void

  hotkeysRegistered = false

  btnPass: Button
  btnMoon: Button

  txtYouPassed: Phaser.GameObjects.Text
  txtTheyPassed: Phaser.GameObjects.Text

  create(scene: GameScene): PassRegion {
    this.scene = scene
    this.container = scene.add.container(
      Space.windowWidth,
      Space.windowHeight / 2,
    )

    // Pass and recap button
    this.createButtons()

    // Text for who has passed
    this.createText()

    return this
  }

  displayState(state: GameModel): void {
    this.deleteTemp()

    // Before mulligan is complete, hide this region
    if (state.mulligansComplete.includes(false)) {
      this.container.setVisible(false)
      return
    } else if (!this.hotkeysRegistered) {
      this.addHotkeys()
      this.hotkeysRegistered = true
    }
    this.container.setVisible(true)

    // Display the current score totals
    const s = `${state.score[1]}\n\n${state.score[0]}`
    this.btnMoon.setText(s)

    // Rotate to the right day/night
    this.showDayNight(state.isRecap)

    // Show who has passed
    if (state.passes === 2) {
      this.animatePass(this.txtYouPassed, true)
      this.animatePass(this.txtTheyPassed, true)
    } else if (state.passes === 1) {
      // My turn, so they passed
      if (state.priority === 0) {
        this.animatePass(this.txtYouPassed, false)
        this.animatePass(this.txtTheyPassed, true)
      }
      // Their turn, so I passed
      else {
        this.animatePass(this.txtYouPassed, true)
        this.animatePass(this.txtTheyPassed, false)
      }
    } else {
      this.animatePass(this.txtYouPassed, false)
      this.animatePass(this.txtTheyPassed, false)
    }

    // Enable/disable button based on who has priority
    if (state.winner !== null) {
      // Once the game is over, change the callback to instead show results of match
      this.btnPass
        .enable()
        .setText('EXIT')
        .setOnClick(() => {
          this.showResultsCallback()
        })
    } else if (state.priority === 0 && !state.isRecap) {
      // Under the special condition where:
      // Max breath reached, can play card, start of round
      // The player is not allowed to pass
      const canPlay = state.cardCosts.some((cost) => cost <= state.breath[0])
      if (
        state.maxBreath[0] === MechanicsSettings.BREATH_CAP &&
        canPlay &&
        state.story.acts.length === 0
      ) {
        this.btnPass
          .setOnClick(() => {
            const s = "You can't pass to start the 10th or later round."
            this.scene.signalError(s)
          })
          .enable()
      }
      // Otherwise, allow them to pass as normal
      else {
        this.btnPass.enable().setOnClick(() => {
          this.callback()
        }, true)
      }
    } else {
      this.btnPass.disable()
    }

    // Disable moon during day
    if (state.isRecap) {
      this.btnMoon.enable()
    } else {
      this.btnMoon.disable()
    }
  }

  // Set the callback for when user hits the Pass button
  setCallback(callback: () => void): void {
    this.callback = callback
  }

  setShowResultsCallback(callback: () => void): void {
    this.showResultsCallback = callback
  }

  private addHotkeys() {
    this.scene.input.keyboard.removeListener('keydown-SPACE')
    this.scene.input.keyboard.on('keydown-SPACE', () => {
      if (this.btnPass.enabled && UserSettings._get('hotkeys')) {
        this.btnPass.onClick()
      }
    })
  }

  private createButtons(): void {
    let that = this

    const x = Flags.mobile ? 100 : 156
    this.btnPass = new Icons.Pass(this.container, -x, 0)
    this.btnMoon = new Icons.Moon(this.container, x, 0, () => {
      if (this.scene['paused']) {
        this.scene['paused'] = false
        this.btnMoon.setText(
          this.btnMoon.txt.text.replace('\nPaused\n', '\n\n'),
        )
      } else {
        this.scene['paused'] = true
        this.btnMoon.setText(
          this.btnMoon.txt.text.replace('\n\n', '\nPaused\n'),
        )
      }
    })
  }

  private createText(): void {
    this.txtYouPassed = this.scene.add
      .text(-150, 120, 'You Passed', Style.basic)
      .setOrigin(0.5)

    this.txtTheyPassed = this.scene.add
      .text(-150, -120, 'They Passed', Style.basic)
      .setOrigin(0.5)

    this.container.add([this.txtYouPassed, this.txtTheyPassed])
  }

  // Animate the given object saying that the player has/not passed
  // NOTE This causes a pause on every state change even if alpha is 0 > 0
  private animatePass(txt: Phaser.GameObjects.Text, hasPassed: boolean): void {
    this.scene.tweens.add({
      targets: txt,
      alpha: hasPassed ? 1 : 0,
      duration: Time.recapTween(),

      onComplete: function (tween, targets, _) {
        txt.setAlpha(hasPassed ? 1 : 0)
      },
    })
  }

  // Animate the sun / moon being visible when it's day or night
  private showDayNight(isRecap: boolean) {
    let target = this.container

    // If day and sun not centered
    if (!isRecap && target.rotation !== 0) {
      this.scene.tweens.add({
        targets: target,
        rotation: 0,
        ease: Ease.basic,
      })
    }
    // If night and moon not centered
    else if (
      isRecap &&
      target.rotation !== Math.PI &&
      target.rotation !== -Math.PI
    ) {
      this.scene.tweens.add({
        targets: target,
        rotation: Math.PI,
        ease: Ease.basic,
      })
    }
  }

  // For tutorial, disable the option to pass, but still show the sun
  // private oldCallback: () => void
  disablePass(): void {
    // this.btnPass.setAlpha(0)
    this.btnPass.setText('').disable()['tutorialSimplifiedPass'] = true

    // Enable it, with simplified uses
    this.btnPass.enable()
  }

  enablePass(): void {
    this.btnPass['tutorialSimplifiedPass'] = false
    this.btnPass.enable()
  }
}
