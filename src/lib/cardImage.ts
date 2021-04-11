import "phaser"
import { Card } from "../catalog/catalog"
import { decodeCard } from "./codec"
import { ColorSettings, StyleSettings } from "../settings"


var cardInfo: Phaser.GameObjects.Text;

export function addCardInfoToScene(scene: Phaser.Scene): Phaser.GameObjects.Text {
  cardInfo = scene.add.text(0, 0, '', StyleSettings.cardText)
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
    let that = this

    return function() {
      if (!that.unplayable) {
        that.image.setTint(ColorSettings.cardHighlight)
      }

      cardInfo.text = that.getCardText(that.card)

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
    return function() {
      if (!this.unplayable) this.image.clearTint()

      cardInfo.text = ''
    }
  }
}
