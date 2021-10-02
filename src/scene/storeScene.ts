import "phaser"
import { StyleSettings, FontSettings, ColorSettings, Space } from "../settings"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Card from "../lib/card"
import {cardInfo, addCardInfoToScene, CardImage} from "../lib/cardImage"

// TODO remove
import {collectibleCards} from "../catalog/catalog"


export default class StoreScene extends BaseScene {
  container: Phaser.GameObjects.Container
  temporaryObjs: CardImage[]

  btnOpen: Button
  btnExit: Button
  txtHint: Phaser.GameObjects.Text

  constructor() {
    super({
      key: "StoreScene"
    })
  }

  create(): void {
    super.precreate()
    
    this.container = this.add.container(Space.windowWidth/2, Space.windowHeight/2)
    this.temporaryObjs = []

    // Header text
    this.add.text(Space.windowWidth/2, 80, "Store", StyleSettings.title).setOrigin(0.5)

    // Button to open a pack
    this.btnOpen = new Button(this,
      Space.windowWidth/2,
      Space.windowHeight/2,
      'Open Pack',
      this.openPack()
      ).setOrigin(0.5)

    // Text hint to pick your 5th card
    this.txtHint = this.add.text(
      Space.windowWidth/2,
      Space.windowHeight/2,
      'Pick your 5th card:',
      StyleSettings.announcement)
      .setOrigin(0.5)
      .setVisible(false)

    this.btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight - 40, "Exit", this.doWelcome).setOrigin(0.5)

    // This scene displays card info
    addCardInfoToScene(this)

    super.create()
  }

  private openPack(): () => void {
    let that = this

    return function() {
      // Make the hint visible and button invisible
      that.btnOpen.setVisible(false)
      that.btnExit.setVisible(false)
      that.txtHint.setVisible(true)

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

  private doWelcome(): void {
    this.scene.start("WelcomeScene")
  }

  private addCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)
    cardImage.setPosition([(index - 1.5) * (Space.cardSize + Space.pad), -Space.cardSize])

    this.temporaryObjs.push(cardImage)
  }

  // Add a card which player can choose
  private addChoiceCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)
    cardImage.setPosition([(index - 1) * (Space.cardSize*2 + Space.pad), Space.cardSize*1.5])

    // When clicked, send to server the choice, destroy the cards, return open pack button
    let that = this
    cardImage.setOnClick(function() {
      that.sound.play('win')

      that.btnOpen.setVisible(true)
      that.btnExit.setVisible(true)
      that.txtHint.setVisible(false)

      // Clear out the old cards
      that.temporaryObjs.forEach(obj => obj.destroy())
      that.temporaryObjs = []

      // Hide hover text
      cardInfo.setVisible(false)
    })

    this.temporaryObjs.push(cardImage)
  }
}
