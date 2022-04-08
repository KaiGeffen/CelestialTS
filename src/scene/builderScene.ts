import "phaser"
import Card from "../lib/card"
import BaseScene from "./baseScene"

import CatalogRegion from './builderRegions/catalog'
import DeckRegion from './builderRegions/deck'
import DecklistsRegion from './builderRegions/decklists'
import FilterRegion from './builderRegions/filter'


// Features common between all builders
class BuilderBase extends BaseScene {
  decklistsRegion
  filterRegion
  catalogRegion
  deckRegion

  addCardToDeck(card: Card): boolean {
    let cardImage = this.deckRegion.addCardToDeck(card)

    return cardImage !== undefined
  }

  // Filter which cards are visible and selectable in the catalog
  // based on the settings in the filter region
  filter() {
    let filterFunction: (card: Card) => boolean = this.filterRegion.getFilterFunction()
    
    this.catalogRegion.filter(filterFunction)
  }

  // Set the current deck, returns true if deck was valid
  setDeck(deckCode: string | Card[]): boolean {
    return this.deckRegion.setDeck(deckCode)
  }

  // Get the deck code for player's current deck
  getDeckCode(): string {
    return this.deckRegion.getDeckCode()
  }
}

export class AdventureBuilderScene extends BuilderBase {
  constructor() {
    super({
      key: "AdventureBuilderScene"
    })
  }

  create(): void {
    super.create()

    this.filterRegion = new FilterRegion().create(this, true)

    this.deckRegion = new DeckRegion().create(this)
    
    this.catalogRegion = new CatalogRegion().create(this)
  }
}

export class BuilderScene extends BuilderBase {
  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  create(): void {
    super.create()

    this.decklistsRegion = new DecklistsRegion().create(this)

    this.filterRegion = new FilterRegion().create(this, false)

    this.deckRegion = new DeckRegion().create(this, this.decklistsRegion.width)
    
    this.catalogRegion = new CatalogRegion().create(this, this.decklistsRegion.width)
  }

  updateSavedDeck(deck: string): void {
    this.decklistsRegion.updateSavedDeck(deck)
  }
}
