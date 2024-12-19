import 'phaser'
import { cardback } from '../../catalog/catalog'
import GameModel from '../../../../shared/state/gameModel'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'
import { Flags } from '../../settings/settings'

export default class DecksRegion extends Region {
  ourCallback: () => void
  theirCallback: () => void

  create(scene: BaseScene): DecksRegion {
    this.scene = scene

    this.container = scene.add.container(0, 150).setVisible(!Flags.mobile)

    return this
  }

  displayState(state: GameModel): void {
    this.deleteTemp()

    // Ours
    this.cards = []
    for (let i = 0; i < state.deck[0].length; i++) {
      let card = this.addCard(
        cardback,
        CardLocation.ourDeck(this.container, i),
      ).setOnClick(this.ourCallback)

      this.temp.push(card)
      this.cards.push(card)
    }

    // Theirs
    this.cards2 = []
    for (let i = 0; i < state.deck[1].length; i++) {
      let card = this.addCard(
        cardback,
        CardLocation.theirDeck(this.container, i),
      ).setOnClick(this.theirCallback)

      this.temp.push(card)
      this.cards2.push(card)
    }
  }

  setCallback(ourCallback: () => void, theirCallback: () => void): void {
    this.ourCallback = ourCallback

    this.theirCallback = theirCallback
  }
}
