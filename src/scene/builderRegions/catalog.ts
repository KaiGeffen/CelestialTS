import 'phaser'

import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, UserSettings, Space, Mechanics } from "../../settings/settings"
import { collectibleCards } from "../../catalog/catalog"



// Region where all of the available cards can be scrolled through
export default class CatalogRegion {  
  // Overwrite the 'scene' property of container to specifically be a BuilderScene
  scene// TODO: BuilderSceneShell
  container: ContainerLite

  // The scrollable panel on which the catalog exists
  panel

  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]




  // Create this region, offset by the given width
  create(scene: Phaser.Scene, x = 0) {
    this.scene = scene
    this.container = new ContainerLite(scene)

    this.panel = this.createPanel(scene, x)

    this.cardCatalog = []

    // Add each card
    let pool = collectibleCards
    for (let i = 0; i < pool.length; i++) {
      let cardImage = this.addCardToCatalog(pool[i], i)

      this.panel.getElement('panel').add(cardImage.image)
    }

    this.panel.layout()

    return this
  }

  private createPanel(scene: Phaser.Scene, x: number) {
    // TODO This is specific to the deck region impl
    let height = Space.windowHeight - (Space.cardHeight/2 + Space.pad)

    // Make the object
    let width = Space.windowWidth - x
    let superPanel = scene['rexUI'].add.scrollablePanel({
      x: x + width/2,
      y: height/2,
      width: width,
      height: height,

      scrollMode: 0,

      // background: scene['rexUI'].add.roundRectangle(x, 0, width, height, 16, Color.menuBackground, 0.7).setOrigin(0),

      panel: {
        child: scene['rexUI'].add.fixWidthSizer({
          space: {
            left: Space.pad,
            right: Space.pad,
            top: 70 + Space.pad, // TODO 70 is the filter height
            bottom: Space.pad - 10,
            item: Space.pad,
            line: Space.pad,
          }
        })
      }})

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

    // Reset the scroll
    this.panel.t = 0

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
}