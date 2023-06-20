import "phaser"
import Button from '../../lib/buttons/button'
import Icons from '../../lib/buttons/icons'
import ClientState from '../../lib/clientState'
import { Space, Depth, Flags } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'

// Y of the buttons
const y = Space.pad * 2 + Space.iconSize * 3/2

// During the round, shows Pass button, who has passed, and who has priority
export default class CommandsRegion extends Region {
	recapCallback: () => void
	skipCallback: () => void
	
	private btnRecap: Button
	private btnSkip: Button

	create (scene: BaseScene): CommandsRegion {
		this.scene = scene
		const x = Flags.mobile ? Space.pad + Space.iconSize/2 : Space.windowWidth - Space.pad - Space.iconSize/2,
		const y = Flags.mobile ? Space.windowHeight/2 : Space.pad*2 + Space.iconSize * 3/2
		this.container = scene.add.container(x, y)
		.setDepth(Depth.commands)

		// Add the background
		this.createRecap()
		this.createSkip()
		
		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.btnRecap.setVisible(!isRecap && state.maxMana[0] > 1)
		this.btnSkip.setVisible(isRecap)
	}

	private createRecap(): void {
		// Recap button
		this.btnRecap = new Icons.Recap(this.container, 0, 0)
		.setVisible(false)

		this.btnRecap.setOnClick(() => {this.recapCallback()})
	}

	private createSkip(): void {
		// Skip button
		this.btnSkip = new Icons.Skip(this.container, 0, 0)
		.setVisible(false)

		this.btnSkip.setOnClick(() => {this.skipCallback()})
	}
}