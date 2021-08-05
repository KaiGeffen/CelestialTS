import "phaser"
import { collectibleCards, baseCards } from "../catalog/catalog"
import { CardImage, cardInfo } from "../lib/cardImage"
import { StyleSettings, ColorSettings, UserSettings, Space } from "../settings"
import { decodeCard, encodeCard } from "../lib/codec"
import Card from "../lib/card"
import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"
import BaseScene from "./baseScene"
import PrebuiltDeck from "../catalog/prebuiltDecks"

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'


const DECK_PARAM = 'deck'

// The last deck of cards the player had, which get repopulated each time they enter the deck builder
var tutorialDeck: Card[] | string = []
var standardDeck: Card[] = []


export default class BuilderScene extends BaseScene {
  isTutorial: boolean

  catalogRegion
  deckRegion
  filterRegion
  menuRegion
  tutorialRegion
  modeRegion

  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  init(params: any): void {
    this.isTutorial = params['isTutorial']

    // What the cardpool available is
    let cardpool = collectibleCards
    // What the default deck for this mode is
    let defaultDeck = ""
    // The last scene, which back button should return user to
    let lastScene = ""
    let tutorialName = ""

    if (this.isTutorial) {
      this.tutorialRegion = new TutorialRegion(this, params['deckDescription'])

      cardpool = params['cardpool']
      defaultDeck = params['defaultDeck']
      lastScene = params['lastScene']
      tutorialName = params['tutorialName']
    }

    this.deckRegion = new DeckRegion(this, defaultDeck, lastScene, tutorialName)
    this.catalogRegion = new CatalogRegion(this, this.deckRegion, cardpool)
    this.filterRegion = new FilterRegion(this, this.catalogRegion)

    // Regions that aren't opened by default
    this.menuRegion = new MenuRegion(this, this.deckRegion)
    this.modeRegion = new ModeRegion(this)
  }

  create(): void {
    super.precreate()
    
    this.catalogRegion.create(this.isTutorial)
    this.deckRegion.create(this.isTutorial)

    if (this.isTutorial) {
      this.tutorialRegion.create()
    }
    else {
      this.filterRegion.create()
      this.menuRegion.create(this.filterRegion, this.deckRegion)
      this.modeRegion.create(this.deckRegion)
    }

    // Filter to ensure that cards are visible/not based on user settings (Expansion hidden, etc)
    this.filterRegion.filter()

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
  cardpool: Card[]
  cardImages: CardImage[] = []
  currentPage: number = 0

  // The scrollable panel which the cards are on
  panel: any

  constructor(scene: Phaser.Scene, deckRegion, cardpool: Card[]) {
    this.init(scene, deckRegion, cardpool)
  }

  init(scene, deckRegion, cardpool: Card[]): void {
    this.scene = scene
    this.container = this.scene.add.container(0, 0)
    this.cardContainer = this.scene.add.container(0, 0)
    this.deckRegion = deckRegion
    this.cardpool = cardpool
  }

  create(isTutorial): void {
    let that = this

    let width = Space.cardSize*8 + Space.pad*10 + 10
    let height = Space.cardSize*4 + Space.pad*5
    let background = this.scene['rexUI'].add.roundRectangle(0, 0, width, height, 16, ColorSettings.menuBackground, 0.7).setOrigin(0)
    this.scene.children.sendToBack(background)

    this.panel = this.scene['rexUI'].add.scrollablePanel({
            x: 0,
            y: 0,
            width: width,
            height: height,

            scrollMode: 0,

            background: background,

            panel: {
                child: this.scene['rexUI'].add.fixWidthSizer({
                    space: {
                        left: Space.pad,
                        right: Space.pad - 10,
                        top: Space.pad - 10,
                        bottom: Space.pad - 10,
                        item: Space.pad,
                        line: Space.pad,
                    }
                })
            },

            slider: {
              input: 'click',
                track: this.scene['rexUI'].add.roundRectangle(0, 0, 20, 10, 10, 0xffffff),
                thumb: this.scene['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.background),
            },

            space: {
                right: 10,
                top: 10,
                bottom: 10,
            }
        }).setOrigin(0)
            .layout()
            .setInteractive()
            .on('scroll', function(panel) {
              if (0 < panel.t && panel.t < 1) {
                // TODO This isn't working, fix
                for (var i = 0; i < that.cardImages.length; i++) {
                  that.cardImages[i].removeHighlight()
                }
                cardInfo.setVisible(false)
              }
            })

    // Panel updates when scroll wheel is used on it
    this.scene.input.on('wheel', function(pointer, gameObject, dx, dy, dz, event){
      // Scroll panel down by amount wheel moved
      that.panel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      that.panel.t = Math.max(0, that.panel.t)
      that.panel.t = Math.min(1, that.panel.t)
    })

    // The layout manager for the panel
    let sizer = this.panel.getElement('panel')

    // Add each of the cards
    for (var i = 0; i < this.cardpool.length; i++) {
      let cardImage = this.addCard(this.cardpool[i], i)

      sizer.add(cardImage.image)
    }

    this.panel.layout()

    // Must add an invisible region below the scroller or else partially visible cards will be clickable on
    // their bottom parts, which cannot be seen and are below the scroller
    let invisBackground = this.scene.add
      .rectangle(0, this.panel.height, Space.windowWidth, Space.cardSize, 0x000000, 0)
      .setOrigin(0)
      .setInteractive()
  }

  // Filter which cards are visible
  // Only cards for which filterFunction is true are visible
  filter(filterFunction: (card: Card) => boolean): void {
    let sizer = this.panel.getElement('panel')
    sizer.clear()

    let cardCount = 0
    for (var i = 0; i < this.cardImages.length; i++) {
      let cardImage = this.cardImages[i]

      // This card is present
      if (filterFunction(cardImage.card)) {
        cardCount++

        cardImage.image.setVisible(true)
        sizer.add(cardImage.image)
      }
      else
      {
        // sizer.remove(cardImage.image)
        cardImage.image.setVisible(false)
      }
    }

    // Hide the slider if all cards fit in panel
    this.panel.getElement('slider').setVisible(cardCount > 8*4)

    this.panel.layout()
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

  private addCard(card: Card, index: number): CardImage {
    let cardImage = new CardImage(card, this.cardContainer)
    cardImage.setPosition(this.getCardPosition(index))

    let image = cardImage.image
    image.setInteractive()
    image.on('pointerdown', this.onClick(card), this)

    // Add this cardImage to the maintained list of cardImages
    this.cardImages.push(cardImage)

    return cardImage
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
}


class DeckRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container

  // The previous scene, which the back button should return user to
  lastScene: string

  // The default deck for this mode
  defaultDeck: string
  deck: CardImage[] = []
  isTutorial: Boolean
  // The name of this tutorial (Basics, Anubis, etc)
  tutorialName: string

  txtHint: Phaser.GameObjects.Text
  btnStart: Button
  btnMenu: Button

  constructor(scene: Phaser.Scene, defaultDeck: string, lastScene: string, tutorialName: string) {
    this.init(scene, defaultDeck, lastScene, tutorialName)
  }

  init(scene: Phaser.Scene, defaultDeck: string, lastScene: string, tutorialName: string): void {
    this.scene = scene
    // NOTE Must set depth to 1 so that this is above the catalog, which blocks its cards so that they don't appear below the panel
    this.container = this.scene.add.container(988, 650).setDepth(1)

    this.defaultDeck = defaultDeck
    this.lastScene = lastScene
    this.tutorialName = tutorialName
  }

  create(isTutorial: boolean): void {
    let that = this

    this.isTutorial = isTutorial

    // Hint text - tell user to click cards to add
    this.txtHint = this.scene.add.text(-500, -120, "Click a card to add it to your deck",
      StyleSettings.announcement).setOrigin(0.5, 0)

    // Start button, the callback is set by the mode region during its init
    this.btnStart = new Button(this.scene, 0, -50, '')
    if (isTutorial) {
      this.btnStart.on('pointerdown', this.startGame, this)
    }

    // Menu button, the callback is set by menu region during its init
    this.btnMenu = new Button(this.scene, 0, -100, 'Deck')

    // Remove the Menu button, add a Reset button
    if (isTutorial) {
      this.btnMenu.setVisible(false)

      // Instead, include a button to reset to the default tutorial deck
      let btnReset = new Button(this.scene, 0, -100, 'Reset', this.onReset())

      // Also include a button to return to the catalog scene
      let btnBack = new Button(this.scene, 0, -150, 'Back', this.onBack())

      this.container.add(btnReset)
      this.container.add(btnBack)
    }

    // If this is the tutorial, use that deck, otherwise use the other deck
    if (isTutorial) {
      this.setDeck(this.defaultDeck)
    } else {
      this.setDeck(standardDeck)
    }

    // Add all of these objects to this container
    this.container.add([this.txtHint, this.btnStart, this.btnMenu])
  }

  addCard(card: Card): boolean {
    if (this.deck.length >= 15) {
      return false
    }

    let index = this.deck.length

    let cardImage = new CardImage(card, this.container)
    cardImage.setPosition(this.getCardPosition(index))

    // TODO Pass in a callback to an exposed function instead of deeply involving in the impl of cardImage
    let image = cardImage.image
    image.setInteractive()
    image.on('pointerdown', this.removeCard(index), this)

    // Add this to the deck
    this.deck.push(cardImage)

    // Update start button to reflect new amount of cards in deck
    this.updateText()

    // Sort the deck, now done automatically after each card added
    this.sort()

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

      if (deckCode === '') {
        deck = []
      }
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

      // Show whether each card is legal in this format
      this.showCardsLegality()

      return true
    }
  }

  // Set the callback for showing the menu
  setShowMenu(callback: () => void): void {
    this.btnMenu.setOnClick(callback)
  }

  // Set the callback for showing the mode menu
  setModeMenu(callback: () => void): void {
    this.btnStart.setOnClick(callback)
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

  // Grey out cards in the deck that aren't legal in this format, remove grey from legal cards
  showCardsLegality(): void {
    for (var i = 0; i < this.deck.length; i++) {

      // If using the expansion, all cards are legal
      if (UserSettings._get('useExpansion')) {
        this.deck[i].setTransparent(false)
      }
      else {
        let isInBase = baseCards.includes(this.deck[i].card)

        this.deck[i].setTransparent(!isInBase)
      }
    }
  }

  // Start the game scene
  startGame(): void {
    this.beforeExit()

    // Start the right scene / deck pair
    if (this.isTutorial) {  
      this.scene.scene.start("TutorialScene2", {isTutorial: true, tutorialNumber: 2, deck: tutorialDeck, tutorialName: this.tutorialName})
    }
    else {
      this.scene.scene.start("GameScene", {isTutorial: false, deck: standardDeck})
    }
  }

  private onReset(): () => void {
    let that = this
    return function() {that.setDeck(that.defaultDeck)}
  }

  private onBack(): () => void {
    let that = this
    return function() {
      that.scene.scene.start(that.lastScene)
    }
  }

  private updateText(): void {
    if (this.deck.length === 15) {
      this.btnStart.text = 'Start'
      this.btnStart.input.enabled = true
      this.btnStart.glow()
    }
    else
    {
      this.btnStart.text = `${this.deck.length}/15`
      this.btnStart.stopGlow()

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

    let y = Space.pad/2 + Space.cardSize/2 + (index%2) * Space.stackOffset

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
  searchText: string = ""

  constructor(scene: Phaser.Scene, catalogRegion,) {
    this.init(scene, catalogRegion)
  }

  init(scene: Phaser.Scene, catalogRegion): void {
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

    // Add search functionality
    let that = this

    let invisBackground = this.scene.add.rectangle(0, 0, Space.windowWidth*2, Space.windowHeight*2, 0x000000, 0.2)
    invisBackground.setInteractive().setVisible(false).setDepth(30)

    invisBackground.on('pointerdown', function() {
      that.scene.sound.play('close')

      textboxSearch.setVisible(false)
      invisBackground.setVisible(false)
    })

    // Text input for the search
    let textboxSearch = this.scene.add['rexInputText'](
      Space.windowWidth/2 - 2, Space.windowHeight/2, 620, Space.cardSize, {
        type: 'text',
        text: '',
        placeholder: 'Search',
        tooltip: 'Search for cards by text.',
        font: 'Arial',
        fontSize: '80px',
        color: ColorSettings.button,
        border: 3,
        borderColor: '#000',
        backgroundColor: '#444',
        maxLength: 12,
        selectAll: true,
        id: 'search-field'
      })
    .setOrigin(0.5)
    .setVisible(false)
    .on('blur', function () {
      this.setVisible(false)
      invisBackground.setVisible(false)
    })
    .on('textchange', function (inputText) {
      let hasNewline = inputText.text.includes('\n')
      inputText.text = inputText.text.replace('\n', '')
      
      if (hasNewline) {
        this.setVisible(false)
        invisBackground.setVisible(false)
      }

      // Filter the visible cards based on the text
      that.searchText = inputText.text
      that.filter()

      // If there is any text, set the search button to glow
      if (inputText.text !== "") {
        btnSearch.glow()
      } else {
        btnSearch.stopGlow()
      }
    })

    // Button to open the search field, just below the base scene buttons
    let btnSearch = new Button(this.scene, 100, 100, '"i"', function() {
      that.scene.sound.play('open')

      textboxSearch.setVisible(true)
      invisBackground.setVisible(true)

      setTimeout(function() {
        textboxSearch.setFocus()
        textboxSearch.selectAll()
        }, 50)
      }).setOrigin(1, 0)
    this.container.add(btnSearch)

    // Listen for esc key, and close search field if seen
    let esc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    esc.on('down', function () {
      if (invisBackground.visible) {
        textboxSearch.setVisible(false)
        invisBackground.setVisible(false)

        this.scene.sound.play('close')

        BaseScene.menuClosing = true
      }
    }, this)
  }

  // Filter the visible cards, based on if expansion is used, and the cost settings of this region
  filter(): void {
    let that = this

    let costFilter = function(card: Card): boolean {
      // If no number are selected, all cards are fine
      if (!that.filterCostAry.includes(true)) {
        return true
      }
      else {
        return that.filterCostAry[card.cost]
      }
    }

    let expansionFilter = function(card: Card): boolean {
      if (UserSettings._get('useExpansion')) {
        return true
      }
      else {
        return baseCards.includes(card)
      }
    }

    let searchTextFilter = function(card: Card): boolean {
      return (card.getCardText(true)).toLowerCase().includes(that.searchText.toLowerCase())
    }

    let andFilter = function(card: Card): boolean {
      return costFilter(card) && expansionFilter(card) && searchTextFilter(card)
    }

    that.catalogRegion.filter(andFilter)
  }

  private openSearchField(): void {

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

      that.filter()
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

      that.filter()
    }
  }
}


class MenuRegion {
  scene: Phaser.Scene
  deckRegion
  deck: Card[] = []

  // The textbox which contains the deck code for player's current deck
  textBoxDeckCode: any
  
  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion)
  }

  init(scene: Phaser.Scene, deckRegion): void {
    this.scene = scene
    this.deckRegion = deckRegion
  }

  create(filterRegion: any, deckRegion: any): void {
    let that = this

    let width = Space.iconSeparation * 3
    let height = 640

    let menu = new Menu(
      this.scene,
      Space.windowWidth/2,//Space.cardSize * 2 + Space.pad * 3,
      Space.windowHeight/2,//Space.cardSize + Space.pad * 2,
      width,
      height,
      false,
      20)

    // Prebuilt decks
    let y = Space.pad/2 - height/2
    y += Space.iconSeparation/2 + Space.pad

    let x = -width/2 + Space.iconSeparation/2
    let i = 0
    for (const name in PrebuiltDeck.getAll()) {
      // Create the icon
      new Icon(this.scene, menu, x, y, name, function() {
        // Set the built deck to this prebuilt deck
        that.deckRegion.setDeck(PrebuiltDeck.get(name))

        // Update the textbox
        that.textBoxDeckCode.text = that.getDeckCode()
      })

      // Move to the next row after 3 icons
      x += Space.iconSeparation
      if (++i >= 3) {
        i = 0
        x = -width/2 + Space.iconSeparation/2
        y += Space.iconSeparation
      }
    }

    // Use expansion toggleable button
    y -= Space.iconSeparation - Space.cardSize/2 - Space.pad
    let txtUseExpansion = this.scene.add.text(Space.pad - width/2, y, 'Use expansion:', StyleSettings.announcement).setOrigin(0)

    let radioExpansion = this.scene.add.circle(width/2 - Space.pad*2, y + 26, 14).setStrokeStyle(4, ColorSettings.background).setOrigin(1, 0)
    if (UserSettings._get('useExpansion')) {
      radioExpansion.setFillStyle(ColorSettings.cardHighlight)
    }

    radioExpansion.setInteractive()
    radioExpansion.on('pointerdown', function() {
      that.scene.sound.play('click')

      // Toggle useExpansion setting
      UserSettings._set('useExpansion', !UserSettings._get('useExpansion'))

      // Reflect the current value of useExpansion setting
      radioExpansion.setFillStyle(UserSettings._get('useExpansion') ? ColorSettings.cardHighlight : undefined)

      // Filter the cards available in catalog
      filterRegion.filter()

      // Deck should grey/un-grey cards in it to reflect whether they are legal in that format
      deckRegion.showCardsLegality()
    })


    // Text field for the deck-code
    y += Space.cardSize * 3/4
    let txtDeckCode = this.scene.add.text(Space.pad - width/2, y, 'Deck code:', StyleSettings.announcement).setOrigin(0)

    y += Space.pad + Space.cardSize/2
    this.textBoxDeckCode = this.scene.add['rexInputText'](Space.pad - width/2, y, width - Space.pad*2, Space.cardSize, {
      type: 'textarea',
      text: '',
      tooltip: "Copy the code for your current deck, or paste in another deck's code to create that deck.",
      font: 'Arial',
      fontSize: '36px',
      color: ColorSettings.button,
      border: 3,
      borderColor: '#000',
      backgroundColor: '#444',
      maxLength: 15 * 4 - 1
    })
    .setOrigin(0)
    .on('textchange', function (inputText) {
      inputText.text = inputText.text.replace('\n', '')
      
      that.deckRegion.setDeck(inputText.text)
    })
    .on('blur', function (inputText) {
      that.textBoxDeckCode.text = that.getDeckCode()
    })
    
    menu.add([
      txtUseExpansion,
      radioExpansion,
      txtDeckCode,
      this.textBoxDeckCode
      ])

    // Set the callback for deckRegion menu button
    this.deckRegion.setShowMenu(this.onOpenMenu(menu))
  }

  private onOpenMenu(menu: Menu): () => void {
    let that = this
    return function() {
      menu.open()

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
}


class ModeRegion {
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene: Phaser.Scene): void {
    this.scene = scene
  }

  create(deckRegion: any): void {
    let that = this

    // Visible background, which does nothing when clicked
    let width = Space.cardSize * 5 + Space.pad * 4
    let height = Space.cardSize * 3 + Space.pad * 2

    let menu = new Menu(
          this.scene,
          Space.windowWidth/2,
          Space.windowHeight/2,
          width,
          height,
          false,
          20)

    // Ai button + reminder
    let xDelta = (Space.cardSize + Space.pad) * 3/2
    let x = Space.cardSize + Space.pad/2
    let y = -20

    let iconAI = new Icon(this.scene, menu, -xDelta, y, 'AI', function() {
      UserSettings._set('vsAi', true)
      deckRegion.startGame()
    })
    let iconPVP = new Icon(this.scene, menu, 0, y, 'PVP', function() {
      UserSettings._set('vsAi', false)
      // Don't use a matchmaking code
      UserSettings._set('mmCode', '')
      deckRegion.startGame()
    })
    let iconPWD = new Icon(this.scene, menu, xDelta, y, 'PWD', function() {
      UserSettings._set('vsAi', false)
      deckRegion.startGame()
    })

    // Matchmaking text region
    y += Space.cardSize/2 + Space.pad
    let textBoxMM = this.scene.add['rexInputText'](Space.pad - width/2, y, width - Space.pad*2, Space.cardSize/2, {
      type: 'textarea',
      text: UserSettings._get('mmCode'),
      placeholder: 'Matchmaking code',
      tooltip: 'Enter any matchmaking code to only match with players with that same code.',
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
    menu.add(textBoxMM)

    // Set the callback for deckRegion start button
    deckRegion.setModeMenu(() => menu.open())
  }
}


class TutorialRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  deckDescription: string

  constructor(scene: Phaser.Scene, deckDescription: string) {
    this.init(scene, deckDescription)
  }

  init(scene, deckDescription: string): void {
    this.scene = scene
    this.container = this.scene.add.container(0, 0)
    this.deckDescription = deckDescription
  }

  create(): void {
    let s = "Now try winning a full match against a computer opponent.\n\nThe deck provided below "
    s += this.deckDescription + "\n\n"
    s += `If you want to make changes, click any of the cards in the
deck to remove them, then add cards from the choices above.`

    let txt = this.scene.add.text(Space.pad, Space.cardSize + Space.pad * 2, s, StyleSettings.basic)

    this.container.add(txt)
  }
}




