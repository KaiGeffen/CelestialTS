import "phaser"
import { collectibleCards, tokenCards, Card } from "../catalog/catalog"
import { CardImage, addCardInfoToScene } from "../lib/cardImage"
import { buttonStyle, filterButtonStyle, space } from "../settings"
import { decodeCard, encodeCard } from "../lib/codec"


const catalog = collectibleCards

const DECK_PARAM = 'deck'
const SOUNDS = [
  'success',
  'failure',
  'click',
  'close',
  'play',
  'pass',
  'draw',
  'shuffle',
  'resolve'
]

// The card hover text for this scene, which is referenced in the regions
var cardInfo: Phaser.GameObjects.Text

// Settings for the game that are passed to the GameScene
var gameSettings = {
  vsAi: false,
  autoRecap: false,
  mmCode: ''
}
if (location.port === '4949') {
  gameSettings.vsAi = true
}
// The last deck of cards the player had, which gets repopulated after their match
var lastDeck: Card[] = []


export class BuilderScene extends Phaser.Scene {
  catalogRegion
  deckRegion
  filterRegion
  menuRegion

  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  init(): void {
    this.deckRegion = new DeckRegion(this)
    this.catalogRegion = new CatalogRegion(this, this.deckRegion)
    this.filterRegion = new FilterRegion(this, this.catalogRegion)
    this.menuRegion = new MenuRegion(this, this.deckRegion)

    cardInfo = addCardInfoToScene(this)
  }

  preload(): void {
    // Load all of the card and token images
    this.load.path = "assets/"

    catalog.forEach( (card) => {
      this.load.image(card.name, `images/${card.name}.png`)
    })
    tokenCards.forEach( (card) => {
      this.load.image(card.name, `images/${card.name}.png`)
    })

    // Load all audio
    SOUNDS.forEach( (sound) => {
      this.load.audio(sound, `sfx/${sound}.wav`)
    })
  }
  
  create(): void {
    this.catalogRegion.create()
    this.deckRegion.create()
    this.filterRegion.create()
    this.menuRegion.create()
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

  create(): void {
    for (var i = catalog.length - 1; i >= 0; i--) {
      this.addCard(catalog[i], i)
    }
    if (catalog.length > space.cardsPerPage) {
      let x = space.cardsPerRow * (space.cardSize + space.pad) + space.pad
      let y = 2 * (space.cardSize + space.pad) + space.pad/2

      // TODO If these are on the main scene instead of in a container, they need to be inactive
      // When the menu is open, or they will be above the invisible exit rectangle
      // Better to have these be on this catalog or maybe on a container which has the card
      // container
      let btnNext = this.scene.add.text(x, y, '>', buttonStyle).setOrigin(0, 0)
      btnNext.setInteractive()
      btnNext.on('pointerdown', this.goNextPage())
      this.container.add(btnNext)

      let btnPrev = this.scene.add.text(x, y, '<', buttonStyle).setOrigin(0, 1)
      btnPrev.setInteractive()
      btnPrev.on('pointerdown', this.goPrevPage())
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
    image.setDisplaySize(space.cardSize, space.cardSize)

    image.setInteractive()
    image.on('pointerdown', this.onClick(card), this)

    this.cardContainer.add(image)

    this.cardImages.push(new CardImage(card, image))
  }

  private getCardPosition(index: number): [number, number] {
    let pageNumber = Math.floor(index / space.cardsPerPage)
    index = index % space.cardsPerPage

    let col = index % space.cardsPerRow
    let xPad = (1 + col) * space.pad
    let x = col * space.cardSize + xPad + space.cardSize / 2
    x += pageNumber * space.pageOffset

    let row = Math.floor(index / space.cardsPerRow)
    let yPad = (1 + row) * space.pad
    let y = row * space.cardSize + yPad + space.cardSize / 2

    return [x, y]
  }

  private goNextPage(): () => void {
    let that = this
    return function() {
      let numVisibleCards = that.cardImages.filter(function(cardImage) {
        return cardImage.image.visible
      }).length

      if (numVisibleCards > (that.currentPage + 1) * space.cardsPerPage) {
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
    this.cardContainer.x = -(pageNum * space.pageOffset)
    this.currentPage = pageNum
  }
}


class DeckRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  deck: CardImage[] = []
  btnStart: Phaser.GameObjects.Text
  btnMenu: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene): void {
    this.scene = scene
    this.container = this.scene.add.container(988, 650)
  }

  create(): void {
    // Sort button
    let btnSort = this.scene.add.text(0, -100, 'Sort', buttonStyle)
    btnSort.setInteractive()

    let that = this
    btnSort.on('pointerdown', function (event) {
      that.scene.sound.play('click')

      that.sort()
    })

    this.container.add(btnSort)

    // Start button
    this.btnStart = this.scene.add.text(0, -50, '', buttonStyle)

    this.btnStart.setInteractive()
    this.btnStart.on('pointerdown', function (event) {
      that.scene.sound.play('click')

      lastDeck = that.deck.map( (cardImage) => cardImage.card)
      this.scene.scene.start("GameScene", {deck: lastDeck, settings: gameSettings})
    })
    
    this.updateStartButton()
    
    this.container.add(this.btnStart)

    // Menu button, the callback is set by menu region during its init
    this.btnMenu = this.scene.add.text(0, -150, 'Menu', buttonStyle)
    this.container.add(this.btnMenu)

    // Add all cards that were in the last deck the player had, if any
    let lastDeckCode = lastDeck.map((card) => card.id).join(':')
    this.setDeck(lastDeckCode)
  }

  addCard(card: Card): boolean {
    if (this.deck.length >= 15) {
      return false
    }

    let index = this.deck.length
    var image: Phaser.GameObjects.Image
    var [x, y] = this.getCardPosition(index)
    
    image = this.scene.add.image(x, y, card.name)
    image.setDisplaySize(100, 100)

    image.setInteractive()
    image.on('pointerdown', this.removeCard(index), this)

    this.container.add(image)

    this.deck.push(new CardImage(card, image))

    this.updateStartButton()

    return true
  }

  // Set the current deck based on given deck code, returns true if deck was valid
  setDeck(deckCode: string): boolean {
    // Get the deck from this code
    let cardCodes: string[] = deckCode.split(':')

    let deck: Card[] = cardCodes.map( (cardCode) => decodeCard(cardCode))
    if (deckCode === '') deck = []

    if (deck.includes(undefined))
    {
      return false
    }
    else
    {
      // Remove the current deck
      this.deck.forEach( (cardImage) => cardImage.destroy())
      this.deck = []
      cardInfo.text = ''
      this.updateStartButton()
      
      // Add the new deck
      deck.forEach( (card) => this.addCard(card))

      return true
    }
  }

  // Set the callback for showing the menu
  setShowMenu(callback: () => void): void {
    this.btnMenu.setInteractive()
    this.btnMenu.on('pointerdown', callback)
  }

  private updateStartButton(): void {
    if (this.deck.length === 15) {
      this.btnStart.text = 'Start'
      this.btnStart.input.enabled = true
    }
    else
    {
      this.btnStart.text = `${this.deck.length}/15`
      this.btnStart.input.enabled = true // TODO false
    }
  }

  private getCardPosition(index: number): [number, number] {
    let xPad = space.pad
    let x = index * (space.cardSize - space.stackOverlap) + xPad + space.cardSize/2

    let y = space.pad + space.cardSize/2 + (index%2) * space.stackOffset

    return [-x, -y]
  }

  private removeCard(index: number): () => void {
    let that = this
    return function() {
      // Play a sound
      that.scene.sound.play('click')

      // The text for the removed card would otherwise linger
      cardInfo.text = ''

      // Remove the image
      that.deck[index].destroy()

      // Remove from the deck array
      that.deck.splice(index, 1)

      that.correctDeckIndices()

      that.updateStartButton()
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
        return -1
      }
      else if (card1.card.cost > card2.card.cost)
      {
        return 1
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
      let btn = this.scene.add.text(30, y, i.toString(), filterButtonStyle)
      
      btn.setInteractive()
      btn.on('pointerdown', this.onClick(i, btn))

      this.container.add(btn)

      btnNumbers.push(btn)
    }

    // Add the X (Clear) button
    let btnClear = this.scene.add.text(30, 0, 'x', filterButtonStyle)
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
          btn.setTint(0xffaf00, 0xffaf00, 0xffaf00, 0xffaf00)
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
  
  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion)
  }

  init(scene: Phaser.Scene, deckRegion): void {
    this.scene = scene
    this.deckRegion = deckRegion
    
    this.container = this.scene.add.container(space.cardSize * 2 + space.pad * 3, space.pad)
    this.container.setVisible(false)
  }

  create(): void {
    // Visible and invisible background rectangles, stops other containers from being clicked
    let invisBackground = this.scene.add.rectangle(0, 0, 1100*2, 650*2, 0xffffff, 0)
    invisBackground.setInteractive()

    let that = this
    invisBackground.on('pointerdown', function() {
      that.scene.sound.play('close')
      that.container.setVisible(false)
    })
    this.container.add(invisBackground)

    // Set the callback for deckRegion menu button
    this.deckRegion.setShowMenu(function() {
      that.scene.sound.play('click')
      that.container.setVisible(true)
    })

    let width = space.cardSize * 5 + space.pad * 4
    let height = space.cardSize * 4 + space.pad * 3
    let backgroundRectangle = this.scene.add.rectangle(0, 0, width, height, 0x662b00, 0.95).setOrigin(0, 0)
    backgroundRectangle.setInteractive()
    this.container.add(backgroundRectangle)

    // Vs ai toggleable button
    let txt = 'Play versus Computer          '
    txt += gameSettings.vsAi ? '✓' : 'X'
    let btnVsAi = this.scene.add.text(space.pad, space.pad/2, txt, buttonStyle).setOrigin(0, 0)
    btnVsAi.setInteractive()
    btnVsAi.on('pointerdown', this.onVsAi(btnVsAi))
    this.container.add(btnVsAi)

    // Show recap toggleable button
    txt = 'Show recap automatically    '
    txt += gameSettings.autoRecap ? '✓' : 'X'
    let btnAutoRecap = this.scene.add.text(space.pad, space.pad/2 + space.cardSize, txt, buttonStyle).setOrigin(0, 0)
    btnAutoRecap.setInteractive()
    btnAutoRecap.on('pointerdown', this.onAutoRecap(btnAutoRecap))
    this.container.add(btnAutoRecap)

    // Prompt for matchmaking code
    txt = 'Use matchmaking code...' + '\n      > ' + gameSettings.mmCode
    let btnMatchmaking = this.scene.add.text(space.pad, space.pad/2 + space.cardSize * 2, txt, buttonStyle).setOrigin(0, 0)
    btnMatchmaking.setInteractive()
    btnMatchmaking.on('pointerdown', this.onSetMatchmaking(btnMatchmaking))
    this.container.add(btnMatchmaking)

    // Button to save deck code
    txt = 'Copy deck to clipboard'
    let btnCopy = this.scene.add.text(space.pad, space.pad/2 + space.cardSize * 3, txt, buttonStyle).setOrigin(0, 0)
    btnCopy.setInteractive()
    btnCopy.on('pointerdown', this.onCopy(btnCopy))
    this.container.add(btnCopy)

    // Button to load deck code
    txt = 'Load deck from a code'
    let btnLoad = this.scene.add.text(space.pad, space.pad/2 + space.cardSize * 4, txt, buttonStyle).setOrigin(0, 0)
    btnLoad.setInteractive()
    btnLoad.on('pointerdown', this.onLoadDeck(btnLoad))
    this.container.add(btnLoad)


    // TODO Autopass

    // Save deck-code, copy deck code

    // let btnClear = this.scene.add.text(30, 0, 'x', filterButtonStyle)
    // btnClear.setInteractive()
    // btnClear.on('pointerdown', this.onClear(btnNumbers))
    // this.container.add(btnClear)
  }

  private onVsAi(btn: Phaser.GameObjects.Text): () => void {
    let that = this
    return function() {
      that.scene.sound.play('click')

      gameSettings['vsAi'] = !gameSettings['vsAi']

      that.setCheckOrX(btn, gameSettings['vsAi'])
    }
  }

  private onAutoRecap(btn: Phaser.GameObjects.Text): () => void {
    let that = this
    return function() {
      that.scene.sound.play('click')

      gameSettings['autoRecap'] = !gameSettings['autoRecap']

      that.setCheckOrX(btn, gameSettings['autoRecap'])
    }
  }

  // Set the btn to end with a check or an X based on the conditional
  private setCheckOrX(btn: Phaser.GameObjects.Text, conditional: Boolean): void {
      let finalChar = conditional ? "✓":"X"
      let newText = btn.text.slice(0, -1) + finalChar
      btn.setText(newText)
  }

  private onSetMatchmaking(btn: Phaser.GameObjects.Text): () => void {
    let that = this
    return function() {
      var code = prompt("Enter matchmaking code:")
      if (code != null) {
        // This is necessary to not cut off part of the sound from prompt
        that.scene.time.delayedCall(100, () => that.scene.sound.play('click'))

        gameSettings['mmCode'] = code

        let newText = btn.text.split('>')[0] + '> ' + code
        btn.setText(newText)
      }
      
    }
  }

  private onCopy(btn: Phaser.GameObjects.Text): () => void {
    let that = this
    return function() {
      that.scene.sound.play('click')

      let txt = ''
      that.deckRegion.deck.forEach( (cardImage) => txt += `${encodeCard(cardImage.card)}:`)
      txt = txt.slice(0, -1)

      navigator.clipboard.writeText(txt)

      // Alert user that decklist was copied
      let previousText = btn.text
      btn.setText('Copied!')
      that.scene.time.delayedCall(600, () => btn.setText(previousText))
    }
  }

  private onLoadDeck(btn: Phaser.GameObjects.Text): () => void {
    let that = this
    return function() {
      let code = prompt("Enter deck code:")
      if (code != null) {

        let isValid = that.deckRegion.setDeck(code)
        if (isValid) {
          // This is necessary to not cut off part of the sound from prompt
          that.scene.time.delayedCall(100, () => that.scene.sound.play('click'))
        }
        else {
          // Alert user if deck code is invalid
          that.scene.time.delayedCall(100, () => that.scene.sound.play('failure'))

          let previousText = btn.text
          btn.setText('Invalid code!')
          that.scene.time.delayedCall(600, () => btn.setText(previousText))
        }
      }
    }
  }
}





