import 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { Style, BBStyle, Color, Time, UserSettings, Space } from '../settings/settings'
import Card from './card'


export default class Hint {
	txt

	constructor(scene) {
		this.txt = scene.rexUI.add.BBCodeText(Space.windowWidth/2, Space.windowHeight/2, 'Hello world', BBStyle.hint)
	    	.setOrigin(0.5)
	    	.setDepth(40)

	    // Create the event
	    let that = this
	    scene.input.on('pointermove', (pointer) => {
	    	this.txt.copyPosition(pointer.position)
	    })
		
	}

	hide(): Hint {
		this.txt.setVisible(0)

		return this
	}

	show(): Hint {
		this.txt.setVisible(1)

		return this
	}

	showCard(card: Card): void {
		this.show()

		// this.txt.addImage(card.name, {
		// 	key: card.name,
		// 	// width: Space.cardWidth,
		// 	// height: 4000,
		// })

		this.txt.setText(`[img=${card.name}]`)
		.setFixedSize(Space.cardWidth, Space.cardHeight)
	}

	create() {
		

	}

	update(time, delta) {
		console.log(delta)
	}
}