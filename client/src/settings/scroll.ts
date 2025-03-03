import 'phaser'
import { Color, Space } from './settings'
import BaseScene from '../scene/baseScene'

const ROUNDING = Space.sliderWidth / 2

export const Scroll: (scene: BaseScene) => any = (scene: BaseScene) => {
  return {
    input: 'click',
    track: scene.rexUI.add.roundRectangle(
      0,
      0,
      Space.sliderWidth,
      0,
      0,
      Color.sliderTrack,
    ),
    thumb: scene.add.image(0, 0, 'icon-Thumb'),
  }
}
