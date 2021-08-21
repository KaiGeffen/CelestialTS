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

	// The previous objects, deleted when setting a new status
	objs: Phaser.GameObjects.GameObject[]

	constructor(scene: Phaser.Scene, y: number) {
		this.scene = scene
    	this.y = y
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
  				let txt = this.scene.add.text(x, this.y, s, StyleSettings.basic).setOrigin(0)
  				txt.setInteractive().on('pointerover', this.onHover(i, amts[i], txt))
  				// txt.setInteractive().on('pointerout', this.onHoverExit(i))

  				x += txt.width + Space.pad

  				this.objs.push(txt)
  			}
  		}

  	}

  	private onHover(statusIndex: number, amt: number, obj: Phaser.GameObjects.GameObject): () => void {
  		return function() {
  			cardInfo.setVisible(true)

  			// Get the string to be shown
  			let s = ''
  			keywords.forEach(function(keyword, i, array) {
  				if (keyword.key === Status[statusIndex]) {
  					s += keyword.text
  				}
  			})

		    cardInfo.text = s
		    cardInfo.copyPosition(obj)
		  }
  	}
}


	    // // this.txtStatus = this.add.text(Space.pad,
	    // // 	650 - Space.cardSize - Space.pad * 2,
	    // // 	'', StyleSettings.basic).setOrigin(0, 1)
	    // this.txtOpponentStatus = this.add.text(Space.pad,
	    // 	Space.cardSize + Space.pad * 2,
	    // 	'', StyleSettings.basic).setOrigin(0, 0)