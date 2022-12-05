import "phaser"
import { cardback } from '../../catalog/catalog'
import { keywords } from "../../catalog/keywords"
import Button from '../../lib/buttons/button'
import Buttons from '../../lib/buttons/buttons'
import ClientState from '../../lib/clientState'
import { Depth, Space, Style, Time } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


export default class TheirHandRegion extends Region {	
	// Effect showing that they have priority
	priorityHighlight: Phaser.GameObjects.Video

	btnDeck: Button
	btnDiscard: Button

	btnInspire: Button
	btnNourish: Button

	// Avatar image
	avatar: Button

	create (scene: BaseScene): TheirHandRegion {
		this.scene = scene

		// Avatar, status, hand, recap, pass buttons
		this.container = scene.add.container(0, 0).setDepth(Depth.theirHand)
		this.createBackground()
		
		// Highlight visible when they have priority
		this.priorityHighlight = this.createPriorityHighlight()
		.setVisible(false)
		this.container.add(this.priorityHighlight)

		// Create the status visuals
		this.createStatusDisplay()

		// Create our avatar
		this.avatar = this.createAvatar()

		// Create stack buttons
		const x = Space.windowWidth - 300
		this.btnDeck = new Buttons.Stacks.Deck(this.container, x, Space.handHeight * 1/4, 1)
		this.btnDiscard = new Buttons.Stacks.Discard(this.container, x, Space.handHeight * 3/4, 1)

		let avatarBorder = scene.add.image(0, -12 + 177 - 7, 'icon-BottomAvatar')
		.setOrigin(0)
		.setScale(1, -1)

		// Add each of these objects to container
		this.container.add(avatarBorder)

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		// Avatar
		this.avatar.setQuality(state.avatars[1])

		// Statuses
		this.displayStatuses(state)

		this.cards = []
		for (let i = 0; i < state.opponentHandSize; i++) {
			let card = this.addCard(cardback, CardLocation.theirHand(state, i, this.container))
			.moveToTopOnHover()

			this.cards.push(card)
			this.temp.push(card)
		}

		// Pile sizes
		this.btnDeck.setText(`${state.opponentDeckSize}`)
		this.btnDiscard.setText(`${state.discard[1].length}`)
	}

	private createBackground(): void {
		let background = this.scene.add.image(Space.windowWidth, 0, 'icon-Top')
		.setOrigin(1, 0)
		.setInteractive()

		this.container.add(background)
	}

	private createPriorityHighlight(): Phaser.GameObjects.Video {
		return this.scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)
		.setAlpha(0)
	}

	private createAvatar(): Button {
		let btn = new Buttons.Avatar(this.container, 21, 5, 'Jules')
		btn.setOrigin(0)

		return btn
	}

	private createStatusDisplay(): void {
		let x = 21 + Space.avatarSize - 10

		// Inspire
		let y = 5
		this.btnInspire = new Buttons.Keywords.Inspire(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
		this.btnInspire.setOnHover(...this.onHoverStatus('Inspired', this.btnInspire))

		// Nourish
		y += Space.avatarSize/2
		this.btnNourish = new Buttons.Keywords.Nourish(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
		this.btnNourish.setOnHover(...this.onHoverStatus('Nourish', this.btnNourish))
	}

	private onHoverStatus(status: string, btn: Button): [() => void, () => void] {
		let that = this
		let keyword = keywords.find((value) => {
			return value.key === status
		})

		let onHover = () => {
			let s = keyword.text

			// Remove the first X (In image data)
			s = s.replace(' X', '')

			// Get the value from the given status button
			s = s.split(/\bX\b/).join(btn.getText())
			s = s.replace('you', 'they')
			
			// Hint shows status text
			that.scene.hint.showText(s)
		}

		let onExit = () => {
			that.scene.hint.hide()
		}

		return [onHover, onExit]
	}

	// Animate them getting or losing priority
	private animatePriority(state: ClientState, isRecap: boolean): void {
		const targetAlpha = state.priority === 1 && !isRecap ? 1 : 0

		this.scene.tweens.add({
			targets: this.priorityHighlight,
			alpha: targetAlpha,
			duration: Time.recapTweenWithPause()
		})
	}

	private displayStatuses(state: ClientState): void {
		// Specific to 4 TODO
		let amts = [0, 0, 0, 0]
		const length = 4

		state.opponentStatus.forEach(function(status, index, array) {
			amts[status]++
		})

		const amtInspire = amts[1]
		const amtNourish = amts[2] - amts[3]

		this.btnInspire.setVisible(amtInspire !== 0)
		.setText(`${amtInspire}`)

		this.btnNourish.setVisible(amtNourish !== 0)
		.setText(`${amtNourish}`)
	}

	// TUTORIAL FUNCTIONALITY
	hideStacks(): Region {
		this.btnDeck.setVisible(false)
		this.btnDiscard.setVisible(false)

		return this
	}
}