import 'phaser'
import { Color, Space } from './settings'


const ROUNDING = Space.sliderWidth/2

export const Scroll: (scene: Phaser.Scene) => any =
(scene: Phaser.Scene) => {
	return {
		input: 'click',
		track: scene['rexUI'].add.roundRectangle(0, 0, Space.sliderWidth, 0, 0, Color.sliderTrack),
		thumb: scene.add.image(0, 0, 'icon-Thumb'),
	}
}