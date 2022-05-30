import "phaser"
import { cardback } from "../catalog/catalog"
import { Color, Style, BBStyle, Time, Space } from "../settings/settings"
import Card from './card'
import { allCards } from "../catalog/catalog"
import { StatusBar } from "../lib/status"

export var cardInfo: any // BBCodeText

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add['rexBBCodeText'](0, 0, '', BBStyle.cardText).setOrigin(0, 1).setAlpha(0)

  // TODO Do this somewhere else
  // Add image render information
  allCards.forEach( (card) => {
    cardInfo.addImage(card.name, {
      key: card.name,
      width: Space.cardWidth,
      height: Space.cardHeight,
      // y: -17 // Bottom of card is on line with the text
    })
  })

  cardInfo.setVisible(false)

  return cardInfo
}

// TODO Bad smell, it's reccomended not to use containers so much
// Make card info reflect whatever card it is currently hovering
export function refreshCardInfo() {
  let scene: Phaser.Scene = cardInfo.scene

  let allContainers = scene.children.getAll().filter(e => e.type === 'Container' && e['visible'])

  let showText = false

  let pointer = scene.game.input.activePointer

  if (pointer.active) {
    allContainers.forEach(function (container: Phaser.GameObjects.Container) {
      container.list.forEach(function (obj) {
        if (obj.type === 'Container') {
          let cont2 = obj as Phaser.GameObjects.Container
          cont2.list.forEach(function (obj2) {
            if (obj2.type === 'Image') {
              let sprite = obj2 as Phaser.GameObjects.Image
              
              if (sprite.getBounds().contains(pointer.x, pointer.y)) {
                // Show text only if the sprite has a pointerover listener
                if (sprite.emit('pointerover')) {
                  showText = true
                }
              }
              else {
                sprite.emit('pointerout')
              }
            }
          })
          
        }
      })
    })
  }

  // Card info should only become visible is something is hovered over
  cardInfo.setVisible(showText)
}

export class CardImage {
  card: Card
  image: Phaser.GameObjects.Image

  scene: Phaser.Scene

  txtCost: Phaser.GameObjects.Text
  txtPoints: Phaser.GameObjects.Text

  // Whether the current card is required in this context (Must be in the deck)
  required = false

  unplayable: boolean = false
  // A container just for this cardImage / objects related to it
  container: Phaser.GameObjects.Container

  // The index of this container within its parent container before it was brought to top
  renderIndex: number = undefined

  constructor(card: Card, container: any, interactive: Boolean = true) {
    this.init(card, container, interactive)
  }

  init(card: Card, outerContainer: any, interactive: Boolean) {
    this.card = card

    let scene: Phaser.Scene = outerContainer.scene
    this.scene = scene

    // Card image
    this.image = scene.add.image(0, 0, card.name)
    this.image.setDisplaySize(Space.cardWidth, Space.cardHeight)

    // Stat text
    this.txtCost = this.scene.add['rexBBCodeText'](
      -Space.cardWidth/2 + 25,
      -Space.cardHeight/2 + 25,
      '',
      BBStyle.cardStats)
    .setOrigin(0.5)
    .setAlpha(0)

    this.txtPoints = this.scene.add['rexBBCodeText'](
      -Space.cardWidth/2 + 25,
      -Space.cardHeight/2 + 77,
      '',
      BBStyle.cardStats)
    .setOrigin(0.5)
    this.setPoints(card.points)

    // This container
    this.container = scene.add.container(0, 0)
    this.container.add([this.image, this.txtCost, this.txtPoints])
    outerContainer.add(this.container)

    if (interactive) {
      this.image.setInteractive();
      this.image.on('pointerover', this.onHover(), this);
      this.image.on('pointerout', this.onHoverExit(), this);

      // If the mouse moves outside of the game, exit the hover also
      this.scene.input.on('gameout', this.onHoverExit(), this)
    }

    // Hint any keywords that are in the card
    this.hintKeywords()
  }

  destroy(): void {
    this.image.destroy()
    this.container.destroy()
  }

  show(): CardImage {
    this.container.setVisible(true)

    return this
  }

  hide(): CardImage {
    this.container.setVisible(false)

    return this
  }

  dissolve(): void {
    let scene = this.scene

    let copyImage = scene.add.image(0, 0, this.image.texture)
    this.container.add(copyImage)
    this.container.sendToBack(copyImage)

    // Add pipeline for dissolve effect
    let postFxPlugin = scene.plugins.get('rexDissolvePipeline')
    let dissolvePipeline = postFxPlugin['add'](copyImage, {
      noiseX: 100,
      noiseY: 100
    })

    // this.dissolvePipeline.setProgress(1)
    scene.tweens.add({
      targets: dissolvePipeline,
      progress: 1,
      ease: 'Quad',
      duration: Time.recapStateMinimum,
      onComplete: function(tween, targets, params) {
        copyImage.destroy()
      }
    })
  }

  // Set the callback to fire when this card's image is clicked
  setOnClick(f: () => void, removeListeners = false): CardImage {
    if (removeListeners) {
      this.removeOnClick()
    }

    this.image.on('pointerdown', f)

    return this
  }

  // Remove all callbacks that fire when this card's image is clicked
  removeOnClick(): void {
    this.image.removeAllListeners('pointerdown')
  }

  // Set the callback to fire when this card's image is hovered, and one for when exited
  setOnHover(fHover: () => void, fExit: () => void): CardImage {
    this.image.on('pointerover', fHover)
    this.image.on('pointerout', fExit)

    return this
  }

  // Set whether this card is playable
  setPlayable(isPlayable: Boolean): void {
    this.unplayable = !isPlayable

    if (isPlayable) {
      this.image.clearTint()
    }
    else {
      this.image.setTint(Color.cardUnplayable)
    }
  }

  // Set whether this card is described or not
  setDescribable(isDescribable: Boolean): void {
    if (!isDescribable) {
      this.image.removeInteractive()
    }
    else{
      // TODO Enable if isDescribable is true
      throw 'setDescribable(true) is not implemented for cardImage'
    }
  }

  setTransparent(value: Boolean): CardImage {
    if (value) {
      this.container.setAlpha(0.2)
    }
    else {
      this.container.setAlpha(1)
    }

    return this
  }

  setPosition(position: [number, number]): CardImage {
    this.container.setPosition(position[0], position[1])

    return this
  }

  // Set the displayed cost of this card, don't change the cost if cost is null
  setCost(cost: number): CardImage {
    if (cost !== null) {
      if (cost === this.card.cost) {
        this.txtCost.setAlpha(0)
      }
      else {
        this.txtCost.setAlpha(1)
      }

      this.txtCost.setText(`[stroke=${Color.cardCostReduced}]${cost}[/stroke]`)
    }

    return this
  }

  // Set the displayed point value of the card, or hide it if it's equal to the default value
  setPoints(amt: number): CardImage {
    // If this is the default of the card, don't display any custom point value
    if(this.card.dynamicText === '') {
      this.txtPoints.setAlpha(0)
    }

    // TODO Change color name
    this.txtPoints.setText(`[stroke=${Color.cardCostReduced}]${amt}[/stroke]`)

    return this
  }

  // Remove the highlight from this card
  removeHighlight(): () => void {
    let that = this

    return function() {
      that.scene.plugins.get('rexOutlinePipeline')['remove'](that.image)
    }
  }

  // Set that this card is required and can't be removed from the deck
  setRequired(): void {
    this.image.setTint(Color.cardUnplayable)
    this.required = true
  }

  private hintKeywords(): void {
    let that = this

    // TODO Care about locations
    let hint = that.image.scene['hint']
    this.setOnHover(
      () => {
        hint.showText(that.card.getHintText())
      },
      () => {
        hint.hide()
      }
      )
  }

  private onHover(): () => void {
    let that = this

    function doHighlight() {
      var postFxPlugin = that.scene.plugins.get('rexOutlinePipeline')

      postFxPlugin['remove'](that.image)
      postFxPlugin['add'](that.image,
        {thickness: Space.highlightWidth,
          outlineColor: Color.cardHighlight})
    }

    return function() {
      // cardInfo.setVisible(true)

      if (!that.unplayable) {
        that.scene.sound.play('hover')
        doHighlight()
      }

      // cardInfo.text = that.card.getCardText()

      // // TODO Adjust for extra container
      // // Copy the position of the card in its local space
      // let outerContainer = that.container.parentContainer

      // // Adj
      // let x = that.image.x + that.container.x + outerContainer.x + Space.cardSize/2 + Space.highlightWidth * 2
      // let y = that.image.y + that.container.y + outerContainer.y + Space.cardSize/2

      // // Change alignment of text based on horizontal position on screen
      // if (x + cardInfo.width > Space.windowWidth) // Going off right side
      // {
        //   // Try it on the left side
        //   x -= Space.cardSize + Space.highlightWidth*4 + cardInfo.width

        //   // If it's now going of the left side, instead put it as far right as possible
        //   if (x < 0) {
          //     x = Space.windowWidth - cardInfo.width
          //   }
          // }

          // // Adjust y
          // if (y - cardInfo.height < 0) // Going over the top
          // {
            //   y = cardInfo.height
            // }
            // else if (y > Space.windowHeight) {
              //   y = Space.windowHeight
              // }

              // cardInfo.setX(x)
              // cardInfo.setY(y)
            }
          }

          private onHoverExit(): () => void {
            let that = this
            return () => {
              that.removeHighlight()()
            }
          }

          // Move this cardImage above everything else in its container when it's hovered
          moveToTopOnHover(): CardImage {
            let container = this.container
            let parentContainer = container.parentContainer

            // Reverse the order of everything from this objects index on
            // This makes this appear above everything, and things to the right to be in reverse order
            this.image.on('pointerover', () => {
              // Remember the index that this was at
              this.renderIndex = parentContainer.getIndex(container)

              // From the top of the list until this cardImage, reverse the order
              for (let i = parentContainer.length - 1; i >= this.renderIndex; i--) {
                parentContainer.bringToTop(parentContainer.getAt(i))
              }
            }, this)

            this.image.on('pointerout', () => {
              // From INDEX to the top is reversed, flip it back
              for (let i = parentContainer.length - 1; i >= this.renderIndex; i--) {
                parentContainer.bringToTop(parentContainer.getAt(i))
              }
            }, this)

            return this
          }

          // Toggle whether this card appears as being set to mulligan or not
          icon: Phaser.GameObjects.Image
          toggleSelectedForMulligan(): CardImage {
            if (this.icon !== undefined) {
              this.icon.destroy()
              this.icon = undefined
            }
            else {
              this.icon = this.container.scene.add.image(0, 0, 'icon-XOut')
              this.container.add(this.icon)
            }

            return this
          }
        }
