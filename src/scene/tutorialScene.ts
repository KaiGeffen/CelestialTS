import "phaser";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import ClientState from "../lib/clientState";
import { AdventureGameScene } from './gameScene';
import data from '../catalog/tutorial.json'
import { Space, BBStyle } from '../settings/settings'
import Button from '../lib/buttons/button'
import Buttons from '../lib/buttons/buttons'
import { CardImage } from '../lib/cardImage'
import { getCard } from '../catalog/catalog'


export default class TutorialGameScene extends AdventureGameScene {
	// How far into the tutorial (How many lines of text you have seen)
	progress: number

	// The primary text object
	txt: RexUIPlugin.BBCodeText

	// Text button to continue the hint text
	btnNext: Button

	// A card that is being shown
	card: CardImage

	constructor (args = {key: 'TutorialGameScene', lastScene: 'AdventureScene'}) {
		super(args)
		this.progress = 0
	}

	create(): void {
		super.create()

		this.txt = this.rexUI.add.BBCodeText(
			Space.windowWidth/2,
			Space.windowHeight/2,
			'',
			BBStyle.basic)
		.setOrigin(0.5)
		.setDepth(40)

		// Next button for tutorial text
		this.btnNext = new Buttons.Basic(this, 0, 0, 'Next',
			() => {
				this.progress += 1
				this.displayHints1()
			})
	}

	// TODO Ensure that autopass is on
	// TODO Hide the counts for deck and discard pile
	// TODO When a winner is found, move on to the next stillframe of the tutorial
	protected displayState(state: ClientState, isRecap: boolean): boolean {
		let result = super.displayState(state, isRecap)

		if (!result) { return false }

		switch (this.params.missionID) {
			case 3:
			this.view.decks.hide()
			this.view.discardPiles.hide()
			this.view.pass.hide()
			this.view.commands.hide()
			
			this.displayHints1()
			break

			// case 6:
			// this.displayState2(state, isRecap)
			// break
			// case 9:
			// this.displayState3(state, isRecap)
			// break
		}

		this.progress += 1

		return result
	}

	// Display hints for the first tutorial
	private displayHints1(): void {
		const datum = data[this.progress]
		
		if (datum === undefined) {
			this.txt.setVisible(false)
			this.btnNext.setVisible(false)
			return
		}

		// Set the appropriate text and position
		let s = `[i]${datum.italic}[/i]${datum.italic !== '' ? '\n\n' : ''}[b]${datum.bold}[/b]`
		this.txt.setText(s)

		// Move next button just below the text
		const p = this.txt.getBottomCenter()
		this.btnNext.setPosition(p.x, p.y + Space.pad + Space.largeButtonHeight/2)

		// If this is the final hint before the player must do something, hide the button
		this.btnNext.setVisible(!datum.final)

		// Hide different elements on the screen based on progress
		switch (this.progress) {
			case 0:
			this.view.theirHand.hide()
			this.view.theirScore.hide()
			this.view.ourHand.hide()
			this.view.ourScore.hideAll()
			.showBackground()
			.showWins()
			break

			case 1:
			this.view.ourScore.showBreath()
			break

			case 2:
			this.addCard('Dove')
			break

			case 4:
			this.addCard('Dash')
			break

			case 5:
			this.addCard('Mercy')
			break

			case 6:
			this.card.destroy()
			this.view.ourHand.show()
			['hideStacks']()
			break

			case 7:
			this.view.theirHand.show()
			['hideStacks']()
			break

		}


	}

	// Add a card that is a part of an explanation
	private addCard(name: string): void {
		if (this.card !== undefined) {
			this.card.destroy()
		}

		// Card that is being explained

		const x = this.txt.getLeftCenter().x/2
		const y = Space.windowHeight/2
		this.card = new CardImage(getCard(name), this.add.container(x, y))
	}



	// 	// Display hints based on what round it is (TODO this in json)
	// 	switch(state.versionNumber) {
	// 		case 0:
	// 			this.view.ourHand.focus("This is your hand. Each card costs some amount of breath to play (Top number) and gives you an amount of points when it resolves (Bottom number).\nCards are played to the story that we build together, and at night that story resolves, granting whoever contributed more points the win.\nWhen a player gets to 5 wins, that player wins the game.")
	// 			// this.view.ourHand.focus("Spend breath to play cards from your hand to the story.\nOnce we're both done, night falls and the story is performed.")
	// 			break
	// 		case 2:
	// 			this.view.ourHand.focus("This round we each played a Dove, which is worth 1 point. So the first night is a tie and neither player earns a win.")
	// 			break
	// 		case 4:
	// 			this.view.ourHand.focus("A new day begins, we each have 1 more breath than yesterday.\nThis time you have enough to play Dash.")
	// 			break
	// 	}
	// }
	// 	switch (this.params.missionID) {
	// 		case 3:
				
	// 			// TODO
	// 			break
	// 		case 6:
	// 			this.view.decks.hide()
	// 			this.view.discardPiles.hide()

	// 			if (isRecap || state.maxMana[0] === 1 || (state.maxMana[0] === 2 && state.isRoundStart())) {
	// 				// Can't pass on the first round or before playing a card on round 2
	// 				this.view.pass.hide()
	// 			}

	// 			// Display hints based on what round it is (TODO this in json)
	// 			let hints = {
	// 				1: "Playing a card with Inspire will give you extra Breath next round.",
	// 				2: "Extra breath won't help you next round. It's better to save Stars for a better time.",
	// 				3: "Getting extra Breath is great, but the 1 point from Dove can't possibly win you this round...",
	// 				4: "Uprising is worth 1 more point for every card before it. Try to play it as late as possible.",
	// 				5: "You're a natural! Just 1 more win and I'll let you pass.",
	// 			}
				
	// 			const hint = isRecap ? undefined : hints[state.maxMana[0]]
	// 			if (hint !== undefined && state.isRoundStart() && !isRecap) {
	// 				this.view.ourHand.focus(hints[state.maxMana[0]])
	// 			}
				
	// 			break
	// 		case 9:
	// 			// TODO
	// 	}
		
	// 	return result
	// }
}
