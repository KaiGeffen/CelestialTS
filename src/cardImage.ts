import "phaser"
import { Card } from "./catalog/catalog"


var cardInfo: Phaser.GameObjects.Text;

let style = {
      font: '36px Arial Bold',
      color: '#d00',
      backgroundColor: '#88a',
      wordWrap: { width: 500, useAdvancedWrap: true }
    };

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add.text(0, 0, '', style)
  cardInfo.alpha = 0.9
  return cardInfo
}

export class CardImage {
  card: Card;
  image: Phaser.GameObjects.Image;

  constructor(card: Card, image: Phaser.GameObjects.Image) {
    this.init(card, image);
  }

  init(card: Card, image: Phaser.GameObjects.Image) {
    this.card = card;
    this.image = image;

    image.setInteractive();
    image.on('pointerover', this.onHover(), this);
    image.on('pointerout', this.onHoverExit(), this);
  }

  destroy(): void {
    this.image.destroy();
  }

  private onHover(): () => void {
    return function() {
      this.image.setTint(0xffff00)

      cardInfo.text = this.card.text;

      // Copy the position of the card in its local space
      let container = this.image.parentContainer;
      let x = this.image.x + container.x;
      let y = this.image.y + container.y;

      // Change alignment of text based on horizontal position on screen
      if (x <= cardInfo.width / 2) // Left
      {
        x = 0;
      }
      else if (x >= 1000 - cardInfo.width / 2) // Right side
      {
        x = 1000 - cardInfo.width;
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
    return function() {
      this.image.clearTint();

      cardInfo.text = '';
    }
  }
}
