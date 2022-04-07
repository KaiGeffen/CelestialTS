import 'phaser'

import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, UserSettings, Space, Mechanics } from "../../settings/settings"
import { collectibleCards } from "../../catalog/catalog"



// Region where all of the available cards can be scrolled through
class CatalogRegion {  
  // Overwrite the 'scene' property of container to specifically be a BuilderScene
  scene// TODO: BuilderSceneShell

  // The scrollable panel on which the catalog exists
  panel

  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]




  // Create this region, offset by the given width
  create(scene: Phaser.Scene, x: number) {
    this.panel = this.createPanel(scene, x)

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




  // TODO Move
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

    // Taken from['RexUI'] implementation of overflow for scrollable panel
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