import "phaser"
import { cardback } from "../catalog/catalog"
import { ColorSettings, StyleSettings, UserSettings, BBConfig, CardStatsConfig, TimeSettings, Space } from "../settings"
import Card from './card'
import { allCards } from "../catalog/catalog"
import { StatusBar } from "../lib/status"


export var cardInfo: any // BBCodeText

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add['rexBBCodeText'](0, 0, '', BBConfig).setOrigin(0, 1)

  // Add image render information
  allCards.forEach( (card) => {
    cardInfo.addImage(card.name, {
      key: card.name,
      width: 50,
      height: 50,
      y: -17 // Bottom of card is on line with the text
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

  // Card info should only become visible is something is hovered over
  cardInfo.setVisible(showText)
}

export class CardImage {
  card: Card
  image: Phaser.GameObjects.Image
  txtStats: Phaser.GameObjects.Text

  unplayable: boolean = false
  // A container just for this cardImage / objects related to it
  container: Phaser.GameObjects.Container

  constructor(card: Card, container: any, interactive: Boolean = true) {
    this.init(card, container, interactive);
  }

  init(card: Card, outerContainer: any, interactive: Boolean, modifier: string = undefined) {
    this.card = card

    let scene: Phaser.Scene = outerContainer.scene
    // Card image
    this.image = scene.add.image(0, 0, card.name)
    // this.image.setDisplaySize(100, 100)

    // Stat text
    let sModifier = modifier === undefined ? '' : 'modifier\n'
    let s = `${sModifier}${card.cost}:${card.points}`
    
    this.txtStats = scene.add['rexBBCodeText'](-Space.cardSize/2, -Space.cardSize/2, s, CardStatsConfig).setOrigin(0)
    if (card === cardback) {
      this.txtStats.setAlpha(0)
    }

    // This container
    this.container = scene.add.container(0, 0)
    this.container.add([this.image, this.txtStats])
    outerContainer.add(this.container)

    if (interactive) {
      this.image.setInteractive();
      this.image.on('pointerover', this.onHover(), this);
      this.image.on('pointerout', this.onHoverExit(), this);

      // If the mouse moves outside of the game, exit the hover also
      this.image.scene.input.on('gameout', this.onHoverExit(), this)
    }
  }

  destroy(): void {
    this.image.destroy()
    this.txtStats.destroy()
    this.container.destroy()
  }

  show(): void {
    this.container.setVisible(true)
  }

  hide(): void {
    this.container.setVisible(false)
  }

  dissolve(): void {
    let scene = this.image.scene

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
        duration: TimeSettings.recapStateMinimum,
        onComplete: function(tween, targets, params) {
          copyImage.destroy()
        }
    })
  }

  // Set the callback to fire when this card's image is clicked
  setOnClick(f: () => void, removeListeners = false): void {
    if (removeListeners) {
      this.removeOnClick()
    }

    this.image.on('pointerdown', f)
  }

  // Remove all callbacks that fire when this card's image is clicked
  removeOnClick(): void {
    this.image.removeAllListeners('pointerdown')
  }

  // Set whether this card is playable
  setPlayable(isPlayable: Boolean): void {
    this.unplayable = !isPlayable

    if (isPlayable) {
      this.image.clearTint()
    }
    else {
      this.image.setTint(ColorSettings.cardUnplayable)
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
      this.image.setAlpha(0.2)
      this.txtStats.setAlpha(0.2)
    }
    else {
      this.image.setAlpha(1)
      this.txtStats.setAlpha(1)
    }

    return this
  }

  setPosition(position: [number, number]): void {
    this.container.setPosition(position[0], position[1])
  }

  // Set the displayed cost of this card, don't change the cost if cost is null
  setCost(cost: number): void {
    if (cost !== null) {
      // If the cost is reduced, change the color of cost
      let costTxt = cost < this.card.cost ? `[stroke=${ColorSettings.cardCostReduced}]${cost}[/stroke]` : `${cost}`
      this.txtStats.setText(`${costTxt}:${this.card.points}`)
    }
  }

  // Remove the highlight from this card
  removeHighlight(): () => void {
    let that = this
    var postFxPlugin = this.image.scene.plugins.get('rexOutlinePipeline')

    return function() {
      postFxPlugin['remove'](that.image)

      cardInfo.setVisible(false)
    }
    
  }

  // Set this cardImage as scrollable, effectively causing it to update the stats
  // position on a low interval
  setScrollable(height: number, padding: number): void {
    // NOTE Objects in Rex's scrollable containers must not be within Phaser containers, or they won't be clickable
    this.container.remove([this.image, this.txtStats])

    // Set a scroll event to remove the highlight
    let that = this
    this.image.scene.input.on('wheel', function(pointer, gameObject, dx, dy, dz, event) {
      that.onHoverExit()()
    })
  } 

  // Scroll the stats text to copy image
  // Height is how tall the containing sizer is, for manually setting visiblity of txt
  private scrollStats(height: number, padding: number): void {
    // Set the position of txt to upper left corner of image
    this.txtStats.copyPosition(this.image)
    this.txtStats.x -= Space.cardSize/2
    this.txtStats.y -= Space.cardSize/2

    let imageIsInvisible = !this.image.visible
    if (imageIsInvisible) {
      this.txtStats.setVisible(false)
      return
    }

    // If txt is high enough, make visible
    let abovePadding = this.txtStats.y <= padding
    let belowSizer = height <= this.txtStats.y + this.txtStats.height + padding
    this.txtStats.setVisible(!abovePadding && !belowSizer)
  }

  private onHover(): () => void {
    let that = this

    function doHighlight() {
      var postFxPlugin = that.image.scene.plugins.get('rexOutlinePipeline')

      postFxPlugin['remove'](that.image)
      postFxPlugin['add'](that.image,
        {thickness: Space.highlightWidth,
          outlineColor: ColorSettings.cardHighlight})
    }

    return function() {
      cardInfo.setVisible(true)

      if (!that.unplayable) {
        doHighlight()
      }

      cardInfo.text = that.card.getCardText()

      // TODO Adjust for extra container
      // Copy the position of the card in its local space
      let outerContainer = that.container.parentContainer
      let x = that.image.x + that.container.x + outerContainer.x 
      let y = that.image.y + that.container.y + outerContainer.y - Space.cardSize/2 - Space.highlightWidth * 2

      // Change alignment of text based on horizontal position on screen
      if (x <= cardInfo.width / 2) // Left
      {
        x = 0;
      }
      else if (x >= Space.windowWidth - cardInfo.width / 2) // Right side
      {
        x = Space.windowWidth - cardInfo.width;
      }
      else
      {
        x = x - cardInfo.width / 2;
      }

      // Going over the top
      if (y - cardInfo.height < 0)
      {
        // If it can fit below the card, put it there
        let yIfBelow = y + Space.cardSize + cardInfo.height + Space.highlightWidth * 4
        if (yIfBelow < Space.windowHeight) {
          y = yIfBelow
        }
        // Keep it within the top of the window
        else
        {
          y = cardInfo.height
        }
      }
      
      cardInfo.setX(x);
      cardInfo.setY(y);
    }
  }

  private onHoverExit(): () => void {
    return this.removeHighlight()
  }
}
