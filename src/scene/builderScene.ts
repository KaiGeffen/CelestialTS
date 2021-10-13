import "phaser"
import { collectibleCards, baseCards } from "../catalog/catalog"
import { CardImage, cardInfo } from "../lib/cardImage"
import { Style, Color, UserSettings, UserProgress, Space, Mechanics } from "../settings/settings"
import { decodeCard, encodeCard } from "../lib/codec"
import Card from "../lib/card"
import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"
import BaseScene from "./baseScene"
import PrebuiltDeck from "../catalog/prebuiltDecks"

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'

const maxCostFilter: number = 7

class BuilderSceneShell extends BaseScene {
  // Hint telling users how to add cards
  txtHint: Phaser.GameObjects.Text

  // Button allowing user to Start, or showing the count of cards in their deck
  btnStart: Button

  // Deck of cards in user's current deck
  deck: CardImage[] = []

  // Container containing all cards in the deck
  deckContainer: Phaser.GameObjects.Container

  precreate(): void {
    super.precreate()

    // Hint text - Tell user to click cards to add
    this.txtHint = this.add.text(
      Space.windowWidth/2,
      Space.windowHeight - 120,
      'Click a card to add it to your deck',
      Style.announcement)
    .setOrigin(0.5, 0)

    // Start button - Show how many cards are in deck, and enable user to start if deck is full
    this.btnStart = new Button(this,
      Space.windowWidth - Space.pad,
      Space.windowHeight - 50,
      '').setOrigin(1, 0)

    // Deck container
    // NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
    this.deckContainer = this.add.container(Space.windowWidth - 150, Space.windowHeight).setDepth(2)
  }

  postcreate(): void {
    super.create()
  }
}

export class BuilderScene extends BuilderSceneShell {
  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]

  // Container containing all cards in the catalog
  catalogContainer: Phaser.GameObjects.Container

  // The scrollable panel which the cards are on
  panel: any

  // The scrollable panel which houses all deck options
  deckPanel: any

  // How many cards fit on each row in the catalog
  cardsPerRow: number

  // The deck code for this builder that is retained throughout user's session
  standardDeckCode: string = ''

  // The costs and string that cards in the catalog are filtered for
  filterCostAry: boolean[] = []
  searchText: string = ""
  filterUnowned: boolean = true

  // List of cards available in this builder, overwritten by children
  cardpool: Card[] = collectibleCards

  // The index of the currently selected saved deck, or undefined if none
  savedDeckIndex: number

  // The invisible background atop the catalog that keeps the 
  // cards from being clickable above where they are displayed
  invisBackgroundTop: Phaser.GameObjects.Rectangle

  constructor(params = {key: "BuilderScene"}) {
    super(params)
  }

  create(): void {
    super.precreate()

    this.cardCatalog = []
    this.catalogContainer = this.add.container(0, 0)
    this.savedDeckIndex = undefined

    // Create decks region, return the width
    let width = this.createDeckRegion()

    // Add the catalog
    this.createCatalog(width)

    // Add filters
    this.filter()

    // Add mode menu
    let modeMenu: Menu = this.createModeMenu()
    this.btnStart.setOnClick(() => modeMenu.open())

    // Set the user's deck to this deck
    this.setDeck(this.standardDeckCode)

    // Manage any messages that are displayed
    this.manageMessages()

    super.postcreate()
  }

  beforeExit(): void {
    this.standardDeckCode = this.getDeckCode()
  }

  // Filter which cards can be selected in the catalog based on current filtering parameters
  // Contains an optional function to check, which is passed by children of this class
  filter(f = function(card: Card) {return true}): void {
    let filterFunction: (card: Card) => boolean = this.getFilterFunction()
    let sizer = this.panel.getElement('panel')
    sizer.clear()

    let cardCount = 0
    for (var i = 0; i < this.cardCatalog.length; i++) {

      // The first card on each line should have padding from the left side
      // This is done here instead of in padding options so that stats text doesn't overflow 
      let leftPadding = 0
      if (cardCount % this.cardsPerRow === 0) {
        leftPadding = Space.pad
      }

      let cardImage = this.cardCatalog[i]

      // Check if this card is present
      if (filterFunction(cardImage.card) && f(cardImage.card)) {
        cardCount++

        cardImage.image.setVisible(true)
        cardImage.txtStats.setVisible(true)

        // Add the stats text first, size down to overlap with image, resize later
        sizer.add(cardImage.txtStats, {
          padding: {
            left: leftPadding
          }
        })
        cardImage.txtStats.setSize(0, 100)

        // Add the image next, with padding between it and the next card
        sizer.add(cardImage.image, {
          padding: {
            right: Space.pad - 2
          }
        })
       
      }
      else
      {
        cardImage.image.setVisible(false)
        cardImage.txtStats.setVisible(false)
      }
    }

    this.panel.layout()

    // Hide the slider if all cards fit in panel
    let slider = this.panel.getElement('slider')
    
    // Taken from RexUI implementation of overflow for scrollable panel
    let isOverflow = function(panel: any): boolean {
      let t = panel.childrenMap.child
      return t.topChildOY!==t.bottomChildOY;
    }
    
    if (!isOverflow(this.panel)) {
      slider.setVisible(false)
    } else {
      slider.setVisible(true)
    }

    // Resize each stats text back to original size
    this.cardCatalog.forEach((cardImage) => {
      cardImage.txtStats.setSize(100, 100)

      // Move up to be atop image
      cardImage.txtStats.setDepth(1)
    })
  }

  // Add card to the existing deck
  addCardToDeck(card: Card): boolean {
    if (this.deck.length >= Mechanics.deckSize) {
      return false
    }

    let index = this.deck.length

    let cardImage = new CardImage(card, this.deckContainer)
    cardImage.setPosition(this.getDeckCardPosition(index))
    cardImage.setOnClick(this.removeCardFromDeck(index))

    // Add this to the deck
    this.deck.push(cardImage)

    // Update start button to reflect new amount of cards in deck
    this.updateText()

    // Sort the deck, now done automatically after each card added
    this.sort()

    this.updateSavedDeck()

    this.filter()

    return true
  }

  // Set thek current deck, returns true if deck was valid
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
      deck.forEach( (card) => this.addCardToDeck(card))

      this.updateSavedDeck()

      return true
    }
  }

  // Remove the card from deck which has given index
  private removeCardFromDeck(index: number): () => void {
    let that = this
    return function() {
      // Play a sound
      that.sound.play('click')

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

      that.updateSavedDeck()

      that.filter()
    }
  }

  // TODO This both updates the saved deck and the quantities of cards in catalog, rename
  // Update the user's saved deck to reflect its new contents
  private updateSavedDeck(): void {
    // For each card in the catalog, update its displayed quantity to reflect the new quantity
    this.cardCatalog.forEach( cardImage => {
      let id = cardImage.card.id
      let amtInDeck = this.deck.filter(ci => ci.card.id === id).length
      let quantity = UserSettings._get('inventory')[id] - amtInDeck

      cardImage.setQuantity(quantity)
    })

    let index = this.savedDeckIndex
    if (index !== undefined) {
      let deck = UserSettings._get('decks')[index]
      let name = deck['name']
      let deckCode = this.getDeckCode()

      let newDeck = {
        name: name,
        value: deckCode
      }

      UserSettings._setIndex('decks', index, newDeck)
    }
  }

  // Update the card count and deck button texts
  private updateText(): void {
    if (this.deck.length === Mechanics.deckSize) {
      this.btnStart.text = 'Start'
      this.btnStart.input.enabled = true
      this.btnStart.glow()
    }
    else
    {
      this.btnStart.text = `${this.deck.length}/${Mechanics.deckSize}`
      this.btnStart.stopGlow()

      // TODO Grey out the button, have a disable method for button class
      // For debugging, allow sub-15 card decks locally
      if (location.port !== '4949') {
        this.btnStart.input.enabled = false
      }
    }

    // Deck button stops glowing if there are any cards in it
    // if (this.deck.length > 0) {
    //   this.btnD.stopGlow()
    // }

    this.txtHint.setVisible(this.deck.length === 0)
  }

  private getDeckCardPosition(index: number): [number, number] {
    let xPad = Space.pad
    let x = index * (Space.cardSize - Space.stackOverlap) + xPad + Space.cardSize/2

    let y = Space.pad/2 + Space.cardSize/2 + (index%2) * Space.stackOffset

    return [-x, -y]
  }

  // Sort by cost all cards in the deck
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

  // Set each card in deck to have the right position and onClick events for its index
  private correctDeckIndices(): void {
    for (var i = 0; i < this.deck.length; i++) {
      let cardImage = this.deck[i]

      cardImage.setPosition(this.getDeckCardPosition(i))

      // Ensure that each card is above all cards to its left
      cardImage.container.parentContainer.sendToBack(cardImage.container)

      // Remove the previous onclick event and add one with the updated index
      cardImage.setOnClick(this.removeCardFromDeck(i), true)
    }
  }

  // Start the game, exit from this scene and move to gameScene
  private startGame(): void {
    this.beforeExit()

    let deck = this.deck.map(function(cardImage, index, array) {
      return cardImage.card
    })
    this.scene.start("GameScene", {isTutorial: false, deck: deck})
  }

  private createCatalog(x: number): void {
    let that = this

    // let width = Space.cardSize * 8 + Space.pad * 10 + 10
    // let height = Space.cardSize * 4 + Space.pad * 5
    // TODO Explain the 100 & 150
    let width = Space.windowWidth - x
    // Width must be rounded down so as to contain some number of cards tighly
    let occupiedWidth = Space.pad * 2 + 10
    let innerWidth = width - occupiedWidth
    width -= innerWidth % (Space.cardSize + Space.pad)
    this.cardsPerRow = Math.floor(innerWidth / (Space.cardSize + Space.pad))

    let height = Space.windowHeight - 150

    this.panel = this['rexUI'].add.scrollablePanel({
      x: x,
      y: 0,
      width: width,
      height: height,

      scrollMode: 0,

      background: this['rexUI'].add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

      panel: {
        child: this['rexUI'].add.fixWidthSizer({
          space: {
            // left: Space.pad,
            right: Space.pad - 10,
            top: Space.pad - 10,
            bottom: Space.pad - 10,
            // item: Space.pad,
            line: Space.pad,
          }
        })
      },

      slider: {
        input: 'drag',
        track: this['rexUI'].add.roundRectangle(0, 0, 20, 10, 10, 0xffffff),
        thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, Color.sliderThumb),
      },

      header: this['rexUI'].add.fixWidthSizer({
        height: 100,
        align: 'center',
        space: {
          left: Space.pad,
          right: Space.pad,
          top: Space.pad,
          bottom: Space.pad,
          item: Space.pad,
          line: Space.pad
        }
        }).addBackground(
          this['rexUI'].add.roundRectangle(0, 0, 0, 0,
            {tl: 0, tr: 16, bl: 0, br: 16},
            Color.menuHeader),
          {right: 10, bottom: 10}
          ),
      

      space: {
        right: 10,
        top: 10,
        bottom: 10,
      }
    }).setOrigin(0)
    .layout()

    // Add buttons and fields to the header
    this.populateHeader(this.panel.getElement('header'))

    // Update panel when mousewheel scrolls
    this.input.on('wheel', function(pointer, gameObject, dx, dy, dz, event) {
      // Scroll panel down by amount wheel moved
      that.panel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      that.panel.t = Math.max(0, that.panel.t)
      that.panel.t = Math.min(1, that.panel.t)
    })

    // Add each of the cards to the catalog
    let pool = this.cardpool
    for (var i = 0; i < pool.length; i++) {
      let cardImage = this.addCardToCatalog(pool[i], i)

      this.panel.getElement('panel').add(cardImage.image)

      cardImage.setScrollable(height, 10)
    }

    this.panel.layout()

    // Must add an invisible region below and above the scroller or else partially visible cards will be clickable on
    // their bottom parts, which cannot be seen and are below the scroller
    let invisBackgroundBottom = this.add
      .rectangle(this.panel._x, this.panel.height, Space.windowWidth, Space.cardSize, 0x000000, 0)
      .setOrigin(0)
      .setInteractive()

    this.invisBackgroundTop = this.add
      .rectangle(this.panel._x, this.panel.getElement('header').height, Space.windowWidth, Space.cardSize, 0x000000, 0)
      .setOrigin(0, 1)
      .setInteractive()
  }

  // Create the are where player can manipulate their decks
  private createDeckRegion(): number {
    let width = Space.iconSeparation + Space.pad

    let region = this.deckPanel = this['rexUI'].add.scrollablePanel({
      x: 0,
      y: 10,
      width: width,
      height: 0,

      background: this.add.rectangle(0, 0, width, Space.windowHeight, Color.menuHeader),

      panel: {
        child: this['rexUI'].add.sizer({
          orientation: 'vertical',
          anchor: 'centerY',
          space: {
            // left: Space.pad,
            right: Space.pad - 10,
            top: Space.pad - 10,
            bottom: Space.pad - 10,
            // item: Space.pad,
            line: Space.pad,
          }
        })
      },

      header: this['rexUI'].add.label({
                orientation: 0,
                text: this.add.text(0, 0, '  Decks:', Style.announcement),
            }),
      space: {
        right: 10,
        top: 10,
        bottom: 10,
      }
    }).setOrigin(0)

    // Add each of the decks
    let that = this
    let decks: [name: string, value: string][] = UserSettings._get('decks')
    let btns: Button[] = []

    let createDeckBtn = function(i: number): Button {
      let deck = UserSettings._get('decks')[i]

      let name = deck === undefined ? '' : deck['name']

      let btn = new Button(that, 0, 0, name).setDepth(4)

      // Set as active, glow and stop others glowing, set the deck
      btn.setOnClick(function() {
        btns.forEach(b => {if (b !== btn) b.stopGlow()})

        // If it's already selected, deselect it
        if (btn.isGlowing()) {
          that.savedDeckIndex = undefined
          btn.stopGlow()
        }
        // Otherwise select this button
        else {
          that.savedDeckIndex = i
          btn.glow(false)

          that.setDeck(UserSettings._get('decks')[i]['value'])
        }        
      })
      
      btns.push(btn)

      return btn
    }

    // Create the preexisting decks
    for (var i = 0; i < UserSettings._get('decks').length; i++) {
      let btn = createDeckBtn(i)

      region.add(btn)
    }

    // Add a +, DELETE, CODE buttons after this
    region.add(
      new Button(this, 0, 0, '+', function() {
        // If user already has 9 decks, signal error instead
        if (UserSettings._get('decks').length >= 9) {
          this.signalError()
        }
        else {
          // Create a new button
          let newBtn = createDeckBtn(btns.length)
          newBtn.setOrigin(0.5)
        
          // Add it before the 3 function buttons (+, DEL, CODE)
          region.add(newBtn, {
            index: -3
          }).layout()

          this.createNewDeckMenu(newBtn, region)
        }
      }))

    region.add(
      new Button(this, 0, 0, 'DELETE', function() {
        if (that.savedDeckIndex === undefined) {
          that.signalError('No deck selected')
        } else {
          // NOTE Have to do this because the glow is separate from the region
          btns[that.savedDeckIndex].stopGlow()
          btns[that.savedDeckIndex].destroy()

          UserSettings._pop('decks', that.savedDeckIndex)
          
          region.destroy()
          that.createDeckRegion()
        }
      }))

    region.add(
      new Button(this, 0, 0, 'CODE', function() {
        this.createNewCodeMenu()
      }))

    region.layout()

    return region.width
  }

  // Create a new deck menu naming a new deck, pass in that deck's button to update text dynamically
  private createNewDeckMenu(btn: Button, region): void {
    let height = 250

    let menu = new Menu(
      this,
      450,
      height,
      true,
      20)

    let txtTitle = this.add.text(0, -height/2, 'Deck Name:', Style.announcement).setOrigin(0.5, 0)
    menu.add(txtTitle)

    let textArea = this.add['rexInputText'](
      0, 0, 350, Space.textAreaHeight, {
      type: 'text',
      text: '',
      placeholder: 'Name',
      tooltip: 'The name for your new deck.',
      fontFamily: 'Mulish',
      fontSize: '60px',
      color: Color.button,
      align: Phaser.Display.Align.BOTTOM_RIGHT,
      border: 3,
      borderColor: '#000',
      backgroundColor: Color.textAreaBackground,
      maxLength: 8,
      selectAll: true,
      id: 'search-field'
    })
      .on('textchange', function(inputText) {
        btn.setText(inputText.text)
      }, this)
    menu.add(textArea)

    // When menu is exited, add the deck to saved decks
    let that = this
    menu.setOnClose(function() {
      let name = textArea.text

      // If name is not empty, add it to the list of decks
      if (name !== '') {
        UserSettings._push('decks', {name: name, value: that.getDeckCode()})
        btn.emit('pointerdown')
      } else {
        btn.destroy()
        region.layout()
      }

      menu.destroy()
    })
  }

  // Create a new code menu which shows the current decks code, and allows for pasting in a new code
  private createNewCodeMenu(): void {
    let that = this
    let height = 250
    let width = 600

    let menu = new Menu(
      this,
      width,
      height,
      true,
      20)

    let txtTitle = this.add.text(0, -height / 2, 'Deck Code:', Style.announcement).setOrigin(0.5, 0)
    menu.add(txtTitle)

    let textArea = this.add['rexInputText'](
      0, 0, width - Space.pad * 2, Space.textAreaHeight, {
      type: 'text',
      text: that.getDeckCode(),
      placeholder: '',
      tooltip: "Copy the code for your current deck, or paste in another deck's code to create that deck.",
      fontFamily: 'Mulish',
      fontSize: '60px',
      color: Color.button,
      align: Phaser.Display.Align.BOTTOM_RIGHT,
      border: 3,
      borderColor: '#000',
      backgroundColor: Color.textAreaBackground,
      maxLength: 4 * Mechanics.deckSize,
      selectAll: true,
      id: 'search-field'
    })
      .on('textchange', function(inputText) {
        that.setDeck(inputText.text)
      })
    menu.add(textArea)

    // When menu is exited, destroy this menu
    menu.setOnClose(function() {
      if (!that.setDeck(textArea.text)) {
        that.signalError('Deck code invalid.')
      }
      menu.destroy()
    })
  }

  // Populate the catalog header with buttons, text, fields
  private populateHeader(header: any): void {
    let that = this

    let txtHint = this.add.text(0, 0, 'Cost:', Style.announcement)


    // Add search field
    let textboxSearch = this.add['rexInputText'](
      0, 0, 350, txtHint.height, {
      type: 'text',
      text: this.searchText,
      placeholder: 'Search',
      tooltip: 'Search for cards by text.',
      fontFamily: 'Mulish',
      fontSize: '60px',
      color: Color.button,
      align: Phaser.Display.Align.BOTTOM_RIGHT,
      border: 3,
      borderColor: '#000',
      // backgroundColor: Color.textAreaBackgroundAlt,
      maxLength: 12,
      selectAll: true,
      id: 'search-field'
    })
      .on('textchange', function(inputText) {
        // Filter the visible cards based on the text
        this.searchText = inputText.text
        this.filter()
      }, this)
    header.add(textboxSearch)

    let btnOwned = new Button(this, 0, 0, 'Own', function() {
      if (that.filterUnowned) {
        btnOwned.stopGlow()
        that.filterUnowned = false
      }
      else {
        btnOwned.glow(false)
        that.filterUnowned = true
      }
      
      that.filter()
    })
      .setFontSize(parseInt(Style.announcement.fontSize))
      .setDepth(4)
    
    // Timeout so that grid layout is complete, glow if filtering by ownership
    setTimeout(() => {
      if (that.filterUnowned) btnOwned.glow(false)
    }, 10)

    header.add(btnOwned)
    header.addNewLine()

    // Add a hint
    header.add(txtHint)

    // Add each of the number buttons and the X button
    let btns: Button[] = []
    for (var i = 0; i <= maxCostFilter; i++) {
      this.filterCostAry[i] = false
      let s = i === maxCostFilter ? `${i}+` : i.toString()
      let btn = new Button(this, 0, 0, s)

      btn.setOnClick(this.onClickFilterButton(i, btn))
        .setFontSize(parseInt(Style.announcement.fontSize))
        .setDepth(4)

      header.add(btn)
      btns.push(btn)
    }

    let btn = new Button(this, 0, 0, 'X', this.onClearFilters(btns))
      .setFontSize(parseInt(Style.announcement.fontSize))
      .setDepth(4)
    header.add(btn)
  }

  private onClickFilterButton(i: number, btn: Button): () => void {
    let that = this

    return function() {
      if (!btn.isGlowing()) {
        btn.glow(false)
      } else {
        btn.stopGlow()
      }
      
      that.filterCostAry[i] = !that.filterCostAry[i]
      that.filter()
    }   
  }

  private onClearFilters(btns: Button[]): () => void {
    let that = this

    return function() {
      btns.forEach( (btn) => btn.stopGlow())

      for (var i = 0; i < that.filterCostAry.length; i++) {
        that.filterCostAry[i] = false
      }

      that.filter()
    }
  }  

  private addCardToCatalog(card: Card, index: number): CardImage {
    let cardImage = new CardImage(card, this.catalogContainer)

    cardImage.image.setPosition(...this.getCatalogCardPosition(index))
    cardImage.setOnClick(this.onClickCatalogCard(card))

    // Add this cardImage to the maintained list of cardImages in the catalog
    this.cardCatalog.push(cardImage)

    return cardImage
  }

  private getCatalogCardPosition(index: number): [number, number] {
    let col = index % this.cardsPerRow
    let xPad = (1 + col) * Space.pad
    let x = col * Space.cardSize + xPad + Space.cardSize / 2

    let row = Math.floor(index / this.cardsPerRow)
    let yPad = (1 + row) * Space.pad
    let y = row * Space.cardSize + yPad + Space.cardSize / 2

    return [x, y]
  }

  private onClickCatalogCard(card: Card): () => void {
    let that = this
    return function() {
      if (that.addCardToDeck(card)) {
        that.sound.play('click')
      }
      else {
        that.signalError('Deck is full')
      }
      
    }
  }

  // Remove all of the filter objects, used by children of this class
  removeFilterObjects(): void {
    // TODO Fix for new filters
    // this.filterObjects.forEach(function(obj) {obj.destroy()})

    // // Remove the enter event that opens up search
    // this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).removeAllListeners()
  }

  // Returns a function which filters cards to see which are selectable
  private getFilterFunction(): (card: Card) => boolean {
    let that = this

    // Filter cards based on their cost
    let costFilter = function(card: Card): boolean {
      // If no number are selected, all cards are fine
      if (!that.filterCostAry.includes(true)) {
        return true
      }
      else {
        // The last filtered cost includes everything more than it
        return that.filterCostAry[Math.min(card.cost, maxCostFilter)]
      }
    }

    // Filter cards based on if they contain the string being searched
    let searchTextFilter = function(card: Card): boolean {
      // If searching for 'common', return false to uncommon cards
      if (that.searchText.toLowerCase() === 'common' && card.getCardText().toLowerCase().includes('uncommon')) {
        return false
      }
      return (card.getCardText()).toLowerCase().includes(that.searchText.toLowerCase())
    }

    // Filter cards based on whether you have more of them in your inventory
    let ownershipFilter = function(card: Card): boolean {
      let moreInInventory = UserSettings._get('inventory')[card.id] > that.deck.filter(ci => ci.card.id === card.id).length

      return !that.filterUnowned || moreInInventory
    }

    // Filter based on the overlap of all above filters
    let andFilter = function(card: Card): boolean {
      return costFilter(card) && searchTextFilter(card) && ownershipFilter(card)
    }

    return andFilter
  }

  // Create the menu for user to select which mode to play in
  private createModeMenu(): Menu {
    // Visible background, which does nothing when clicked
    let width = Space.cardSize * 5 + Space.pad * 4
    let height = Space.cardSize * 3 + Space.pad * 2

    let menu = new Menu(
          this,
          width,
          height,
          false,
          20)

    // Ai button + reminder
    let xDelta = (Space.cardSize + Space.pad) * 3/2
    let x = Space.cardSize + Space.pad/2
    let y = -20
    let that = this

    let iconAI = new Icon(this, menu, -xDelta, y, 'AI', function() {
      UserSettings._set('vsAi', true)
      that.startGame()
    })
    let iconPVP = new Icon(this, menu, 0, y, 'PVP', function() {
      UserSettings._set('vsAi', false)
      // Don't use a matchmaking code
      UserSettings._set('mmCode', '')
      that.startGame()
    })
    let iconPWD = new Icon(this, menu, xDelta, y, 'PWD', function() {
      UserSettings._set('vsAi', false)
      that.startGame()
    })

    // Matchmaking text region
    y += Space.cardSize/2 + Space.pad
    let textBoxMM = this.add['rexInputText'](Space.pad - width/2, y,
      width - Space.pad*2,
      Space.textAreaHeight,
      {
      type: 'textarea',
      text: UserSettings._get('mmCode'),
      placeholder: 'Matchmaking code',
      tooltip: 'Enter any matchmaking code to only match with players with that same code.',
      fontFamily: 'Mulish',
      fontSize: '36px',
      color: Color.textArea,
      border: 3,
      borderColor: '#000',
      backgroundColor: Color.textAreaBackground,
      maxLength: 24
    })
    .setOrigin(0)
    .on('textchange', function (inputText) {
      inputText.text = inputText.text.replace('\n', '')
      UserSettings._set('mmCode', inputText.text)
    })
    menu.add(textBoxMM)

    return menu
  }

  // Manage any messages that may need to be displayed for the user
  manageMessages(): void {
    let msgText = UserProgress.getMessage('builder')
    if (msgText !== undefined) {
      // TODO Remove or change since ux changed
      // Make the deck button glow to catch attention

      // Open a window informing user of information
      let menu = new Menu(
        this,
        800,
        300,
        true,
        25)

      let txtTitle = this.add.text(0, -110, 'Welcome!', Style.announcement).setOrigin(0.5)
      let txtMessage = this.add['rexBBCodeText'](0, -50, msgText, Style.basic).setOrigin(0.5, 0)
      
      menu.add([txtTitle, txtMessage])
    }
  }

  // TODO Should this be in shell? If used elsewhere move it up there
  // Get the deck code for player's current deck
  getDeckCode(): string {
    let txt = ''
    this.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
    txt = txt.slice(0, -1)

    return txt
  }

  // TODO
  private showCardLegality() {

  }
}

export class TutorialBuilderScene extends BuilderScene {
  // Dictionary from tutorial name to the code for the deck the user used for that tutorial
  tutorialDeckCodes: Record<string, string> = {}

  cardpool: Card[]
  defaultDeck: string
  lastScene: string
  deckDescription: string
  tutorialName: string
  opponentDeck: string

  constructor(params) {
    super({
      key: "TutorialBuilderScene"
    })

    if (params !== undefined) {
      this.init(params)
    }
  }

  init(params): void {
    this.cardpool = params.cardpool
    this.defaultDeck = params.defaultDeck
    this.lastScene = params.lastScene
    this.deckDescription = params.deckDescription
    this.tutorialName = params.tutorialName
    this.opponentDeck = params.opponentDeck
  }

  create(): void {
    super.create()

    // Change the start button to start a match vs ai
    let that = this
    this.btnStart.setOnClick(function() {that.startTutorialMatch()}, true)

    this.filterUnowned = false

    this.removeHeaderAndDeckRegion()

    this.createDescriptionText()

    // Add a Back button
    new Button(this,
      Space.windowWidth - Space.pad,
      Space.windowHeight - 150,
      'Back',
      this.onBack()).setOrigin(1, 0)

    // Add a Reset button
    new Button(this,
      Space.windowWidth - Space.pad,
      Space.windowHeight - 100,
      'Reset',
      this.onReset()).setOrigin(1, 0)

    // If the user has made a deck for this tutorial, use it
    let usersCustomDeck = this.tutorialDeckCodes[this.tutorialName]
    if (usersCustomDeck !== undefined) {
      this.setDeck(usersCustomDeck)
    }
    else {
      this.setDeck(this.defaultDeck)
    }
  }

  // Start the game, exit from this scene and move to gameScene
  private startTutorialMatch(): void {
    this.beforeExit()

    let deck = this.deck.map(function(cardImage, index, array) {
      return cardImage.card
    })

    this.scene.start("TutorialScene2", {
      isTutorial: true,
      tutorialNumber: 2,
      deck: deck,
      tutorialName: this.tutorialName,
      opponentDeck: this.opponentDeck
    })
  }

  // Remove the header above and deck menu at left, which aren't present during the tutorial
  private removeHeaderAndDeckRegion(): void {
    this.panel.getElement('header').destroy()
    this.panel.width = Space.windowWidth
    this.deckPanel.destroy()
    this.invisBackgroundTop.destroy()

    // Fixes card layout
    this.filter()
  }

  private createDescriptionText(): void {
    let s = "Now try winning a full match against a computer opponent.\n\nThe deck provided below "
    s += this.deckDescription + "\n\n"
    s += `If you want to make changes, click any of the cards in the
deck to remove them, then add cards from the choices above.`

    let txt = this.add.text(0, 0, s, Style.basic)
    this.panel.setX(Space.pad)
    this.panel.add(txt, {padding: {left: Space.pad, right: Space.pad, bottom: Space.pad}})
    this.filter()
  }

  private onBack(): () => void {
    let that = this
    return function() {
      that.beforeExit()
      that.scene.start(that.lastScene)
    }
  }

  private onReset(): () => void {
    let that = this
    return function() {
      that.setDeck(that.defaultDeck)
    }
  }

  // Overwrite to undo the background shifting
  filter(f = function(card: Card) {return true}): void {
    super.filter(f)
  }

  beforeExit(): void {
    // Save user's current deck to this tutorials custom deck
    this.tutorialDeckCodes[this.tutorialName] = this.getDeckCode()
  }
}

export class DraftBuilderScene extends BuilderScene {
  // Users win / loss record with their current draft deck
  matchRecord: [number, number] = [0, 0]

  // Button to reset the current draft run
  btnReset: Button

  // Text describing user's current win/loss record
  txtRecord: Phaser.GameObjects.Text

  // The last filter which gives random cards
  lastFilter: (card: Card) => boolean

  constructor() {
    super({
      key: "DraftBuilderScene"
    })
  }

  create(): void {
    // Show the user their draft results
    let record = UserSettings._get('draftRecord')
    let s = `Wins: ${record[0]} | Losses: ${record[1]}`
    this.txtRecord = this.add.text(500, 300, s, Style.announcement)
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(1) // Above catalog background

    super.create()

    // Set the user's deck to their saved deck
    this.setDeck(UserSettings._get('draftDeckCode'))

    // Remove all of the objects relating to filtering
    // this.removeFilterObjects()

    // Add a button to quit the current run
    this.btnReset = new Button(this, Space.windowWidth - Space.pad, Space.windowHeight - 100, 'Reset', this.onReset).setOrigin(1, 0)

    // Change the start button to start a match vs a draft opponent
    let that = this
    this.btnStart.setOnClick(function() {that.startDraftMatch()}, true)

    // Give the user a choice of cards to draft
    this.giveRandomChoices(true)

    // Each card in catalog will also reroll the drafting options when clicked
    this.cardCatalog.forEach(function(cardImage, index, ary) {
      cardImage.setOnClick(function() {
        that.giveRandomChoices()
      })
    })
  }

  // Randomly pick 4 cards for user to choose from
  private giveRandomChoices(useLastSeed: boolean = false): void {
    let newPool = []
    while (newPool.length < 4) {

      // Randomly select a card from all cards
      let card = collectibleCards[Math.floor(Math.random() * collectibleCards.length)]

      // Only add the card if it isn't in the pool yet
      if (!newPool.includes(card)) {
        newPool.push(card)
      }
    }

    // Filter based on if the card is in the pool
    if (useLastSeed && this.lastFilter !== undefined) {
      // Don't change lastFilter
    }
    else if (this.deck.length < Mechanics.deckSize) {
      this.lastFilter = function(card: Card) {
        return newPool.includes(card)
      }
    }
    // If user has a full deck, filter away all cards
    else {
      this.lastFilter = function(card: Card) {
        return false
      }
    }

    this.filter(this.lastFilter)
  }

  // Start a match against a draft opponent
  private startDraftMatch(): void {
    this.beforeExit()

    let deck = this.deck.map(function(cardImage, index, array) {
      return cardImage.card
    })

    this.scene.start("draftMatchScene", {deck: deck})
  }

  private onReset(): void {
    UserSettings._set('draftDeckCode', '')
    UserSettings._set('draftRecord', [0, 0])

    // Reset the choice of 4 cards used
    this.lastFilter = undefined

    this.scene.restart()
  }

  // Overwrite to prevent writing to standard's saved deck
  beforeExit(): void {
  }

  // Remove ability to remove cards from deck by clicking on them
  addCardToDeck(card: Card): boolean {
    let result = super.addCardToDeck(card)

    // Remove any on click events
    this.deck.forEach(function(cardImage, index, array) {cardImage.image.removeAllListeners('pointerdown')})

    // Update the user's currently saved deck code
    UserSettings._set('draftDeckCode', this.getDeckCode())

    // Make the match results visible if deck is now full
    if (this.deck.length === Mechanics.deckSize) {
      this.txtRecord.setVisible(true)
    }

    return result
  }

  // Manage any messages that may need to be displayed for the user
  manageMessages(): void {
    let msgText = UserProgress.getMessage('draft')
    if (msgText !== undefined) {

      // Open a window informing user of information
      let menu = new Menu(
        this,
        800,
        300,
        true,
        25)

      let txtTitle = this.add.text(0, -110, 'Onward!', Style.announcement).setOrigin(0.5)
      let txtMessage = this.add.text(0, -50, msgText, Style.basic).setOrigin(0.5, 0)
      
      menu.add([txtTitle, txtMessage])
    }
  }
}
