import 'phaser';
import MenuScene from '../menuScene';
import Menu from './menu';


// A message to the user
const width = 500

export default class ConfirmMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		this.createHeader('Foooo')

		const s = params.s
		this.createText(s)

		this.layout()
	}
}
