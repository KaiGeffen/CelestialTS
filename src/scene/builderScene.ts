import "phaser"
import { collectibleCards, tokenCards, Card } from "../catalog/catalog"
import { CardImage, addCardInfoToScene } from "../lib/cardImage"
import { buttonStyle, filterButtonStyle, space } from "../settings"
import { decodeCard, encodeCard } from "../lib/codec"


const catalog = collectibleCards

const DECK_PARAM = 'deck'

// The card hover text for this scene, which is referenced in the regions
var cardInfo: Phaser.GameObjects.Text


export class BuilderScene extends Phaser.Scene {
  catalogRegion
  deckRegion
  filterRegion

  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  init(): void {
    this.deckRegion = new DeckRegion(this)
    this.catalogRegion = new CatalogRegion(this, this.deckRegion)
    this.filterRegion = new FilterRegion(this, this.catalogRegion)

    cardInfo = addCardInfoToScene(this)
  }

  // Load all of the card and token images
  preload(): void {
    this.load.setBaseURL(
      "https://raw.githubusercontent.com/KaiGeffen/" +
      "Celestial/master/images/")

    catalog.forEach( (card) => {
      this.load.image(card.name, `${card.name}.png`)
    })
    tokenCards.forEach( (card) => {
      this.load.image(card.name, `${card.name}.png`)
    })
  }
  
  create(): void {
    this.catalogRegion.create()
    this.deckRegion.create()
    this.filterRegion.create()
  }
}


class CatalogRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  deckRegion
  cardImages: CardImage[] = []

  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion)
  }

  init(scene, deckRegion): void {
    this.scene = scene
    this.container = this.scene.add.container(0, 0)
    this.deckRegion = deckRegion
  }

  create(): void {
    for (var i = catalog.length - 1; i >= 0; i--) {
      this.addCard(catalog[i], i)
    }
  }

  // Filter which cards are visible
  // Only cards for which filterFunction is true are visible
  filter(filterFunction): void {
    let cardsRemoved = false
    let visibleIndex = 0

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
  }

  private onClick(card: Card): () => void {
    return function() {
      this.deckRegion.addCard(card)
    }
  }

  private addCard(card: Card, index: number): void {
    var image: Phaser.GameObjects.Image
    var [x, y] = this.getCardPosition(index)
    
    image = this.scene.add.image(x, y, card.name)
    image.setDisplaySize(100, 100)

    image.setInteractive()
    image.on('pointerdown', this.onClick(card), this)

    this.container.add(image)

    this.cardImages.push(new CardImage(card, image))
  }

  private getCardPosition(index: number): [number, number] {
    let col = index % space.cardsPerRow
    let xPad = (1 + col) * space.pad
    let x = col * space.cardSize + xPad + space.cardSize / 2

    let row = Math.floor(index / space.cardsPerRow)
    let yPad = (1 + row) * space.pad
    let y = row * space.cardSize + yPad + space.cardSize / 2

    return [x, y]
  }
}


class DeckRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  deck: CardImage[] = []
  btnStart: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene): void {
    this.scene = scene
    this.container = this.scene.add.container(1000, 650)
  }

  create(): void {
    // Sort button 
    let btnSort = this.scene.add.text(0, -100, 'Sort', buttonStyle)
    btnSort.setInteractive()

    let that = this
    btnSort.on('pointerdown', function (event) {
      that.sort()
    })

    this.container.add(btnSort)

    // Start button
    this.btnStart = this.scene.add.text(0, -50, '', buttonStyle)

    this.btnStart.setInteractive()
    this.btnStart.on('pointerdown', function (event) {
      let deck: Card[] = that.deck.map( (cardImage) => cardImage.card)
      this.scene.scene.start("GameScene", {deck: deck})
    })
    
    this.updateStartButton()
    
    this.container.add(this.btnStart)

    // Text confirming that user copied their decklist
    let styleConfirm = {
      font: '106px Arial Bold',
      color: '#ddd',
      backgroundColor: '#88a'
    }
    let txtCopyConfirm = this.scene.add.text(1100/2, 310, ' Copied ', styleConfirm).setOrigin(0.5, 0.5)
    txtCopyConfirm.setVisible(false)

    // Save button
    let btnCopy = this.scene.add.text(0, -150, 'Copy', buttonStyle)

    btnCopy.setInteractive()
    // Copy to clipboard this url with the param describing player's current deck
    btnCopy.on('pointerdown', function (event) {
      let text = window.location.href.split('?')[0]
      text += `?${DECK_PARAM}=`

      that.deck.forEach( (cardImage) => text += `${encodeCard(cardImage.card)}:`)
      text = text.slice(0, -1)

      navigator.clipboard.writeText(text)

      // Alert user that decklist was copied
      txtCopyConfirm.setVisible(true)
      that.scene.time.delayedCall(600, () => txtCopyConfirm.setVisible(false))
    })
    this.container.add(btnCopy)

    // If this page had params specifying the deck, make that deck
    let urlParams = new URLSearchParams(window.location.search)
    let deckCode = urlParams.get(DECK_PARAM)
    if (deckCode) this.addStartingDeck(deckCode)
  }

  addCard(card: Card): void {
    if (this.deck.length >= 15) {
      this.scene.cameras.main.flash(300, 0, 0, 0.1)
      return
    }

    let index = this.deck.length
    var image: Phaser.GameObjects.Image
    var [x, y] = this.getCardPosition(index)
    
    image = this.scene.add.image(x, y, card.name)
    image.setDisplaySize(100, 100)

    image.setInteractive()
    image.on('pointerdown', this.onClick(index), this)

    this.container.add(image)

    this.deck.push(new CardImage(card, image))

    this.updateStartButton()
  }

  private addStartingDeck(deckCode: string): void {
    let cardCodes: string[] = deckCode.split(':')

    cardCodes.forEach( (cardCode) => this.addCard(decodeCard(cardCode)))
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

  private onClick(index: number): () => void {
    return function() {
      // The text for the removed card would otherwise linger
      cardInfo.text = ''

      // Remove the image
      this.deck[index].destroy()

      // Remove from the deck array
      this.deck.splice(index, 1)

      this.correctDeckIndices()

      this.updateStartButton()
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
      image.on('pointerdown', this.onClick(i), this)
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






