import "phaser"
import { Card, cardback } from "../catalog/catalog"
import { decodeCard } from "./codec"
import { ColorSettings, StyleSettings } from "../settings"
import { keywords, Keyword } from "../catalog/keywords"


var cardInfo: Phaser.GameObjects.Text;

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

  private getCardText(card): string {
    if (card === cardback) {
      return '?'
    }
    
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

    result = this.replaceReferences(result)
    result = this.explainKeywords(result)

    return result
  }

  // Replace all refences to other cards in this cardText with those card's name + text
  private replaceReferences(cardText: string): string {
    // Find each id reference and add the refenced card's text at the end
    let expr = /\${(\d+)}/
    
    // Replace all id references with the name of the card they reference
    let cards: Card[] = []
    function replaceName(match: string, cardId: string, ...args): string
    {
      let referencedCard = decodeCard(cardId)

      // Add to a list of refenced cards
      if (!cards.includes(referencedCard)) {
        cards.push(referencedCard)
      }

      return `${referencedCard.name} (${referencedCard.text})`
    }

    return cardText.replace(expr, replaceName)
  }

  // Add an explanation of each existing keyword in cardText to the end of the text
  private explainKeywords(cardText: string): string {

    // Find which keywords are present
    let presentKeywords: Keyword[] = []
    for (const keyword of keywords) {

      let regex = new RegExp(/\b/.source + keyword.key + /\b/.source, "i")
      
      if (regex.test(cardText)) {
        presentKeywords.push(keyword)
      }
    }

    // Add each present keyword's text at the end of the cardText
    for (const keyword of presentKeywords) {
      cardText += `\n(${keyword.text})`
    }

    return cardText
  }

  private onHover(): () => void {
    let that = this

    return function() {
      cardInfo.setVisible(true)

      if (!that.unplayable && that.card !== cardback) {
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
      if (!this.unplayable) {
        this.image.clearTint()
      }

      cardInfo.setVisible(false)
    }
  }
}
