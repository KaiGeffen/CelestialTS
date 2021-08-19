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


class BuilderSceneShell extends BaseScene {
  // Hint telling users how to add cards
  txtHint: Phaser.GameObjects.Text

  // Button allowing user to Start, or showing how many cards are in deck TODO
  btnStart: Button

  // Deck of cards in user's current deck
  deck: CardImage[] = []

  // Container containing all cards in the deck
  deckContainer: Phaser.GameObjects.Container

  precreate(): void {
    super.precreate()

    // Hint text - Tell user to click cards to add
    this.txtHint = this.add.text(
      988 - 500,
      Space.windowHeight - 120,
      'Click a card to add it to your deck',
      StyleSettings.announcement)
    .setOrigin(0.5, 0)

    // Start button - Show how many cards are in deck, and enable user to start if deck is full
    this.btnStart = new Button(this,
      988,
      Space.windowHeight - 50,
      'pog')

    // Deck container
    this.deckContainer = this.add.container(988, Space.windowHeight)
  }

  postcreate(): void {
    super.create()
  }

  // Add card to the existing deck
  addCardToDeck(card: Card): boolean {
    if (this.deck.length >= 15) {
      return false
    }

    let index = this.deck.length

    let cardImage = new CardImage(card, this.deckContainer)
    cardImage.setPosition(this.getDeckCardPosition(index))

    // TODO Pass in a callback to an exposed function instead of deeply involving in the impl of cardImage
    let image = cardImage.image
    image.setInteractive()
    image.on('pointerdown', this.removeCardFromDeck(index), this)

    // Add this to the deck
    this.deck.push(cardImage)

    // Update start button to reflect new amount of cards in deck
    this.updateText()

    // Sort the deck, now done automatically after each card added
    this.sort()

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
      deck.forEach( (card) => this.addCardToDeck(card))

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
    }
  }

  // Update the card count and deck button texts
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

    // TODO 988?
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

      // TODO
      cardImage.container.setDepth(0)
      // this.sendToBack(cardImage.container)

      // Remove the previous onclick event and add one with the updated index
      // TODO CardImage should have this as a method
      cardImage.image.removeAllListeners('pointerdown')
      cardImage.image.on('pointerdown', this.removeCardFromDeck(i), this)
    }
  }
}

export default class BuilderScene extends BuilderSceneShell {
  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]

  // Container containing all cards in the catalog
  catalogContainer: Phaser.GameObjects.Container

  // The scrollable panel which the cards are on
  panel: any

  // The deck code for this builder that is retained throughout user's session
  standardDeckCode: string = ''

  // Button that opens up the deck menu
  btnDeckMenu: Button

  constructor() {
    super({
      key: "BuilderScene"
    })
  }

  create(): void {
    super.precreate()

    this.cardCatalog = []
    this.catalogContainer = this.add.container(0, 0)

    // Add the catalog
    this.createCatalog()

    // Add filters
    this.createFilters()
    this.filter()

    // Add mode menu
    let modeMenu: Menu = this.createModeMenu()
    this.btnStart.setOnClick(() => modeMenu.open())

    // Add deck menu
    let deckMenuCallback: () => void = this.createDeckMenu()

    // Make a deck menu button with the given callback
    this.btnDeckMenu = new Button(this,
      988,
      Space.windowHeight - 100,
      'Deck',
      deckMenuCallback)

    // Set the user's deck to this deck
    this.setDeck(this.standardDeckCode)

    super.postcreate()
  }

  beforeExit(): void {
    this.standardDeckCode = this.getDeckCode()
  }

  // Filter which cards can be selected in the catalog based on current filtering parameters
  private filter(): void {
    let filterFunction: (card: Card) => boolean = this.getFilterFunction()
    let sizer = this.panel.getElement('panel')
    sizer.clear()

    let cardCount = 0
    for (var i = 0; i < this.cardCatalog.length; i++) {

      // The first card on each line should have padding from the left side
      // This is done here instead of in padding options so that stats text doesn't overflow 
      let leftPadding = 0
      if (cardCount % Space.cardsPerRow === 0) {
        leftPadding = Space.pad
      }

      let cardImage = this.cardCatalog[i]

      // Check if this card is present
      if (filterFunction(cardImage.card)) {
        cardCount++

        cardImage.image.setVisible(true)
        cardImage.txtStats.setVisible(true)

        // Add the stats text first, size down to overlap with image, resize later
        sizer.add(cardImage.txtStats, {
          padding: {
            left: leftPadding
          }
        })
        cardImage.txtStats.setSize(0, 0)

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

    // Hide the slider if all cards fit in panel
    this.panel.getElement('slider').setVisible(cardCount > 8*4)

    this.panel.layout()

    // Resize each stats text back to original size
    this.cardCatalog.forEach((cardImage) => {
      cardImage.txtStats.setSize(100, 100)

      // Move up to be atop image
      cardImage.txtStats.setDepth(1)
    })
  }

  // Start the game, exit from this scene and move to gameScene
  private startGame(): void {
    this.beforeExit()

    let deck = this.deck.map(function(cardImage, index, array) {
      return cardImage.card
    })
    this.scene.start("GameScene", {isTutorial: false, deck: deck})
  }

  private createCatalog(): void {
    let that = this

    let width = Space.cardSize * 8 + Space.pad * 10 + 10
    let height = Space.cardSize * 4 + Space.pad * 5
    let background = this['rexUI'].add.roundRectangle(0, 0, width, height, 16, ColorSettings.menuBackground, 0.7).setOrigin(0)
    this.children.sendToBack(background) // TODO needed?

    this.panel = this['rexUI'].add.scrollablePanel({
      x: 0,
      y: 0,
      width: width,
      height: height,

      scrollMode: 0,

      background: background,

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
        input: 'click',
        track: this['rexUI'].add.roundRectangle(0, 0, 20, 10, 10, 0xffffff),
        thumb: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 16, ColorSettings.background),
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
        cardInfo.setVisible(false)
      }
    })

    // Update panel when mousewheel scrolls
    this.input.on('wheel', function(pointer, gameObject, dx, dy, dz, event) {
      // Scroll panel down by amount wheel moved
      that.panel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      that.panel.t = Math.max(0, that.panel.t)
      that.panel.t = Math.min(1, that.panel.t)
    })

    // Add each of the cards to the catalog
    let pool = collectibleCards
    for (var i = 0; i < collectibleCards.length; i++) {
      let cardImage = this.addCardToCatalog(collectibleCards[i], i)

      this.panel.getElement('panel').add(cardImage.image)

      cardImage.setScrollable(height, 10)
    }

    this.panel.layout()
  }

  private addCardToCatalog(card: Card, index: number): CardImage {
    let cardImage = new CardImage(card, this.catalogContainer)
    cardImage.image.setPosition(...this.getCatalogCardPosition(index))

    // TODO cardImage should have this as an exposed method
    let image = cardImage.image
    image.setInteractive()
    image.on('pointerdown', this.onClickCatalogCard(card), this)

    // Add this cardImage to the maintained list of cardImages in the catalog
    this.cardCatalog.push(cardImage)

    return cardImage
  }

  private getCatalogCardPosition(index: number): [number, number] {
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

  private onClickCatalogCard(card: Card): () => void {
    let that = this
    return function() {
      if (that.addCardToDeck(card)) {
        that.sound.play('click')
      }
      else {
        that.sound.play('failure') 

        that.cameras.main.flash(300, 0, 0, 0.1)
      }
      
    }
  }


  // TODO explain
  filterCostAry: boolean[] = []
  searchText: string = ""

  // Create all of the objects used by the filtering system
  private createFilters(): void {
    // Add each of the number buttons
    let btnNumbers: Phaser.GameObjects.Text[] = []
    for (var i = 0; i <= 8; i++) {
      this.filterCostAry[i] = false

      let y = 50 * (i + 1)
      let btn = this.add.text(Space.windowWidth - 70, y, i.toString(), StyleSettings.basic)
      
      btn.setInteractive()
      btn.on('pointerdown', this.onClickFilterNumber(i, btn))

      btnNumbers.push(btn)
    }

    // Add the X (Clear) button
    let btnClear = this.add.text(Space.windowWidth - 70, 0, 'x', StyleSettings.basic)
    btnClear.setInteractive()
    btnClear.on('pointerdown', this.onClearFilterNumbers(btnNumbers))

    // Add text search menu
    let invisBackground = this.add.rectangle(0, 0, Space.windowWidth*2, Space.windowHeight*2, 0x000000, 0.2)
    invisBackground.setInteractive().setVisible(false).setDepth(30)

    invisBackground.on('pointerdown', function() {
      this.sound.play('close')

      textboxSearch.setVisible(false)
      invisBackground.setVisible(false)
    }, this)

    // Text input for the search
    let textboxSearch = this.add['rexInputText'](
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
      // TODO fix
      let hasNewline = inputText.text.includes('\n')
      inputText.text = inputText.text.replace('\n', '')
      
      if (hasNewline) {
        this.setVisible(false)
        invisBackground.setVisible(false)
      }

      // Filter the visible cards based on the text
      this.searchText = inputText.text
      this.filter()

      // If there is any text, set the search button to glow
      if (inputText.text !== "") {
        btnSearch.glow()
      } else {
        btnSearch.stopGlow()
      }
    }, this)

    // Search button - Opens the search field, just below the base scene buttons
    let btnSearch = new Button(this, Space.windowWidth, 100, '"i"', function() {
      this.sound.play('open')

      textboxSearch.setVisible(true)
      invisBackground.setVisible(true)

      setTimeout(function() {
        textboxSearch.setFocus()
        textboxSearch.selectAll()
        }, 20)
      }).setOrigin(1, 0)

    // Listen for esc key, and close search field if seen
    let esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    esc.on('down', function () {
      if (invisBackground.visible) {
        textboxSearch.setVisible(false)
        invisBackground.setVisible(false)

        this.sound.play('close')

        BaseScene.menuClosing = true
      }
    }, this)
  }

  private onClickFilterNumber(i: number, btn): () => void {
    let that = this

    return function() {
      that.sound.play('click')

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

  private onClearFilterNumbers(btns: Phaser.GameObjects.Text[]): () => void {
    let that = this
    return function() {
      that.sound.play('click')

      btns.forEach( (btn) => btn.clearTint())

      for (var i = 0; i < that.filterCostAry.length; i++) {
        that.filterCostAry[i] = false
      }

      that.filter()
    }
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
        return that.filterCostAry[card.cost]
      }
    }

    // Filter cards based on which expansions are enabled
    let expansionFilter = function(card: Card): boolean {
      if (UserSettings._get('useExpansion')) {
        return true
      }
      else {
        return baseCards.includes(card)
      }
    }

    // Filter cards based on if they contain the string being searched
    let searchTextFilter = function(card: Card): boolean {
      return (card.getCardText(true)).toLowerCase().includes(that.searchText.toLowerCase())
    }

    // Filter based on the overlap of all above filters
    let andFilter = function(card: Card): boolean {
      return costFilter(card) && expansionFilter(card) && searchTextFilter(card)
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
    let textBoxMM = this.add['rexInputText'](Space.pad - width/2, y, width - Space.pad*2, Space.cardSize/2, {
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

    return menu
  }

  // Create the menu for user to select a deck or enter a deck code
  private createDeckMenu(): () => void {
    let that = this

    let width = Space.iconSeparation * 3
    let height = 640

    let menu = new Menu(
      this,
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
      new Icon(this, menu, x, y, name, function() {
        let deckCode = PrebuiltDeck.get(name)

        // Set the built deck to this prebuilt deck
        that.setDeck(deckCode)

        // Update the textbox
        textboxDeckCode.text = deckCode
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
    let txtUseExpansion = this.add.text(Space.pad - width/2, y, 'Use expansion:', StyleSettings.announcement).setOrigin(0)

    let radioExpansion = this.add.circle(width/2 - Space.pad*2, y + 26, 14).setStrokeStyle(4, ColorSettings.background).setOrigin(1, 0)
    if (UserSettings._get('useExpansion')) {
      radioExpansion.setFillStyle(ColorSettings.cardHighlight)
    }

    radioExpansion.setInteractive()
    radioExpansion.on('pointerdown', function() {
      that.sound.play('click')

      // Toggle useExpansion setting
      UserSettings._set('useExpansion', !UserSettings._get('useExpansion'))

      // Reflect the current value of useExpansion setting
      radioExpansion.setFillStyle(UserSettings._get('useExpansion') ? ColorSettings.cardHighlight : undefined)

      // Filter the cards available in catalog
      that.filter()

      // Deck should grey/un-grey cards in it to reflect whether they are legal in that format
      // TODO
      // deckRegion.showCardsLegality()
    })


    // Text field for the deck-code
    y += Space.cardSize * 3/4
    let txtDeckCode = this.add.text(Space.pad - width/2, y, 'Deck code:', StyleSettings.announcement).setOrigin(0)

    y += Space.pad + Space.cardSize/2
    let textboxDeckCode = this.add['rexInputText'](Space.pad - width/2, y, width - Space.pad*2, Space.cardSize, {
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
      
      that.setDeck(inputText.text)
    })
    .on('blur', function (inputText) {
      textboxDeckCode.text = that.getDeckCode()
    })
    
    menu.add([
      txtUseExpansion,
      radioExpansion,
      txtDeckCode,
      textboxDeckCode
      ])

    // Return the callback that happens when this menu is opened
    return function() {
      menu.open()

      // Set the deck-code textbox to have current deck described
      textboxDeckCode.text = that.getDeckCode()

      // Wait long enough for the menu to be open, then select the textbox
      setTimeout(function() {
        textboxDeckCode.setFocus()
        textboxDeckCode.selectAll()
      }, 20)
    }
  }

  // TODO Should this be in shell? If used elsewhere move it up there
  // Get the deck code for player's current deck
  private getDeckCode(): string {
    let txt = ''
    this.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
    txt = txt.slice(0, -1)

    return txt
  }

  // TODO
  private showCardLegality() {

  }

  // Overwrite just to modify the deck button:
  setDeck(deckCode: string | Card[]): boolean {
    // Make the deck button glow if there are no cards in deck
    if (this.deck.length === 0) {
      this.btnDeckMenu.glowUntilClicked()
    }

    return super.setDeck(deckCode)
  }

  // Add card to the existing deck
  addCardToDeck(card: Card): boolean {
    this.btnDeckMenu.stopGlow()

    return super.addCardToDeck(card)
  }

}

