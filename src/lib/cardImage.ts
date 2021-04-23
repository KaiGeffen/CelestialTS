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
    if (UserSettings.explainKeywords) {
      result = this.explainKeywords(result)
    }

    if (simplifyCardInfo) {
      result = result.split(',')[0]
      result = result.replace(':', ' mana:')
      
      if (result.endsWith('1')) {
        result += " point"
      } else {
        result += " points"
      }
    }

    return result
  }

  // Replace all refences to other cards in this cardText with those card's name + text
  private replaceReferences(cardText: string): string {
    // Find each id reference and add the refenced card's text at the end
    let expr = /\${(\d+)}/
    
    // Replace all id references with the name of the card they reference
    let referencedCards: Card[] = []
    function replaceName(match: string, cardId: string, ...args): string
    {
      let card = decodeCard(cardId)

      // Add to a list of refenced cards
      if (!referencedCards.includes(card)) {
        referencedCards.push(card)
      }

      return `${card.name}`
    }

    // Replace each reference with that card's name
    cardText = cardText.replace(expr, replaceName)

    // Add a full explanation of the card at the end
    if (referencedCards.length > 0) {
      cardText += '\n'
    }
    for (const card of referencedCards) {
      cardText += `\n${card.name} - ${card.text}`
    }

    return cardText
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
    if (presentKeywords.length > 0) {
      cardText += '\n'
    }
    for (const keyword of presentKeywords) {
      cardText += `\n${keyword.text}`
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
