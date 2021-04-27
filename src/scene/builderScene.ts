import "phaser"
import { collectibleCards, starterCards,  Card } from "../catalog/catalog"
import { CardImage, cardInfo } from "../lib/cardImage"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { decodeCard, encodeCard } from "../lib/codec"
import Button from "../lib/button"
import BaseScene from "./baseScene"

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'


const DECK_PARAM = 'deck'

const defaultTutorialDeck: string = "101:100:100:86:86:86:86:0:0:0:0:0:39:39:39"

// The last deck of cards the player had, which get repopulated each time they enter the deck builder
var tutorialDeck: Card[] | string = defaultTutorialDeck
var standardDeck: Card[] = []


export default class BuilderScene extends BaseScene {
  isTutorial: Boolean

  catalogRegion
  deckRegion
  filterRegion
  menuRegion
  tutorialRegion

  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  init(params: any): void {
    this.isTutorial = params['isTutorial']

    if (this.isTutorial) {
      this.tutorialRegion = new TutorialRegion(this)
    }

    this.deckRegion = new DeckRegion(this)
    this.catalogRegion = new CatalogRegion(this, this.deckRegion)
    this.filterRegion = new FilterRegion(this, this.catalogRegion)
    this.menuRegion = new MenuRegion(this, this.deckRegion)
  }

  create(): void {
    this.catalogRegion.create(this.isTutorial)
    this.deckRegion.create(this.isTutorial)

    if (this.isTutorial) {
      this.tutorialRegion.create()
    }
    else {
      this.filterRegion.create()
      this.menuRegion.create()
    }

    super.create()
  }

  beforeExit(): void {
    this.deckRegion.beforeExit()
  }
}


class CatalogRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  cardContainer: Phaser.GameObjects.Container
  deckRegion
  cardImages: CardImage[] = []
  currentPage: number = 0

  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion)
  }

  init(scene, deckRegion): void {
    this.scene = scene
    this.container = this.scene.add.container(0, 0)
    this.cardContainer = this.scene.add.container(0, 0)
    this.deckRegion = deckRegion
  }

  create(isTutorial): void {
    let catalog = isTutorial ? starterCards : collectibleCards
    for (var i = catalog.length - 1; i >= 0; i--) {
      this.addCard(catalog[i], i)
    }
    if (catalog.length > Space.cardsPerPage) {
      let x = Space.cardsPerRow * (Space.cardSize + Space.pad) + Space.pad/2
      let y = 2 * (Space.cardSize + Space.pad) + Space.pad/2

      let btnNext = new Button(this.scene, x, y, '→', this.goNextPage(), false).setOrigin(0, 0)
      this.container.add(btnNext)

      let btnPrev = new Button(this.scene, x, y, '←', this.goPrevPage(), false).setOrigin(0, 1)
      this.container.add(btnPrev)
    }
  }

  // Filter which cards are visible
  // Only cards for which filterFunction is true are visible
  filter(filterFunction): void {
    let cardsRemoved = false
    let visibleIndex = 0

    // TODO Explain this
    for (var i = this.cardImages.length - 1; i >= 0; i--) {
      let cardImage = this.cardImages[i]

      // This card is present
      if (filterFunction(cardImage.card)) {
        cardImage.image.setVisible(true)

        // If cards are being removed, shift into position, otherwise snap
        let newPosition = this.getCardPosition(visibleIndex)
        if (cardsRemoved) {
          // TODO move over time (moveTo)
          cardImage.image.setPosition(...newPosition)
        } else {
          cardImage.image.setPosition(...newPosition)
        }

        visibleIndex++
      }
      else
      {
        // If this card was visible but now isn't, this filter is removing more cards
        if (cardImage.image.visible) cardsRemoved = true

          cardImage.image.setVisible(false)
      }
    }

    this.goToPage(0)
  }

  private onClick(card: Card): () => void {
    let that = this
    return function() {
      if (that.deckRegion.addCard(card)) {
        that.scene.sound.play('click')
      }
      else {
        that.scene.sound.play('failure') 

        that.scene.cameras.main.flash(300, 0, 0, 0.1)
      }
      
    }
  }

  private addCard(card: Card, index: number): void {
    var image: Phaser.GameObjects.Image
    var [x, y] = this.getCardPosition(index)
    
    image = this.scene.add.image(x, y, card.name)
    image.setDisplaySize(Space.cardSize, Space.cardSize)

    image.setInteractive()
    image.on('pointerdown', this.onClick(card), this)

    this.cardContainer.add(image)

    this.cardImages.push(new CardImage(card, image))
  }

  private getCardPosition(index: number): [number, number] {
    let pageNumber = Math.floor(index / Space.cardsPerPage)
    index = index % Space.cardsPerPage

    let col = index % Space.cardsPerRow
    let xPad = (1 + col) * Space.pad
    let x = col * Space.cardSize + xPad + Space.cardSize / 2
    x += pageNumber * Space.pageOffset

    let row = Math.floor(index / Space.cardsPerRow)
    let yPad = (1 + row) * Space.pad
    let y = row * Space.cardSize + yPad + Space.cardSize / 2

    return [x, y]
  }

  private goNextPage(): () => void {
    let that = this
    return function() {
      let numVisibleCards = that.cardImages.filter(function(cardImage) {
        return cardImage.image.visible
      }).length

      if (numVisibleCards > (that.currentPage + 1) * Space.cardsPerPage) {
        that.scene.sound.play('click')

        that.goToPage(that.currentPage + 1)
      }
      else {
        that.scene.sound.play('failure')
      }
    }
  }

  private goPrevPage(): () => void {
    let that = this
    return function() {
      if (that.currentPage > 0) {
        that.scene.sound.play('click')

        that.goToPage(that.currentPage - 1)
      }
      else {
        that.scene.sound.play('failure')
      }
    }
  }

  private goToPage(pageNum: number): void {
    this.cardContainer.x = -(pageNum * Space.pageOffset)
    this.currentPage = pageNum
  }
}


class DeckRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  deck: CardImage[] = []
  isTutorial: Boolean

  txtHint: Phaser.GameObjects.Text
  btnStart: Button
  btnMenu: Button

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene): void {
    this.scene = scene
    this.container = this.scene.add.container(988, 650)
  }

  create(isTutorial: boolean): void {
    let that = this

    this.isTutorial = isTutorial

    // Hint text - tell user to click cards to add
    this.txtHint = this.scene.add.text(-500, -120, "Click a card to add it to your deck",
      StyleSettings.announcement).setOrigin(0.5, 0)

    // Sort button
    let btnSort = new Button(this.scene, 0, -100, 'Sort', function() {that.sort()})

    // Start button
    this.btnStart = new Button(this.scene, 0, -50, '', this.onStart())

    // Menu button, the callback is set by menu region during its init
    this.btnMenu = new Button(this.scene, 0, -150, 'Menu')

    // Remove the Menu button, add a Reset button
    if (isTutorial) {
      this.btnMenu.setVisible(false)

      // Instead, include a button to reset to the default tutorial deck
      let btnReset = new Button(this.scene, 0, -150, 'Reset', this.onReset())

      this.container.add(btnReset)
    }

    // If this is the tutorial, use that deck, otherwise use the other deck
    if (isTutorial) {
      this.setDeck(tutorialDeck)
    } else {
      this.setDeck(standardDeck)
    }

    // Add all of these objects to this container
    this.container.add([this.txtHint, btnSort, this.btnStart, this.btnMenu])
  }

  addCard(card: Card): boolean {
    if (this.deck.length >= 15) {
      return false
    }

    let index = this.deck.length
    let [x, y] = this.getCardPosition(index)
    let image: Phaser.GameObjects.Image = this.scene.add.image(x, y, card.name)
    image.setDisplaySize(100, 100)

    image.setInteractive()
    image.on('pointerdown', this.removeCard(index), this)

    this.container.add(image)

    this.deck.push(new CardImage(card, image))

    // Update start button to reflect new amount of cards in deck
    this.updateText()

    // Card was added successfully
    return true
  }

  // Set the current deck, returns true if deck was valid
  setDeck(deckCode: string | Card[]): boolean {
    let deck: Card[]
    if (typeof deckCode === "string") {
      // Get the deck from this code
      let cardCodes: string[] = deckCode.split(':')

      deck = cardCodes.map( (cardCode) => decodeCard(cardCode))
    }
    else {
      deck = deckCode
    }

    // Check if the deck is valid, then create it if so
    if (deck.includes(undefined))
    {
      return false
    }
    else
    {
      // Remove the current deck
      this.deck.forEach( (cardImage) => cardImage.destroy())
      this.deck = []
      cardInfo.setVisible(false)
      this.updateText()
      
      // Add the new deck
      deck.forEach( (card) => this.addCard(card))

      return true
    }
  }

  // Set the callback for showing the menu
  setShowMenu(callback: () => void): void {
    this.btnMenu.setOnClick(callback)
  }

  // Before exiting, remember the deck player has
  beforeExit(): void {
    if (this.isTutorial) {
      tutorialDeck = this.deck.map( (cardImage) => cardImage.card)
    }
    else {
      standardDeck = this.deck.map( (cardImage) => cardImage.card)
    }
  }

  private onStart(): () => void {
    let that = this

    return function () {
      that.beforeExit()
      
      // Start the right scene / deck pair
      if (that.isTutorial) {
        that.scene.scene.start("TutorialScene2", {isTutorial: true, tutorialNumber: 2, deck: tutorialDeck})
      }
      else {
        that.scene.scene.start("GameScene", {isTutorial: false, deck: standardDeck})
      }
    }
  }

  private onReset(): () => void {
    let that = this
    return function() {that.setDeck(defaultTutorialDeck)}
  }

  private updateText(): void {
    if (this.deck.length === 15) {
      this.btnStart.text = 'Start'
      this.btnStart.input.enabled = true
    }
    else
    {
      this.btnStart.text = `${this.deck.length}/15`

      // TODO Grey out the button, have a disable method for button class
      // For debugging, allow sub-15 card decks locally
      if (location.port !== '4949') {
        this.btnStart.input.enabled = false
      }
    }

    this.txtHint.setVisible(this.deck.length === 0)
  }

  private getCardPosition(index: number): [number, number] {
    let xPad = Space.pad
    let x = index * (Space.cardSize - Space.stackOverlap) + xPad + Space.cardSize/2

    let y = Space.pad + Space.cardSize/2 + (index%2) * Space.stackOffset

    return [-x, -y]
  }

  private removeCard(index: number): () => void {
    let that = this
    return function() {
      // Play a sound
      that.scene.sound.play('click')

      // The text for the removed card would otherwise linger
      cardInfo.setVisible(false)

      // Remove the image
      that.deck[index].destroy()

      // Remove from the deck array
      that.deck.splice(index, 1)

      that.correctDeckIndices()

      that.updateText()

      if (that.deck.length === 0) {
        that.txtHint.setVisible(true)
      }
    }
  }

  // Set each card in deck to have the right position and onClick events for its index
  private correctDeckIndices(): void {
    for (var i = 0; i < this.deck.length; i++) {
      let image = this.deck[i].image

      image.setPosition(...this.getCardPosition(i))

      this.container.bringToTop(image)

      // Remove the previous onclick event and add one with the updated index
      image.removeAllListeners('pointerdown')
      image.on('pointerdown', this.removeCard(i), this)
    }
  }

  private sort(): void {
    this.deck.sort(function (card1, card2): number {
      if (card1.card.cost < card2.card.cost)
      {
        return 1
      }
      else if (card1.card.cost > card2.card.cost)
      {
        return -1
      }
      else
      {
        return card1.card.name.localeCompare(card2.card.name)
      }
    })

    this.correctDeckIndices()
  }
}


class FilterRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  catalogRegion
  filterCostAry: boolean[] = []

  constructor(scene: Phaser.Scene, catalogRegion) {
    this.init(scene, catalogRegion)
  }

  init(scene, catalogRegion): void {
    this.scene = scene
    this.catalogRegion = catalogRegion
    this.container = this.scene.add.container(1000, 0)
  }

  create(): void {
    // Add each of the number buttons
    let btnNumbers: Phaser.GameObjects.Text[] = []
    for (var i = 0; i <= 8; i++) {
      this.filterCostAry[i] = false

      let y = 50 * (i + 1)
      let btn = this.scene.add.text(30, y, i.toString(), StyleSettings.basic)
      
      btn.setInteractive()
      btn.on('pointerdown', this.onClick(i, btn))

      this.container.add(btn)

      btnNumbers.push(btn)
    }

    // Add the X (Clear) button
    let btnClear = this.scene.add.text(30, 0, 'x', StyleSettings.basic)
    btnClear.setInteractive()
    btnClear.on('pointerdown', this.onClear(btnNumbers))
    this.container.add(btnClear)
  }

  private onClick(i: number, btn): () => void {
    let that = this

    return function() {
      that.scene.sound.play('click')

      // Highlight the button, or remove its highlight
      if (btn.isTinted) {
        btn.clearTint()
      }
      else
      {
        btn.setTint(ColorSettings.filterSelected)
      }

      // Toggle filtering the chosen number
      that.filterCostAry[i] = !that.filterCostAry[i]

      // If nothing is filtered, all cards are shown
      let filterFunction
      if (that.filterCostAry.every(v => v === false)) {
        filterFunction = function (card: Card) {return true}
      }
      else
      {
        filterFunction = function (card: Card) {
          return that.filterCostAry[card.cost]
        }
      }

      that.catalogRegion.filter(filterFunction)
    }
  }

  private onClear(btns: Phaser.GameObjects.Text[]): () => void {
    let that = this
    return function() {
      that.scene.sound.play('click')

      btns.forEach( (btn) => btn.clearTint())

      for (var i = 0; i < that.filterCostAry.length; i++) {
        that.filterCostAry[i] = false
      }

      that.catalogRegion.filter(
        function (card: Card) {return true}
        )
    }
  }
}


class MenuRegion {
  scene: Phaser.Scene
  deckRegion
  container: Phaser.GameObjects.Container
  deck: Card[] = []

  // The textbox which contains the deck code for player's current deck
  textBoxDeckCode: any
  
  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion)
  }

  init(scene: Phaser.Scene, deckRegion): void {
    this.scene = scene
    this.deckRegion = deckRegion
    
    this.container = this.scene.add.container(Space.cardSize * 2 + Space.pad * 3, Space.pad)
    this.container.setVisible(false)
    // Menu will be above button to open the other menu
    this.container.setDepth(20)
  }

  create(): void {
    let that = this

    // Visible and invisible background rectangles, stops other containers from being clicked
    let invisBackground = this.scene.add.rectangle(0, 0, Space.windowWidth*2, Space.windowHeight*2, 0xffffff, 0)
    invisBackground.setInteractive()

    invisBackground.on('pointerdown', function() {
      that.scene.sound.play('close')
      that.container.setVisible(false)
    })
    this.container.add(invisBackground)



    // Set the callback for deckRegion menu button
    this.deckRegion.setShowMenu(this.onOpenMenu())



    // Visible background, which does nothing when clicked
    let width = Space.cardSize * 5 + Space.pad * 4
    let height = Space.cardSize * 4 + Space.pad * 3

    let visibleBackground = this.scene.add['rexRoundRectangle'](0, 0, width, height, 30, ColorSettings.menuBackground).setAlpha(0.95).setOrigin(0)
    visibleBackground.setInteractive()
    this.container.add(visibleBackground)



    // Vs ai toggleable button
    let y = Space.pad/2
    let txtVsAi = this.scene.add.text(Space.pad, y, 'Play vs Computer:', StyleSettings.announcement).setOrigin(0)
    this.container.add(txtVsAi)

    let radio = this.scene.add.circle(width - Space.pad*2, y + 26, 14).setStrokeStyle(4, ColorSettings.background).setOrigin(1, 0)
    if (UserSettings._get('vsAi')) {
      radio.setFillStyle(ColorSettings.cardHighlight)
    }

    radio.setInteractive()
    radio.on('pointerdown', function() {
      that.scene.sound.play('click')

      UserSettings._set('vsAi', !UserSettings._get('vsAi'))

      radio.setFillStyle((UserSettings._get('vsAi')) ? ColorSettings.cardHighlight : undefined)
    })
    this.container.add(radio)



    // Prompt for matchmaking code
    y += Space.cardSize
    let txtMatchmaking = this.scene.add.text(Space.pad, y, 'Matchmaking code:', StyleSettings.announcement).setOrigin(0)
    this.container.add(txtMatchmaking)

    y += Space.pad + Space.cardSize/2
    let textBoxMM = this.scene.add['rexInputText'](Space.pad, y, width - Space.pad*2, Space.cardSize/2, {
      type: 'textarea',
      text: UserSettings._get('mmCode'),
      font: 'Arial',
      fontSize: '36px',
      color: ColorSettings.button,
      border: 3,
      borderColor: '#000',
      backgroundColor: '#444',
      maxLength: 24
    })
    .setOrigin(0)
    .on('textchange', function (inputText) {
      inputText.text = inputText.text.replace('\n', '')
      UserSettings._set('mmCode', inputText.text)
    })
    this.container.add(textBoxMM)
    


    // Text field for the deck-code
    y += Space.cardSize*3/4
    let txtDeckCode = this.scene.add.text(Space.pad, y, 'Deck code:', StyleSettings.announcement).setOrigin(0)
    this.container.add(txtDeckCode)

    y += Space.pad + Space.cardSize/2
    this.textBoxDeckCode = this.scene.add['rexInputText'](Space.pad, y, width - Space.pad*2, Space.cardSize, {
      type: 'textarea',
      text: '',
      font: 'Arial',
      fontSize: '36px',
      color: ColorSettings.button,
      border: 3,
      borderColor: '#000',
      backgroundColor: '#444',
      maxLength: 15 * 3
    })
    .setOrigin(0)
    .on('textchange', function (inputText) {
      inputText.text = inputText.text.replace('\n', '')
      
      that.deckRegion.setDeck(inputText.text)
    })
    .on('blur', function (inputText) {
      that.textBoxDeckCode.text = that.getDeckCode()
    })
    this.container.add(this.textBoxDeckCode)
  }

  private onOpenMenu(): () => void {
    let that = this
    return function() {
      that.scene.sound.play('open')
      that.container.setVisible(true)

      // Set the deck-code textbox to have current deck described
      that.textBoxDeckCode.text = that.getDeckCode()
    }
  }

  // Get the deck code for player's current deck
  private getDeckCode(): string {
    let txt = ''
    this.deckRegion.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
    txt = txt.slice(0, -1)

    return txt
  }

  private onToggleUserSetting(btn: Button, property: string): () => void {
    let that = this
    return function() {
      UserSettings._set(property, !UserSettings._get(property))

      that.setCheckOrX(btn, UserSettings._get(property))
    }
  }

  // Set the btn to end with a check or an X based on the conditional
  private setCheckOrX(btn: Button, conditional: Boolean): void {
    let finalChar = conditional ? "✓":"X"
    let newText = btn.text.slice(0, -1) + finalChar
    btn.setText(newText)
  }
}


class TutorialRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene): void {
    this.scene = scene
    this.container = this.scene.add.container(0, 0)
  }

  create(): void {
    // Icon for Dash
    // let icon = this.scene.add.
    // Text for Dash
    // Explanation of Dash

    let s2 = 
`Welcome to Celestial.
Read on for this game's core mechanics.
When you feel ready, hit Start to begin playing.



This is a card...
Costs 2 mana to play (Left number)
Is worth 3 points (Right number)
Has the keyword Flare, which is explained below the card's text
Cards with Flare are worth 1 less point for each card played
before them in the round, so try to play Dash as early as possible.


The first player to win 5 rounds, and lead by at least 2, wins.

At the start of a round, each player draws 2 cards and gains 1 mana.

Players go back and forth spending mana to play cards,
or passing priority, until both players have passed in a row.

At that point, all cards on the table resolve, from left to right,
and the player with the most points wins the round.
`

    let s = 
    `Great job! Now try winning a full match against an opponent.

If you want to change your deck, click the cards below to remove
them, and above to add them.`
    let txt = this.scene.add.text(Space.pad, Space.cardSize + Space.pad * 2, s, StyleSettings.basic)
    // txt.style.fixedHeight = 1

    // this.scene.tweens.add({
    //     targets: txt.text,
    //     length: 100,
    //     duration: 500,
    //     ease: "Sine.easeInOut",
    //     yoyo: true,
    //     onComplete: function (tween, targets, _)
    //     {
    //       txt.destroy()
    //     }
    //   })

    this.container.add(txt)
  }
}




