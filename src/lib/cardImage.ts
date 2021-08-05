import "phaser"
import { cardback } from "../catalog/catalog"
import { ColorSettings, StyleSettings, UserSettings, BBConfig, CardStatsConfig, Space } from "../settings"
import Card from './card'
import { allCards } from "../catalog/catalog"


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

// Make card info reflect whatever card it is currently hovering
export function refreshCardInfo() {
  let scene: Phaser.Scene = cardInfo.scene

  let allContainers = scene.children.getAll().filter(e => e.type === 'Container' && e['visible'])

  let showText = false

  allContainers.forEach(function (container: Phaser.GameObjects.Container) {
    container.list.forEach(function (obj) {
      if (obj.type === 'Image') {
        let sprite = obj as Phaser.GameObjects.Image
        let pointer = scene.game.input.activePointer
        
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

  init(card: Card, outerContainer: any, interactive: Boolean) {
    this.card = card

    let scene: Phaser.Scene = outerContainer.scene
    // Card image
    this.image = scene.add.image(0, 0, card.name)
    this.image.setDisplaySize(100, 100)

    // Stat text
    let s = `${card.cost}:${card.points}`
    if (card === cardback) {
      s = ''
    }
    this.txtStats = scene.add['rexBBCodeText'](-Space.cardSize/2, -Space.cardSize/2, s, CardStatsConfig).setOrigin(0)

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

  setTransparent(value: Boolean): void {
    if (value) {
      this.image.setAlpha(0.2)
    }
    else {
      this.image.setAlpha(1) 
    }
  }

  setPosition(position: [number, number]): void {
    this.container.setPosition(position[0], position[1])
  }

  // Animate the card 'Camera' when it should be given attention
  animateCamera(delay: number): void {
    let that = this
    let scene = this.image.scene

    // Scale and shrink twice after delay, send a 'Sight' text object at the same time
    scene.tweens.add({
      targets: this.image,
      scale: 1.5,
      delay: delay,
      duration: 250,
      repeat: 1,
      ease: "Sine.easeInOut",
      yoyo: true,
      onStart: function () {
        // Create a text object 'Sight' that goes from Camera to opponent
        let txt = scene.add.text(that.image.x, that.image.y, 'Sight 4', StyleSettings.basic).setOrigin(0.5, 0.5)

        scene.tweens.add({
          targets: txt,
          y: 200,
          duration: 1500,
          // ease: "Sine.easeInOut",
          onComplete: 
          function (tween, targets, _)
          {
            txt.destroy()
          }
        })
      }
    })
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

  // Scroll the stats text to copy image
  // Height is how tall the containing sizer is, for manually setting visiblity of txt
  scrollStats(height: number, padding: number): void {
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
      else if (x >= 1100 - cardInfo.width / 2) // Right side
      {
        x = 1100 - cardInfo.width;
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

  private onScroll(): () => void {
    return function() {
      cardInfo.setVisible(false)
    }
  }
}
