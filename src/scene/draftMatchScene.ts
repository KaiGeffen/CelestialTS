import "phaser"
import GameScene from "./gameScene"
import { StyleSettings, ColorSettings, Space, UserSettings, TutorialBBConfig } from "../settings"
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
	}

	// Display what the user sees when they win or lose
	displayWinLose(state: ClientState): void {
		let menu
		if (state.winner !== null) {
			menu = new Menu(
		      this,
		      Space.windowWidth/2,
		      Space.windowHeight/2,
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
		if (state.winner === 0) {
			let iconWin = new Icon(this, menu, 0, 0, 'Victory!', this.exitScene())

			this.btnExit.setOnClick(this.exitScene())
		}
		else if (state.winner === 1) {
			let iconLose = new Icon(this, menu, 0, 0, 'Defeat!', this.exitScene())

			this.btnExit.setOnClick(this.exitScene())
		}
	}

  	exitScene(): () => void {
  		let that = this
  		return function() {
  			that.beforeExit()

  			that.scene.start("DraftBuilderScene")
  		}
  	}
}

