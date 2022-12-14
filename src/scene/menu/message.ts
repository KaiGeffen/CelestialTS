import 'phaser';
import MenuScene from '../menuScene';
import Menu from './menu';


// A message to the user
const width = 700

export default class ConfirmMenu extends Menu {
	constructor(scene: MenuScene, params) {
		super(scene, width)

		const title = params.title
		this.createHeader(title)

		const s = params.s
		this.createText(s)

		this.layout()
	}
}
