import "phaser"
import { keywords } from "../catalog/keywords"
import { Space, StyleSettings } from "../settings"
import { cardInfo } from "./cardImage"


export enum Status {
	Inspire,
	Inspired,
	Nourish,
	Starve,
}

export class StatusBar {
	scene: Phaser.Scene
	y: number

	// Whether this is user's status bar or opponent's
	isYou: boolean

	// The previous objects, deleted when setting a new status
	objs: Phaser.GameObjects.GameObject[]

	constructor(scene: Phaser.Scene, y: number, isYou: boolean) {
		this.scene = scene
    	this.y = y
    	this.isYou = isYou

    	this.objs = []
  	}

  	// Set all of this bar's status
  	setStatuses(statuses: Status[]): void {
  		// Remove all of the previous status objects
  		this.objs.forEach(obj => obj.destroy())
		this.objs = []

  		// Specific to 4 TODO
  		let amts = [0, 0, 0, 0]
  		let length = 4

  		statuses.forEach(function(status, index, array) {
  			amts[status]++
  			console.log('here')
  		})

  		// For each status which exists, add a hoverable text object with its amount
  		let x = Space.pad
  		for (var i = 0; i < length; i++) {
  			if (amts[i] > 0) {
  				let s = Status[i] + ' ' + amts[i]

  				// Make a hoverable text object
  				let yOrigin = this.isYou ? 1 : 0
  				
  				let txt = this.scene.add.text(x, this.y, s, StyleSettings.basic).setOrigin(0, yOrigin)
  				txt.setInteractive().on('pointerover', this.onHover(i, amts[i], txt))
  				txt.setInteractive().on('pointerout', this.onHoverExit)

  				// Adjust the x so the next text is to the right of this
  				x += txt.width + Space.pad

  				this.objs.push(txt)
  			}
  		}

  	}

  	private onHover(statusIndex: number, amt: number, obj: Phaser.GameObjects.GameObject): () => void {
  		let that = this

  		return function() {
  			cardInfo.setVisible(true)

  			// Get the string to be shown
  			let s = ''
  			keywords.forEach(function(keyword, i, array) {
  				if (keyword.key === Status[statusIndex]) {
  					s += keyword.text

  					// Replace each instance of X with amt
  					s = s.split(/\bX\b/).join(amt.toString())

  					// Replace 'you' with 'they' if isThem
  					if (!that.isYou) {
  						s = s.replace('you', 'they')
  					}
  				}
  			})

		    cardInfo.text = s
		    cardInfo.copyPosition(obj)
		  }
  	}

  	private onHoverExit(): void {
  		cardInfo.setVisible(false)
  	}
}
