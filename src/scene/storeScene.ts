import "phaser"
import { StyleSettings, FontSettings, ColorSettings, Space } from "../settings"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Card from "../lib/card"
import {addCardInfoToScene, CardImage} from "../lib/cardImage"

// TODO remove
import {collectibleCards} from "../catalog/catalog"


export default class StoreScene extends Phaser.Scene {
  container: Phaser.GameObjects.Container
  temporaryObjs: CardImage[]

  constructor() {
    super({
      key: "StoreScene"
    })
  }

  create(): void {
    this.container = this.add.container(Space.windowWidth/2, Space.windowHeight/2)
    this.temporaryObjs = []

    // Header text
    this.add.text(Space.windowWidth/2, 80, "Store", StyleSettings.title).setOrigin(0.5)

    // Button to open a pack
    new Button(this,
      Space.windowWidth/2,
      Space.windowHeight/2 + Space.cardSize + Space.pad * 2,
      'Open Pack',
      this.openPack()
      ).setOrigin(0.5, 0)

    let btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight - 40, "Exit", this.doExit).setOrigin(0.5)

    // This scene displays card info
    addCardInfoToScene(this)
  }

  private openPack(): () => void {
    let that = this

    return function() {
      // Clear out the old cards
      this.temporaryObjs.forEach(obj => obj.destroy())
      this.temporaryObjs = []

      // Get the cards from server
      for(var i = 0; i < 4; i++) {
        const card = collectibleCards[i]

        that.addCard(card, i)
      }

      for(var i = 0; i < 3; i++) {
        const card = collectibleCards[i + 10]

        that.addChoiceCard(card, i)
      }

      
    }
  }

  private doExit(): void {
    this.scene.start("WelcomeScene")
  }

  private addCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)
    cardImage.setPosition([(index - 1.5) * (Space.cardSize + Space.pad), (Space.cardSize + Space.pad)/2])

    this.temporaryObjs.push(cardImage)
  }

  // Add a card which player can choose
  private addChoiceCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)
    cardImage.setPosition([(index - 1) * (Space.cardSize + Space.pad), -(Space.cardSize + Space.pad)/2])

    this.temporaryObjs.push(cardImage)
  }
}
