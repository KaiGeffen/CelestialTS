import "phaser"
import { Card, cardback } from "../catalog/catalog"
import { decodeCard } from "./codec"
import { ColorSettings, StyleSettings, UserSettings } from "../settings"
import { keywords, Keyword } from "../catalog/keywords"


// For the tutorial, the card info shown will only be the mana/points
var simplifyCardInfo: Boolean = false
export function setSimplifyCardInfo(simplify: Boolean): void {
  simplifyCardInfo = simplify
}

export var cardInfo: Phaser.GameObjects.Text

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add.text(0, 0, '', StyleSettings.cardText)
  cardInfo.alpha = 0.88
  cardInfo.setVisible(false)

  return cardInfo
}

export class CardImage {
  card: Card
  image: Phaser.GameObjects.Image
  unplayable: boolean = false

  constructor(card: Card, image: Phaser.GameObjects.Image) {
    this.init(card, image);
  }

  init(card: Card, image: Phaser.GameObjects.Image) {
    this.card = card;
    this.image = image;

    image.setInteractive();
    image.on('pointerover', this.onHover(), this);
    image.on('pointerout', this.onHoverExit(), this);

    // If the mouse moves outside of the game, exit the hover also
    image.scene.input.on('gameout', this.onHoverExit(), this)
  }

  destroy(): void {
    this.image.destroy();
  }

  // Set this card image to be unplayable
  setUnplayable(): void {
    this.image.setTint(ColorSettings.cardUnplayable)
    this.unplayable = true
  }

  setTransparent(): void {
    this.image.setAlpha(0.2)
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

      cardInfo.setVisible(false)
    }
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
