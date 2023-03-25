import 'phaser'
import Button from './button'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import avatarNames from '../../lib/avatarNames'
import { Color, Time } from '../../settings/settings'


// Used when selected an avatar, when editing an avatar, and in a match
export default class AvatarButton extends Button {
	name: string

	constructor(within: Phaser.Scene | Phaser.GameObjects.Container | ContainerLite,
		x: number, y: number,
		name: string | number,
		f: () => void = function() {})
	{
		// If an id was given instead of a string, get the string
		if (typeof name === 'number') {
			name = avatarNames[name]
		}

		super(within, x, y, 
		{
			icon: {
				name: `avatar-${name}`,
				interactive: true,
			},
			callbacks: {
				click: () => {
					f()
					this.scene.sound.play(`voice-${this.name}`)
				}
			},
			muteClick: true,
		})

		this.name = name
	}

	setOnClick(f, once = false, overwrite = true): Button {
		let fWithSound = () => {
			f()
			this.scene.sound.play(`voice-${this.name}`)
		}

		return super.setOnClick(fWithSound, once, overwrite)
	}

	setQuality({num=undefined, emotive=false, emoting=undefined}): Button {
		if (num !== undefined) {
			this.name = avatarNames[num]
			this.setTexture(`avatar-${this.name}`)
		}

		if (emotive) {
			this.setEmotive()
		}

		if (emoting !== undefined) {
			// TODO Use emoting number
			this.doEmote()()
		}

		return this
	}

	// Override the default select so it doesn't grey the image
	select(): Button {
		this.icon.clearTint()

		this.selected = true
		
		return this
	}

	deselect(): Button {
		this.icon.setTint(Color.avatarDeselected)

		this.selected = false
		
		return this
	}

	timeout: NodeJS.Timeout
	// Set it so the avatar emotes briefly when clicked
	private setEmotive(): Button {
		this.onClick = this.doEmote()

		return this
	}

	private doEmote(number = 1): () => void {
		return () => {
			// Stop the timeout if it exists
			clearTimeout(this.timeout)
			
			this.icon.setFrame(number)

			// Keep track of this timeout
			this.timeout = setTimeout(() => {
				this.icon.setFrame(0)
			}, Time.emote)
		}
	}
}
