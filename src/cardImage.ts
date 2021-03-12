import "phaser"
import { Card } from "./catalog/catalog"
import { decodeCard } from "./catalog/codec"


var cardInfo: Phaser.GameObjects.Text;

let style = {
      font: '36px Arial Bold',
      color: '#d00',
      backgroundColor: '#88a',
      wordWrap: { width: 500, useAdvancedWrap: true }
    };

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add.text(0, 0, '', style)
  cardInfo.alpha = 0.88
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
  }

  destroy(): void {
    this.image.destroy();
  }

  // Set this card image to be unplayable
  setUnplayable(): void {
    this.image.setTint(0x888888)
    this.unplayable = true
  }

  private getCardText(card): string {
    // Set the hover text
    let result = card.name + '\n'

    if (card.dynamicText !== undefined)
    {
      result += card.dynamicText
    }
    else
    {
      result += card.text
    }

    // Find each id refence and add the refenced card's text at the end
    // let expr = RegExp("\${(\d+)}", "g")
    let expr = /\${(\d+)}/
    
    // Replace all id references with the name of the card they reference
    let cards: Card[] = []
    function replaceName(match: string, p1: string, ...args): string
    {
      let referencedCard = decodeCard(p1)

      // Add to a list of refenced cards
      if (!cards.includes(referencedCard)) {
        cards.push(referencedCard)
      }

      return `${referencedCard.name} (${referencedCard.text})`
    }
    result = result.replace(expr, replaceName)

    // For each refenced card, add that card's text to the end of result
    // cards.forEach( (referencedCard) => {
    //   let cardText = referencedCard.text
    //   // let cardText = this.getCardText(referencedCard)
    //   result += `\n\n(${cardText})`
    // })

    return result
  }

  private onHover(): () => void {
    return function() {
      if (!this.unplayable) this.image.setTint(0xffff00)

      cardInfo.text = this.getCardText(this.card)

      // Copy the position of the card in its local space
      let container = this.image.parentContainer;
      let x = this.image.x + container.x;
      let y = this.image.y + container.y;

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
    return function() {
      if (!this.unplayable) this.image.clearTint()

      cardInfo.text = ''
    }
  }
}
