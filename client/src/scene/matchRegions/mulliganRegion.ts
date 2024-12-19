import 'phaser'
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js'

import Region from './baseRegion'
import CardLocation from './cardLocation'

import { Space, Color, Time, Style, Depth } from '../../settings/settings'
import Buttons from '../../lib/buttons/buttons'

import { CardImage } from '../../lib/cardImage'
import Card from '../../lib/card'
import { cardback } from '../../catalog/catalog'
import GameModel from '../../../../shared/state/gameModel'
import { Animation, Zone } from '../../../../shared/animation'
import BaseScene from '../baseScene'

export default class MulliganRegion extends Region {
  // The cards in our starting hand
  cards: CardImage[] = []

  // The player's keep/not keep choices for each card in their hand
  mulliganChoices = [false, false, false]

  // The callback for when the button is clicked
  onButtonClick: () => void

  create(scene: BaseScene): MulliganRegion {
    this.scene = scene

    this.cards = []
    this.mulliganChoices = [false, false, false]

    this.container = scene.add.container(0, 0).setDepth(Depth.mulligan)

    // Add the background
    this.container.add(this.createBackground(scene))

    let txtHint = scene.add
      .text(
        Space.windowWidth / 2,
        Space.windowHeight / 2 - Space.cardHeight / 2 - Space.pad / 2,
        'Click cards to replace',
        Style.basic,
      )
      .setOrigin(0.5, 1)
    let txtTitle = scene.add
      .text(
        Space.windowWidth / 2,
        txtHint.y - Space.pad / 2 - txtHint.height,
        'Starting Hand',
        Style.announcement,
      )
      .setOrigin(0.5, 1)

    let btn = new Buttons.Basic(
      this.container,
      Space.windowWidth / 2,
      Space.windowHeight / 2 + Space.cardHeight / 2 + Space.pad * 3,
      'Ready',
    ).setOnClick(() => {
      this.onButtonClick()
    }, true)

    this.container.add([txtTitle, txtHint])

    return this
  }

  displayState(state: GameModel, isRecap: boolean): void {
    // If we are done with our mulligan, hide this
    if (state.mulligansComplete[0]) {
      this.hide()
      return
    }

    // Don't overwrite after the opponent has mulliganed
    if (state.mulligansComplete[1]) {
      return
    }

    this.show()

    for (let i = 0; i < state.hand[0].length; i++) {
      let card = this.addCard(
        state.hand[0][i],
        CardLocation.mulligan(this.container, i),
      )
        .setCost(state.hand[0][i].cost)
        .setOnClick(this.onCardClick(i))
        .setFocusOptions('Toggle')

      this.cards.push(card)
    }
  }

  setCallback(callback: () => void): void {
    this.onButtonClick = callback
  }

  // The callback for when a card is clicked on
  private onCardClick(i: number): () => void {
    let that = this

    return function () {
      that.scene.playSound('click')

      that.mulliganChoices[i] = !that.mulliganChoices[i]

      that.cards[i].toggleSelectedForMulligan()
    }
  }

  private createBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject {
    const points = `0 ${Space.handHeight} 30 0 230 0 230 ${Space.handHeight}`
    let background = new RoundRectangle(
      scene,
      Space.windowWidth / 2,
      Space.windowHeight / 2,
      3 * Space.cardWidth + 4 * Space.pad,
      Space.cardHeight + 2 * Space.pad + 200,
      Space.corner,
      Color.backgroundDark,
    ).setInteractive()

    // Add a border around the shape TODO Make a class for this to keep it dry
    let postFxPlugin = scene.plugins.get('rexOutlinePipeline')
    postFxPlugin['add'](background, {
      thickness: 1,
      outlineColor: Color.border,
    })

    return background
  }
}
