import "phaser"
import { cardback } from '../../catalog/catalog'
import { keywords } from "../../catalog/keywords"
import { Zone } from '../../lib/animation'
import { AvatarSmall, ButtonInspire, ButtonNourish } from '../../lib/buttons/backed'
import Button from '../../lib/buttons/button'
import { CardImage } from '../../lib/cardImage'
import ClientState from '../../lib/clientState'
import { Status } from '../../lib/status'
import { Color, Space, Style, Time, Depth } from '../../settings/settings'
import BaseScene from '../baseScene'
import Region from './baseRegion'
import CardLocation from './cardLocation'


export default class TheirHandRegion extends Region {	
	// Effect showing that they have priority
	priorityHighlight: Phaser.GameObjects.Video

	txtDeckCount: Phaser.GameObjects.Text
	txtDiscardCount: Phaser.GameObjects.Text

	btnInspire: ButtonInspire
	btnNourish: ButtonNourish

	// Avatar image
	avatar: AvatarSmall

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

		// TODO Font size as a part of a style
		const x = Space.windowWidth - 298
		this.txtDeckCount = scene.add.text(x, 35, '', Style.basic).setOrigin(0.5).setFontSize(20)
		this.txtDiscardCount = scene.add.text(x, 103, '', Style.basic).setOrigin(0.5).setFontSize(20)

		// Add each of these objects to container
		this.container.add([
			this.txtDeckCount,
			this.txtDiscardCount,
			])

		return this
	}

	displayState(state: ClientState, isRecap: boolean): void {
		this.deleteTemp()

		let that = this

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
		this.txtDeckCount.setText(`${state.opponentDeckSize}`)
		this.txtDiscardCount.setText(`${state.discard[1].length}`)
	}

	private createBackground(): void {
		let background = this.scene.add.image(Space.windowWidth, 0, 'icon-Top')
		.setOrigin(1, 0)

		this.container.add(background)
	}

	private createPriorityHighlight(): Phaser.GameObjects.Video {
		return this.scene.add.video(0, 0, 'priorityHighlight')
		.setOrigin(0)
		.play(true)
		.setAlpha(0)
	}

	private createAvatar(): AvatarSmall {
		// TODO Custom avatar
		let btn = new AvatarSmall(this.container, 21, 11, 'Jules')
		btn.setOrigin(0)

		return btn
	}

	private createStatusDisplay(): void {
		let x = 21 + Space.avatarSize - 10

		// Inspire
		let y = 11
		this.btnInspire = new ButtonInspire(this.container, x - 15, y)
		.setOrigin(0)
		.setVisible(false)
		this.btnInspire.setOnHover(...this.onHoverStatus('Inspired', this.btnInspire))

		// Nourish
		y += Space.avatarSize/2
		this.btnNourish = new ButtonNourish(this.container, x - 15, y)
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
}