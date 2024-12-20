import 'phaser'
import { Keywords } from '../../../shared/state/keyword'
import { Space, Style } from '../settings/settings'

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
  objs: Phaser.GameObjects.Text[]

  constructor(scene: Phaser.Scene, y: number, isYou: boolean) {
    this.scene = scene
    this.y = y
    this.isYou = isYou

    this.objs = []
  }

  // Set all of this bar's status, return true if the points is over one of them
  setStatuses(statuses: Status[]): boolean {
    // Remember if the pointer is over any of the text objects
    let pointerIsOver = false

    // Remove all of the previous status objects
    this.objs.forEach((obj) => obj.destroy())
    this.objs = []

    // Specific to 4 TODO
    let amts = [0, 0, 0, 0]
    let length = 4

    statuses.forEach(function (status, index, array) {
      amts[status]++
    })

    // For each status which exists, add a hoverable text object with its amount
    let pointer = this.scene.game.input.activePointer
    let x = Space.pad
    for (var i = 0; i < length; i++) {
      if (amts[i] > 0) {
        let s = Status[i] + ' ' + amts[i]

        // Make a hoverable text object
        let yOrigin = this.isYou ? 1 : 0

        let txt = this.scene.add
          .text(x, this.y, s, Style.basic)
          .setOrigin(0.5, yOrigin)
        // Move object over (0.5 centered X origin for scaling animation purposes)
        txt.x += (txt.width * 1.5) / 2

        txt.setInteractive().on('pointerover', this.onHover(i, amts[i], txt))
        txt.setInteractive().on('pointerout', this.onHoverExit)

        // Emit onHover if pointer is over it currently
        if (
          txt.x - txt.width / 2 <= pointer.x &&
          pointer.x <= txt.x + txt.width / 2
        ) {
          let bottom = this.isYou ? txt.y - txt.height : txt.y
          let top = this.isYou ? txt.y : txt.y - txt.height
          if (bottom <= pointer.y && pointer.y <= top) {
            txt.emit('pointerover')
            pointerIsOver = true
          }
        }

        // Adjust the x so the next text is to the right of this
        x += txt.width * 1.5 + Space.pad

        // Add this object in the correct spot based off the Status enum
        this.objs[i] = txt
      }
    }

    return pointerIsOver
  }

  // Get the text object associated with the given status
  get(status: Status): Phaser.GameObjects.Text {
    let obj = this.objs[Status[status]]

    return obj
  }

  private onHover(
    statusIndex: number,
    amt: number,
    obj: Phaser.GameObjects.Text,
  ): () => void {
    let that = this

    return function () {
      // Get the string to be shown
      let s = ''
      Keywords.getAll().forEach(function (keyword, i, array) {
        if (keyword.name === Status[statusIndex]) {
          s += keyword.text

          // Replace each instance of X with amt
          s = s.split(/\bX\b/).join(amt.toString())

          // Replace 'you' with 'they' if isThem
          if (!that.isYou) {
            s = s.replace('you', 'they')
          }
        }
      })

      let x = obj.x - obj.width / 2
      // If it's you, it's above, them it's below
      let y
      if (that.isYou) {
        y = obj.y - obj.height / 2 - Space.pad
      } else {
      }
    }
  }

  private onHoverExit(): void {}
}
