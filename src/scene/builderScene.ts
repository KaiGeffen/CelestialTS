import "phaser"
import Server from "../server"
import { collectibleCards, baseCards } from "../catalog/catalog"
import { CardImage, cardInfo } from "../lib/cardImage"
import { Style, Color, UserSettings, UserProgress, Space, Mechanics } from "../settings/settings"
import { decodeCard, encodeCard } from "../lib/codec"
import Card from "../lib/card"

// TODO Bundle these into a single import
import Button from '../lib/buttons/button'
import { SymmetricButtonSmall, ButtonNewDeck } from '../lib/buttons/backed'
import { IButtonX, IButtonPremade } from '../lib/buttons/icon'
import { UButton } from '../lib/buttons/underlined'
import { TextButton } from '../lib/buttons/text'
import { ButtonDecklist } from '../lib/buttons/decklist'

import Icon from "../lib/icon"
import Menu from "../lib/menu"
import BaseScene from "./baseScene"
import PrebuiltDeck from "../catalog/prebuiltDecks"

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

const maxCostFilter: number = 7

// TODO Take in-deck cards region out of shell and make it its own region
class BuilderSceneShell extends BaseScene {
  // Hint telling users how to add cards
  txtHint: Phaser.GameObjects.Text

  // Button allowing user to Start, or showing the count of cards in their deck
  btnStart: SymmetricButtonSmall

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
    this.btnStart = new SymmetricButtonSmall(this, 
      Space.windowWidth - 70,
      Space.windowHeight - 80,
      '').setDepth(2)

    // Deck container
    // NOTE Must set depth so that this is above the catalog, which blocks its cards so that they don't appear below the panel
    this.deckContainer = this.add.container(Space.windowWidth - Space.cardWidth, Space.windowHeight).setDepth(2)
  }

  postcreate(): void {    
    // Manage any messages that are displayed
    this.manageMessages()

    super.create()
  }

  // Get the deck code for player's current deck
  getDeckCode(): string {
    let txt = ''
    this.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
    txt = txt.slice(0, -1)

    return txt
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

  // Add card to the existing deck
  addCardToDeck(card: Card): CardImage {
    if (this.deck.length >= Mechanics.deckSize) {
      return undefined
    }

    let index = this.deck.length

    let cardImage = new CardImage(card, this.deckContainer)
    .setPosition(this.getDeckCardPosition(index))
    .moveToTopOnHover()
    .setOnClick(this.removeCardFromDeck(index))

    // When hovered, move up to make this visible
    // When exiting, return to old y
    let y0 = cardImage.container.y
    cardImage.setOnHover(() => {
      let y = Space.windowHeight - Space.cardHeight/2 - cardImage.container.parentContainer.y
      cardImage.container.setY(y)
    },
    () => {
      cardImage.container.setY(y0)
    })

    // Add this to the deck
    this.deck.push(cardImage)

    // Update start button to reflect new amount of cards in deck
    this.updateText()

    // Sort the deck, now done automatically after each card added
    this.sort()

    return cardImage
  }

  // Filter the cards shown in the catalog based on the existing filter states
  filter() {
    throw 'Filter function on BuilderSceneShell must be implemented by subclass.'
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

      // TODO Update saved deck 1234

    }
  }

  // Update the card count and deck button texts
  private updateText(): void {
    if (this.deck.length === Mechanics.deckSize) {
      this.btnStart.setText('Start')
      this.btnStart.enable()
      this.btnStart.glow()
    }
    else
    {
      this.btnStart.setText(`${this.deck.length}/${Mechanics.deckSize}`)
      this.btnStart.stopGlow()

      // TODO Grey out the button, have a disable method for button class
      // For debugging, allow sub-15 card decks locally
      if (location.port !== '4949') {
        this.btnStart.disable()
      }
    }

    this.txtHint.setVisible(this.deck.length === 0)
  }

  private getDeckCardPosition(index: number): [number, number] {
    let xPad = Space.pad

    // For resolutions below a threshold, make the overlap more intense to fit 15 cards
    let overlap = Space.windowWidth > 1300 ? Space.stackOverlap : Space.cardSize/2
    let x = index * (Space.cardSize - overlap) + xPad + Space.cardSize/2

    let y = Space.cardHeight/2 - 60// + (index%2) * Space.stackOffset

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
      // Only do this if the card isn't required in the deck, in which case it can't be removed
      if (!cardImage.required) {
        cardImage.setOnClick(this.removeCardFromDeck(i), true)
      }
    }
  }

  // Manage any messages that may need to be displayed for the user
  private manageMessages(): void {
    let msgText = UserProgress.getMessage('builder')
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
}

// Region in builder scene where the user's decks and buttons that affect them live
class DeckRegion extends Phaser.GameObjects.Container {
  // Overwrite the 'scene' property of container to specifically be a BuilderScene
  scene: BuilderSceneShell

  deckPanel

  // The index of the currently selected deck
  savedDeckIndex: number

  // List of buttons for user-defined decks
  deckBtns: Button[]

  // Create the are where player can manipulate their decks
  create(): number {
    let deckPanel = this.deckPanel = this.createDeckpanel()

    let panel = deckPanel.getElement('panel')
    let footer = deckPanel.getElement('footer')

    // Update panel when mousewheel scrolls
    this.updateOnScroll(panel)

    // Add a NEW button
    panel['add'](this.createNewButton(panel))

    // Add each of the decks
    this.createDeckButtons(panel)

    // Add a NEW, DELETE, CODE buttons after this
    // this.createNewButton(panel, footer)
    // this.createDeleteButton(panel, footer)
    // this.createCodeButton(panel, footer)

    this.deckPanel.layout()

    return this.deckPanel.width // 245
  }

  // Update the currently selected deck
  updateSavedDeck(): void {
    let index = this.savedDeckIndex
    if (index !== undefined) {
      let deck = UserSettings._get('decks')[index]
      let name = deck['name']
      let deckCode = this.scene.getDeckCode()

      let newDeck = {
        name: name,
        value: deckCode
      }

      UserSettings._setIndex('decks', index, newDeck)
    }
  }

  // Create and return the scrollable panel where premade decks go
  private createDeckpanel() { // TODO Type
    const scene = this.scene
    const width = Space.iconSeparation + Space.pad

    return scene.rexUI.add.scrollablePanel({
      x: 0,
      y: 0,
      width: width,
      height: Space.windowHeight,

      background: scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF),

      panel: {// TODO Create panel method
        child: scene.rexUI.add.fixWidthSizer({space: {
          left: Space.pad,
          right: Space.pad,
          top: 10,
          bottom: 10,
          line: 10,
        }}).addBackground(
        scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF)
        )
      },
      slider: {
        // track: this.scene.rexUI.add.roundRectangle(0, 0, 8, 100, 1, 0xE0E3EE),
        // thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 200, 3, 0x9F9999),
      },

      header: this.createHeader(),

      footer: scene.rexUI.add.fixWidthSizer(), // TODO Remove?

      space: {
        right: 10,
        bottom: Space.pad,
      }
    }).setOrigin(0)
  }

  private createHeader(): Phaser.GameObjects.GameObject {
    let scene = this.scene

    let sizer = scene.rexUI.add.fixWidthSizer({
      space: {
        left: Space.pad,
        right: Space.pad,
        top: 90,
        bottom: Space.pad,
        line: Space.pad,
      }
    })
    
    // TODO Make this constant and use throughout?
    let callback = this.premadeCallback()
    let btn = new IButtonPremade(this.scene, 0, 0,
      () => {
        // TODO Hand this to a class instead of calling ourselves
        scene.scene.launch('MenuScene', {
          menu: 'choosePremade',
          callback: callback
        })
      }
      ).setOrigin(0, 0.5)
    sizer.add(btn.icon)

    let line = this.scene.add.line(0, 0, 0, 0, Space.iconSeparation + Space.pad, 0, Color.line)
    sizer.add(line)
    
    let txtHint = this.scene.add.text(0, 0, 'My Decks:', Style.header)
    sizer.add(txtHint)

    return sizer
  }

  // TODO Callback for when a premade avatar is clicked on
  private premadeCallback(): (i: number) => () => void {
    let that = this
    return function(i: number) {
      return function() {
        that.savedDeckIndex = undefined
        console.log(i)
      }
    }
  }

  // Update the panel when user scrolls with their mouse wheel
  private updateOnScroll(panel) {
    let that = this

    this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
      // Return if the pointer is outside of the panel
      if (!panel.getBounds().contains(pointer.x, pointer.y)) {
        return
      }

      // Scroll panel down by amount wheel moved
      that.deckPanel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      that.deckPanel.t = Math.max(0, that.deckPanel.t)
      that.deckPanel.t = Math.min(0.999999, that.deckPanel.t)
    })
  }

  // Create a button for a new user-made deck at the given index
  // Add it to the list of deck buttons, and return it
  private createDeckBtn(i: number): ContainerLite {
    let deck = UserSettings._get('decks')[i]

    let name = deck === undefined ? '' : deck['name']

    let container = new ContainerLite(this.scene, 0, 0, 200, 50)
    let btn = new ButtonDecklist(container, 0, 0, name, () => {}, this.deleteDeck(i, container))

    // // Highlight this deck, if it's selected
    // if (this.savedDeckIndex === i) {
      //     // So that layout happens correctly
      //     setTimeout(() => btn.select(), 4)
      //   }

      // Set as active, select self and deselect other buttons, set the deck
      let that = this
      btn.setOnClick(function() {
        that.deckBtns.forEach(b => {if (b !== btn) b.deselect()})

        // If it's already selected, deselect it
        if (btn.selected) {
          that.savedDeckIndex = undefined
          that.scene.setDeck([])
          btn.deselect()
        }
        // Otherwise select this button
        else {
          that.savedDeckIndex = i
          btn.select()

          that.scene.setDeck(UserSettings._get('decks')[i]['value'])
        }
      })

      this.deckBtns.push(btn)

      return container
    }

    // Create a button for each deck that user has created
    private createDeckButtons(panel) {
      // Instantiate list of deck buttons
      this.deckBtns = []

      // Create the preexisting decks
      for (var i = 0; i < UserSettings._get('decks').length; i++) {
        panel.add(this.createDeckBtn(i))
      }
    }

    // Create the "New" button which prompts user to make a new deck
    private createNewButton(panel): ContainerLite {
      let that = this
      let scene = this.scene
      let f = function() {
        const maxDecks = 20

        // If user already has 9 decks, signal error instead
        if (UserSettings._get('decks').length >= maxDecks) {
          scene.signalError(`Reached max number of decks (${maxDecks}).`)
        }
        else {
          // Open up a new deck menu to input the deck's name
          // that.createNewDeckMenu(newBtn, panel)
          // TODO
          UserSettings._push('decks', {name: 'fooo', value: scene.getDeckCode()})

          // Create a new button
          let newBtn = that.createDeckBtn(that.deckBtns.length)
          panel.add(newBtn)
          that.deckPanel.layout()

          // Select that deck
          let index = that.deckBtns.length - 1
          that.deckBtns[index].onClick()

          // Scroll down to show the new deck
          that.deckPanel.t = 1
          
        }
      }

      // TODO Width and height constants
      let container = new ContainerLite(this.scene, 0, 0, 200, 50)

      let btn = new ButtonNewDeck(container, 0, 0, 'New Deck', f)

      return container
    }

    // Callback for deleting deck with given index
    private deleteDeck(i: number, container: ContainerLite): () => void {
      let that = this

      return function() {
        // Adjusted the saved user data
        UserSettings._pop('decks', i)

        // Adjust values stored in this deck region
        that.deckBtns.splice(i)
        that.savedDeckIndex = undefined
        that.scene.setDeck([])

        // Destroy the object itself
        container.destroy()

        // Format panel, then ensure we aren't below the panel
        that.deckPanel.layout()
        that.deckPanel.t = Math.min(1, that.deckPanel.t)
      }
    }

    // Create the "Code" button which prompts user to copy/paste a deck-code
    private createCodeButton(panel, footer) {
      let that = this
      // footer.add(
      //   new Button(this.scene, 0, 0, 'CODE', function() {
      //     that.createNewCodeMenu()
      //   }).txt)
    }

    // Create a new deck menu naming a new deck, pass in that deck's button to update text dynamically
    private createNewDeckMenu(btn: Button, panel): void {
      let scene = this.scene
      let height = 250

      let menu = new Menu(
        scene,
        450,
        height,
        true,
        20)

      let txtTitle = scene.add.text(0, -height/2, 'Deck Name:', Style.announcement).setOrigin(0.5, 0)
      menu.add(txtTitle)

      let textArea = scene.add['rexInputText'](
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
      }, scene)
      menu.add(textArea)

      // When menu is exited, add the deck to saved decks
      let that = this
      menu.setOnClose(function() {
        let name = textArea.text

        // If name is not empty, add it to the list of decks
        if (name !== '') {
          UserSettings._push('decks', {name: name, value: scene.getDeckCode()})
          // btn.emit('pointerdown')
        } else {
          // Destroy the panel and recreate it
          // NOTE Panel is the sizer containing the deck buttons
          panel.destroy()
          that.deckPanel.destroy()
          that.create()
        }

        menu.destroy()
      })
    }

    // Create a new code menu which shows the current decks code, and allows for pasting in a new code
    private createNewCodeMenu(): void {
      let scene = this.scene
      let that = this
      let height = 250
      let width = 600

      let menu = new Menu(
        scene,
        width,
        height,
        true,
        20)

      let txtTitle = scene.add.text(0, -height / 2, 'Deck Code:', Style.announcement).setOrigin(0.5, 0)
      menu.add(txtTitle)

      let textArea = scene.add['rexInputText'](
        0, 0, width - Space.pad * 2, Space.textAreaHeight, {
          type: 'text',
          text: scene.getDeckCode(),
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
        scene.setDeck(inputText.text)
      })
      menu.add(textArea)

      // When menu is exited, destroy this menu
      menu.setOnClose(function() {
        if (!scene.setDeck(textArea.text)) {
          scene.signalError('Deck code invalid.')
        }
        menu.destroy()
      })
    }
  }

  // Region in builder scene where filters and selectable cards live
  class CatalogRegion extends Phaser.GameObjects.Container {  
    // Overwrite the 'scene' property of container to specifically be a BuilderScene
    scene: BuilderSceneShell

    // The scrollable panel on which the catalog and filters are displayed
    panel

    // Full list of all cards in the catalog (Even those invisible)
    cardCatalog: CardImage[]

    // How many cards fit on each row in the catalog
    cardsPerRow: number

    // The costs and string that cards in the catalog are filtered for
    filterCostAry: boolean[] = []
    searchText: string = ""
    filterUnowned: boolean

    // Create this region, offset by the given width
    create(xOffset: number, filterUnowned) {
      this.cardCatalog = []
      this.filterUnowned = filterUnowned

      this.createCatalog(xOffset)

      // Create filters
      this.filter()
    }

    private createCatalog(x: number): void {
      let that = this
      let scene = this.scene

      // let width = Space.cardSize * 8 + Space.pad * 10 + 10
      // let height = Space.cardSize * 4 + Space.pad * 5
      // TODO Explain the 100 & 150
      let width = Space.windowWidth - x
      // Width must be rounded down so as to contain some number of cards tighly
      let occupiedWidth = Space.pad * 2 + 10
      let innerWidth = width - occupiedWidth
      // width -= innerWidth % (Space.cardSize + Space.pad) TODO
      this.cardsPerRow = Math.floor(innerWidth / (Space.cardSize + Space.pad))

      let height = Space.windowHeight - (Space.cardHeight - 60 + Space.pad)

      this.panel = this.createPanel(x, width, height)

      // Add buttons and fields to the header
      this.populateHeader(this.panel.getElement('header'))

      // Update panel when mousewheel scrolls
      let panel = this.panel.getElement('panel')
      scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
        // Return if the pointer is outside of the panel
        if (!panel.getBounds().contains(pointer.x, pointer.y)) {
          return
        }

        // Scroll panel down by amount wheel moved
        that.panel.childOY -= dy

        // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
        that.panel.t = Math.max(0, that.panel.t)
        that.panel.t = Math.min(0.999999, that.panel.t)
      })

      // Add each of the cards to the catalog
      let pool = collectibleCards
      for (var i = 0; i < pool.length; i++) {
        // TODO Switch back to i
        let cardImage = this.addCardToCatalog(pool[i], i)

        this.panel.getElement('panel').add(cardImage.image)

        cardImage.setScrollable(height, 10)
      }

      this.panel.layout()

      // Must add an invisible region below and above the scroller or else partially visible cards will be clickable on
      // their bottom parts, which cannot be seen and are below the scroller
      // TODO Move this to the deck container
      scene.add
      .rectangle(this.panel._x,
        this.panel.y + this.panel.height,
        Space.windowWidth, Space.windowHeight, 0x989898, 1)
      .setOrigin(0)
      .setInteractive()
    }

    private createPanel(x, width, height) {
      let scene = this.scene

      const y = 0
      return scene.rexUI.add.scrollablePanel({
        x: x,
        y: y,
        width: width,
        height: height - y,

        scrollMode: 0,

        // background: scene.rexUI.add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

        panel: {
          child: scene.rexUI.add.fixWidthSizer({
            space: {
              left: Space.pad,
              right: Space.pad - 10,
              top: 70 + Space.pad,
              bottom: Space.pad - 10,
              // item: Space.pad,
              line: Space.pad,
            }
          })
        },

        slider: {
        //   track: this.scene.rexUI.add.roundRectangle(0, 0, 8, 100, 1, 0xE0E3EE),
        //   thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 200, 3, 0x9F9999),
        },

        // mouseWheelScroller: {
          //   focus: false,
          //   speed: 1
          // },

          space: {
            // right: 10,
            // top: 10,
            // bottom: 10,
          }
        }).setOrigin(0)
      .layout()
    }

    // Populate the catalog header with filter buttons, text, fields
    private populateHeader(header: any): void {
      let that = this
      let scene = this.scene
      let container = scene.add.container().setDepth(2)

      let background = scene.add.image(0, 0, 'icon-Search')
      .setOrigin(0) // TODO 80 Search height
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, Space.windowWidth, 80), Phaser.Geom.Rectangle.Contains)

      container.add(background)

      let backButton = new TextButton(container, Space.pad, 40, '<   Back', this.scene.doExit()).setOrigin(0, 0.5)

      // Cost filters
      container.add(scene.add.text(645, 40, 'Cost:', Style.builder).setOrigin(1, 0.5))

      let btns = []
      for (let i = 0; i <= 7; i++) {
        let s = i === 7 ? '7+' : i.toString()
        let btn = new UButton(container, 670 + i * 41, 40, s)
        btn.setOnClick(that.onClickFilterButton(i, btns))

        btns.push(btn)
      }
      let btnX = new IButtonX(container, 1000, 40, this.onClearFilters(btns))

      // Add search field
      let textboxSearch = scene.add['rexInputText'](
        215, 40, 308, 40, {
          type: 'text',
          text: this.searchText,
          placeholder: 'Search',
          tooltip: 'Search for cards by text.',
          fontFamily: 'Mulish',
          fontSize: '20px',
          color: Color.textboxText,
          maxLength: 40,
          selectAll: true,
          id: 'search-field'
        })
      .on('textchange', function(inputText) {
        // Filter the visible cards based on the text
        that.searchText = inputText.text
        scene.filter()
      }, scene)
      .setOrigin(0, 0.5)

      container.add(textboxSearch)
    }

    private onClickFilterButton(thisI: number, btns: UButton[]): () => void {
      let that = this

      return function() {
        // Clear out all buttons
        for (let i = 0; i < btns.length; i++) {
          // Toggle this one, clear all others
          if (i === thisI) {
            btns[i].toggle()
            that.filterCostAry[i] = !that.filterCostAry[i]
          }
          else {
            btns[i].toggleOff()
            that.filterCostAry[i] = false
          }
        }

        that.filter()
      }
    }

    private onClearFilters(btns: UButton[]): () => void {
      let that = this

      return function() {
        for (let i = 0; i < btns.length; i++) {
          btns[i].toggleOff()
          that.filterCostAry[i] = false
        }

        that.filter()
      }
    }

    // Filter which cards can be selected in the catalog based on current filtering parameters
    filter(): void {
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
        if (filterFunction(cardImage.card)) {
          cardCount++

          cardImage.image.setVisible(true)

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

    private addCardToCatalog(card: Card, index: number): CardImage {
      let cardImage = new CardImage(card, this)

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

    // Event when a card in the catalog is clicked
    private onClickCatalogCard(card: Card): () => void {
      let scene = this.scene

      return function() {
        if (scene.addCardToDeck(card)) {
          scene.sound.play('click')
        }
        else {
          scene.signalError('Deck is full')
        }
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

      // Filter cards based on whether you have unlocked them
      let ownershipFilter = function(card: Card): boolean {
        return !that.filterUnowned || UserSettings._get('inventory')[card.id]
      }

      // Filter based on the overlap of all above filters
      let andFilter = function(card: Card): boolean {
        return costFilter(card) && searchTextFilter(card) && ownershipFilter(card)
      }

      return andFilter
    }
  }

  // The main deck builder seen for pvp mode
  export class BuilderScene extends BuilderSceneShell {
    catalogRegion: CatalogRegion
    deckRegion: DeckRegion

    // The deck code for this builder that is retained throughout user's session
    standardDeckCode: string = ''

    // The invisible background atop the catalog that keeps the 
    // cards from being clickable above where they are displayed
    invisBackgroundTop: Phaser.GameObjects.Rectangle

    constructor(params = {key: "BuilderScene"}) {
      super(params)
    }

    create(): void {
      super.precreate()

      // Add a background image
      this.add.image(0, 0, 'bg-Match').setOrigin(0).setDepth(-1)

      // Create decks region, return the width
      this.deckRegion = new DeckRegion(this)
      let width = this.deckRegion.create()

      // Create catalog region
      this.catalogRegion = new CatalogRegion(this)
      this.catalogRegion.create(width, false)

      // Add mode menu
      let modeMenu: Menu = this.createModeMenu()
      this.btnStart.setOnClick(() => modeMenu.open())

      // Set the user's deck to this deck
      this.setDeck(this.standardDeckCode)

      super.postcreate()
    }

    beforeExit(): void {
      // Save the current deck so that it persists between scenes (Session)
      this.standardDeckCode = this.getDeckCode()
    }

    // Filter the cards shown in the catalog based on the existing filter states
    filter() {
      this.catalogRegion.filter()
    }

    // Add the given card to users current deck, return whether it can be added
    // NOTE Don't always save the result because we might be doing this 15 times
    // and it's better to just save once
    // TODO We aren't paying attention to update, and are always updating
    addCardToDeck(card: Card): CardImage {
      console.log(card)
      let cardImage = super.addCardToDeck(card)

      if (cardImage) {
        // Add an on-click that updates the saved deck
        let that = this
        // CorrectIndices breaks this TODO
        cardImage.setOnClick(() => {
          that.updateSavedDeck()
        })
      }

      return cardImage
    }

    // Set the current deck, returns true if deck was valid
    setDeck(deckCode: string | Card[]): boolean {
      let result = super.setDeck(deckCode)

      if (result) {
        this.updateSavedDeck()
      }

      return result
    }

    // Update the user's currently selected deck in persistant memory
    private updateSavedDeck() {
      this.deckRegion.updateSavedDeck()
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

    // Start the game, exit from this scene and move to gameScene
    private startGame(): void {
      this.beforeExit()

      let deck = this.deck.map(function(cardImage, index, array) {
        return cardImage.card
      })
      this.scene.start("GameScene", {isTutorial: false, deck: deck})
    }
  }

  export class AdventureBuilderScene extends BuilderSceneShell {
    catalogRegion: CatalogRegion

    constructor() {
      super({
        key: "AdventureBuilderScene"
      })
    }

    create(params = null): void {
      super.precreate()

      // Create catalog region
      this.catalogRegion = new CatalogRegion(this)
      this.catalogRegion.create(0, true)

      // Set the user's required cards
      this.setRequiredCards(params.deck)

      // Change the start button to start a match vs an ai opponent with the given deck
      let that = this
      this.btnStart.setOnClick(function() {
        that.startAIMatch(params.opponent, params.id)
      })

      // Add a back button to return to the adventure scene
      // let btnBack = new Button(this, Space.pad, Space.pad, 'Back', this.doBack)

      super.postcreate()
    }

    // Filter the cards shown in the catalog based on the existing filter states
    filter() {
      this.catalogRegion.filter()
    }

    // Start a match against an ai opponent with the specified deck
    private startAIMatch(opponentDeck, id): void {
      this.beforeExit()

      let deck = this.deck.map(function(cardImage, index, array) {
        return cardImage.card
      })

      let mmCode = `ai:${opponentDeck}`

      this.scene.start("GameScene", {isTutorial: false, deck: deck, mmCode: mmCode, missionID: id})
    }

    // Set any cards that user must have in their deck for this mission, and prevent those cards from being removed
    private setRequiredCards(cards): void {
      this.setDeck(cards)

      // Remove the ability to remove any of the existing cards from the deck
      this.deck.forEach(function(cardImage, index, array) {
        cardImage.setRequired()
        cardImage.removeOnClick()
      })
    }

    private doBack(): void {
      this.scene.start("AdventureScene")
    }

    // Overwrite to prevent writing to standard's saved deck
    beforeExit(): void { }
  }
