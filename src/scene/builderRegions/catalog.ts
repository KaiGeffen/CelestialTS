import 'phaser'

import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, Color, UserSettings, Space, Mechanics, Time, Mobile, Scroll, Ease } from "../../settings/settings"
import { collectibleCards } from "../../catalog/catalog"


 // TODO FILTER_HEIGHT is the filter height
const FILTER_HEIGHT = 70

// Region where all of the available cards can be scrolled through
export default class CatalogRegion {  
  // Overwrite the 'scene' property of container to specifically be a BuilderScene
  scene// TODO: BuilderSceneShell
  container: ContainerLite

  // The scrollable panel on which the catalog exists
  private scrollablePanel
  panel

  // Full list of all cards in the catalog (Even those invisible)
  cardCatalog: CardImage[]

  // Create this region, offset by the given width
  create(scene: Phaser.Scene, x: number) {
    this.scene = scene
    this.container = new ContainerLite(scene)

    this.panel = this.createPanel(scene, x)

    this.cardCatalog = []

    // Add each card
    let pool = collectibleCards
    for (let i = 0; i < pool.length; i++) {
      let cardImage = this.addCardToCatalog(pool[i], i)

      this.panel.getElement('panel').add(cardImage.container)
    }

    this.panel.layout()

    return this
  }

  private createPanel(scene: Phaser.Scene, x: number) {
    // NOTE Scroller is in both environments
    // x += Mobile ? Space.scrollWidth : 0

    // TODO Rename x

    const width = Space.windowWidth - x
    const height = Space.windowHeight

    // Make the object
    let superPanel = this.scrollablePanel = scene['rexUI'].add.scrollablePanel({
      x: Space.windowWidth,
      y: 0,
      width: width,
      height: height,

      scrollMode: 0,

      panel: {
        child: scene['rexUI'].add.fixWidthSizer({
          space: {
            left: Space.pad,
            right: Space.pad,
            top: FILTER_HEIGHT + Space.pad,
            bottom: Space.pad - 10,
            item: Space.pad,
            line: Space.pad,
          }
        })
      },

      space: {
        slider: {
          top: FILTER_HEIGHT,
        }
      },

      slider: Scroll(scene),
    }).setOrigin(1, 0)

    // Update panel when mousewheel scrolls
    let panel = superPanel.getElement('panel')
    scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
      // Return if the pointer is outside of the panel
      if (!panel.getBounds().contains(pointer.x, pointer.y)) {
        return
      }

      // Hide the hint, which might have been scrolled away from
      this.scene['hint'].hide()

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
        cardImage.container.setVisible(true)

        // Add the image next, with padding between it and the next card
        sizer.add(cardImage.container)
      }
      else
      {
        cardImage.container.setVisible(false)
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
    return () => {
      const errorMsg = this.scene.addCardToDeck(card)

      if (errorMsg === undefined) {
        this.scene.sound.play('click')
      }
      else {
        this.scene.signalError(errorMsg)
      }
    }
  }

  // Shift the catalog to the right to make room for the deck panel
  shiftRight(): void {
    let that = this

    const x = Mobile ? Space.deckPanelWidth + 60 : Space.decklistPanelWidth + Space.deckPanelWidth
    const width = Space.windowWidth - x

    // Ratio of how much panel has been scrolled
    const ratio = this.scrollablePanel.t

    // Animate shift
    if (this.panel.minWidth > width) {
      this.scene.tweens.add({
        targets: this.panel,
        minWidth: width,
        duration: Time.builderSlide(),
        ease: Ease.slide,
        onUpdate: () => {
          that.scrollablePanel.layout()
          that.scrollablePanel.t = ratio
        },
      })
    }
  }

  // Shift the catalog to the left to fill the absence of deck panel
  shiftLeft(): void {
    let that = this

    const x = Space.decklistPanelWidth + (Mobile ? Space.scrollWidth : 0)
    const width = Space.windowWidth - x

    // Ratio of how much panel has been scrolled
    const ratio = this.scrollablePanel.t

    // Animate shift
    if (this.panel.minWidth < width) {
      this.scene.tweens.add({
        targets: this.panel,
        minWidth: width,
        duration: Time.builderSlide(),
        ease: Ease.slide,
        onUpdate: () => {
          that.scrollablePanel.layout()
          that.scrollablePanel.t = ratio
        },
      })
    }
  }
}
