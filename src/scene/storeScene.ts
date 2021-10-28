import "phaser"
import { Style, Space, UserProgress, UserSettings, Mechanics } from "../settings/settings"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Card from "../lib/card"
import Menu from "../lib/menu"
import {cardInfo, addCardInfoToScene, CardImage} from "../lib/cardImage"
import Server from "../server"


export default class StoreScene extends BaseScene {
  container: Phaser.GameObjects.Container
  temporaryObjs: CardImage[]

  btnOpen: Button
  btnExit: Button
  // Cost of the pack, as a portion of user's igc
  txtCost: Phaser.GameObjects.Text
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
    this.add.text(Space.windowWidth/2, 80, "Store", Style.title).setOrigin(0.5)

    // Button to open a pack
    this.btnOpen = new Button(this,
      Space.windowWidth/2,
      Space.windowHeight/2,
      'Open Pack',
      this.openPack()
      ).setOrigin(0.5, 1)
    
    this.txtCost = this.add.text(
      Space.windowWidth/2,
      Space.windowHeight/2,
      '',
      Style.basic
      ).setOrigin(0.5, 0)
    this.updateCostText()

    // Text hint to pick your 5th card
    this.txtHint = this.add.text(
      Space.windowWidth/2,
      Space.windowHeight/2,
      'Pick your 5th card:',
      Style.announcement)
      .setOrigin(0.5)
      .setVisible(false)

    this.btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight - 40, "Exit", this.doWelcome).setOrigin(0.5)

    // Manage any messages that are displayed
    this.manageMessages()
    
    // This scene displays card info
    addCardInfoToScene(this)

    super.create()
  }

  private openPack(): () => void {
    let that = this

    return function() {
      if (!Server.loggedIn()) {
        this.signalError("You aren't logged in.")
        return
      } else if (UserSettings._get('igc') < Mechanics.costPack) {
        this.signalError("You don't have enough ☆.")
        return
      }

      // Reduce user's igc locally, so that it displays correctly until servers updates us with new state
      UserSettings._set('igc', UserSettings._get('igc') - Mechanics.costPack)

      Server.requestPack(that.openPackCallback())
    }
  }

  private doWelcome(): void {
    this.scene.start("WelcomeScene")
  }

  private addCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)

    // Set position of card
    cardImage.setPosition([(index - 1.5) * (Space.cardSize + Space.pad), -Space.cardSize])

    // Display for user how many of the card they have
    cardImage.setQuantity(UserSettings._getQuantity(card.id), true)

    this.temporaryObjs.push(cardImage)
  }

  // Add a card which player can choose
  private addChoiceCard(card: Card, index: number): void {
    let cardImage = new CardImage(card, this.container, true)

    // Set position of card
    cardImage.setPosition([(index - 1) * (Space.cardSize*2 + Space.pad), Space.cardSize*1.5])

    // Display for user how many of the card they have
    cardImage.setQuantity(UserSettings._getQuantity(card.id))

    // When clicked, send to server the choice, destroy the cards, return open pack button
    let that = this
    cardImage.setOnClick(function() {
      that.sound.play('win')

      // Communicate choice to serve
      Server.sendChoiceCard(index)

      that.btnOpen.setVisible(true)
      that.txtCost.setVisible(true)
      that.btnExit.setVisible(true)
      that.txtHint.setVisible(false)

      that.updateCostText()

      // Clear out the old cards
      that.temporaryObjs.forEach(obj => obj.destroy())
      that.temporaryObjs = []

      // Hide hover text
      cardInfo.setVisible(false)
    })

    this.temporaryObjs.push(cardImage)
  }

  // The callback for when server responds with a pack of cards
  private openPackCallback(): (cards: Card[]) => void {
    let that = this

    return function(cards: Card[]) {
      if (!that.scene.isActive(that)) {
        console.log('Pack opened, but no longer in the shop')
        return
      }

      // Make the hint visible and button invisible
      that.btnOpen.setVisible(false)
      that.txtCost.setVisible(false)
      that.btnExit.setVisible(false)
      that.txtHint.setVisible(true)

      for(var i = 0; i < 4; i++) {
        that.addCard(cards[i], i)
      }

      for(var i = 4; i < 4 + 3; i++) {
        that.addChoiceCard(cards[i], i - 4)
      }
    }
  }

  // Manage any messages that may need to be displayed for the user
  private manageMessages(): void {
    let msgText = UserProgress.getMessage('store')
    if (msgText !== undefined) {
      // Open a window informing user of information
      let menu = new Menu(
        this,
        1000,
        300,
        true,
        25)

      let txtTitle = this.add.text(0, -110, 'Welcome!', Style.announcement).setOrigin(0.5)
      let txtMessage = this.add['rexBBCodeText'](0, -50, msgText, Style.basic).setOrigin(0.5, 0)
      
      menu.add([txtTitle, txtMessage])
    }
  }

  // Update the cost text to reflect user's current available igc
  private updateCostText(): void {
    this.txtCost.setText(`(${Mechanics.costPack}/${UserSettings._get('igc')} ☆)`)
  }
}
