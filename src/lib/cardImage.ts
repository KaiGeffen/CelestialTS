import "phaser"
import { cardback } from "../catalog/catalog"
import { ColorSettings, StyleSettings, UserSettings, BBConfig } from "../settings"
import Card from './card'
import { allCards } from "../catalog/catalog"


export var cardInfo: any // BBCodeText

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add['rexBBCodeText'](0, 0, '', BBConfig)

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
  unplayable: boolean = false

  constructor(card: Card, image: Phaser.GameObjects.Image, interactive: Boolean = true) {
    this.init(card, image, interactive);
  }

  init(card: Card, image: Phaser.GameObjects.Image, interactive: Boolean) {
    this.card = card;
    this.image = image;

    if (interactive) {
      image.setInteractive();
      image.on('pointerover', this.onHover(), this);
      image.on('pointerout', this.onHoverExit(), this);

      // If the mouse moves outside of the game, exit the hover also
      image.scene.input.on('gameout', this.onHoverExit(), this)
    }
  }

  destroy(): void {
    this.image.destroy();
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

  setTransparent(value: Boolean): void {
    if (value) {
      this.image.setAlpha(0.2)
    }
    else {
      this.image.setAlpha(1) 
    }
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

  // Remove the tint of this card being highlighted, and if you do, hide cardInfo
  removeHighlight(): void {
    if (!this.unplayable && this.image.isTinted) {
      this.image.clearTint()
    }

    cardInfo.setVisible(false)
  }

  private onHover(): () => void {
    let that = this

    return function() {
      cardInfo.setVisible(true)

      if (!that.unplayable && that.card !== cardback) {
        that.image.setTint(ColorSettings.cardHighlight)
      }

      cardInfo.text = that.card.getCardText()

      // Copy the position of the card in its local space
      let container = that.image.parentContainer;
      let x = that.image.x + container.x;
      let y = that.image.y + container.y;

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

      if (y + cardInfo.height > 650) {
        y = 650 - cardInfo.height;
      }
      
      cardInfo.setX(x);
      cardInfo.setY(y);
    }
  }

  private onHoverExit(): () => void {
    return this.removeHighlight
  }

  private onScroll(): () => void {
    return function() {
      if (!this.unplayable) {
        this.image.clearTint()
      }

      cardInfo.setVisible(false)
    }
  }
}
