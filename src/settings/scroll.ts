import 'phaser'
import { Color, Space } from './settings'


export const Scroll: (scene: Phaser.Scene) => any =
(scene: Phaser.Scene) => {
	return {
		input: 'click',
		track: scene['rexUI'].add.roundRectangle(0, 0, Space.scrollWidth, 0, 5, Color.sliderTrack),
		thumb: scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.scrollWidth/2, Color.sliderThumb),
	}
}