import "phaser"

export default class Menu {
	title: string = ''
	contents: Phaser.GameObjects.GameObject[] = []

	constructor(scene: Phaser.Scene) {}

	// Function for what happens when menu closes
	onClose(): void {}
}
