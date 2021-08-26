import "phaser"
import GameScene from "./gameScene"
import { StyleSettings, Space, UserSettings } from "../settings"
import ClientState from "../lib/clientState"
import Icon from "../lib/icon"
import Menu from "../lib/menu"


export default class DraftMatchScene extends GameScene {
	constructor() {
		super({
			key: "draftMatchScene"
		})
	}

	create(): void {
		super.create()

	    // Add a loss, remove one if they win so that user can't escape the loss with quitting
	    let newRecord = UserSettings._get('draftRecord')
	    newRecord[1] += 1
	    UserSettings._set('draftRecord', newRecord)
	}

	// Display what the user sees when they win or lose
	isWin
	displayWinLose(state: ClientState): void {
		let menu
		if (state.winner !== null) {
			menu = new Menu(
		      this,
		      300,
		      300,
		      true,
		      25)

			// Replace the pass button with an exit button
			this.btnPass.setVisible(false)
			this.btnExit.setVisible(true)
			// Remove the ordinary exit events
			this.btnExit.removeAllListeners('pointerdown')
		}

		let currentRecord = UserSettings._get('draftRecord')
		if (state.winner === 0) {
			let iconWin = new Icon(this, menu, 0, 0, 'Victory!', this.exitScene())

			this.isWin = true

			this.btnExit.setOnClick(this.exitScene())
		}
		else if (state.winner === 1) {
			let iconLose = new Icon(this, menu, 0, 0, 'Defeat!', this.exitScene())

			this.isWin = false

			this.btnExit.setOnClick(this.exitScene())
		}
	}

  	exitScene(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()

  			// Add a win and remove a loss, since a loss was preemptively added
  			if (that.isWin) {
  				let newRecord = UserSettings._get('draftRecord')
  				newRecord[0] += 1
  				newRecord[1] -= 1

  				UserSettings._set('draftRecord', newRecord)
  			}

  			that.scene.start("DraftBuilderScene")
  		}
  	}
}

