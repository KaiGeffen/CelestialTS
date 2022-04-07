import 'phaser'

import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, UserSettings, Space, Mechanics } from "../../settings/settings"
import { collectibleCards } from "../../catalog/catalog"



// Region where all of the available cards can be scrolled through
export default class CatalogRegion {  
  // Overwrite the 'scene' property of container to specifically be a BuilderScene
  scene// TODO: BuilderSceneShell
  container: Phaser.GameObjects.Container

  // The scrollable panel on which the catalog exists
  panel

  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]




  // Create this region, offset by the given width
  create(scene: Phaser.Scene, x: number) {
    this.container = scene.add.container(0, 0)

    this.panel = this.createPanel(scene, x)

    this.cardCatalog = []

    // Add each card
    let pool = collectibleCards
    for (let i = 0; i < pool.length; i++) {
      let cardImage = this.addCardToCatalog(pool[i], i)

      this.panel.getElement('panel').add(cardImage.image)
    }

    this.panel.layout()
  }

  private createPanel(scene: Phaser.Scene, x: number) {
    // Determine the dimensions
    this.cardsPerRow = Math.floor(innerWidth / (Space.cardSize + Space.pad))

    // TODO This is specific to the deck region impl
    let height = Space.windowHeight - (Space.cardHeight/2 + Space.pad)

    // Make the object
    let superPanel = scene['rexUI'].add.scrollablePanel({
      x: x,
      y: 0,
      width: Space.windowWidth - x,
      height: height,

      scrollMode: 0,

      // background: scene['rexUI'].add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

      panel: {
        child: scene['rexUI'].add.fixWidthSizer({
          space: {
            left: Space.pad,
            right: Space.pad - 10,
            top: 70 + Space.pad,
            bottom: Space.pad - 10,
            // item: Space.pad,
            line: Space.pad,
          }
        })
      }}).setOrigin(0)

    // Update panel when mousewheel scrolls
    let panel = superPanel.getElement('panel')
    scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
      // Return if the pointer is outside of the panel
      if (!panel.getBounds().contains(pointer.x, pointer.y)) {
        return
      }

      // Scroll panel down by amount wheel moved
      superPanel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      superPanel.t = Math.max(0, superPanel.t)
      superPanel.t = Math.min(0.999999, superPanel.t)
    })

    return superPanel
  }

  // Filter which cards can be selected in the catalog based on current filtering parameters
  filter(filterFunction: (card: Card) => boolean): void {
    let sizer = this.panel.getElement('panel')
    sizer.clear()

    // For each card in the catalog, add it to the sizer if it satisfies
    // Otherwise make it invisible
    for (let i = 0; i < this.cardCatalog.length; i++) {
      let cardImage = this.cardCatalog[i]

      // Check if this card is present
      if (filterFunction(cardImage.card)) {
        cardImage.image.setVisible(true)

        // Add the image next, with padding between it and the next card
        sizer.add(cardImage.image)
      }
      else
      {
        cardImage.image.setVisible(false)
      }
    }

    this.panel.layout()
  }





  private addCardToCatalog(card: Card, index: number): CardImage {
    let cardImage = new CardImage(card, this.container)
    .setOnClick(this.onClickCatalogCard(card))

    // Add this cardImage to the maintained list of cardImages in the catalog
    this.cardCatalog.push(cardImage)

    return cardImage
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






  // TODO Move
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