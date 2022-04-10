import "phaser"
import Card from "../lib/card"
import BaseScene from "./baseScene"

import CatalogRegion from './builderRegions/catalog'
import DeckRegion from './builderRegions/deck'
import DecklistsRegion from './builderRegions/decklists'
import FilterRegion from './builderRegions/filter'


// Features common between all builders
export class BuilderBase extends BaseScene {
  decklistsRegion
  filterRegion
  catalogRegion
  deckRegion

  // The params with which this class was invoked
  params

  create(params) {
    super.create()

    this.params = params
  }

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

  create(params): void {
    super.create(params)

    this.filterRegion = new FilterRegion().create(this, true)

    this.deckRegion = new DeckRegion().create(this, this.startCallback())
    this.deckRegion.addRequiredCards(params.deck)
    
    this.catalogRegion = new CatalogRegion().create(this)
  }

  updateSavedDeck(deck: string): void {}

  private startCallback(): () => void {
    let that = this

    return function() {
      // Start a match against an ai opponent with the specified deck
      that.scene.start("GameScene",
        {isTutorial: false,
          deck: that.getDeckCode(),
          mmCode: `ai:${that.params.opponent}`,
          missionID: that.params.id}
          )
    }
  }
}

export class BuilderScene extends BuilderBase {
  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  create(params): void {
    super.create(params)

    this.decklistsRegion = new DecklistsRegion().create(this)

    this.filterRegion = new FilterRegion().create(this, false)

    this.deckRegion = new DeckRegion().create(this, this.startCallback(), this.decklistsRegion.width) // TODO Function
    
    this.catalogRegion = new CatalogRegion().create(this, this.decklistsRegion.width)
  }

  updateSavedDeck(deck: string): void {
    this.decklistsRegion.updateSavedDeck(deck)
  }

  private startCallback(): () => void {
    let that = this

    return function() {
      // Start a match against an ai opponent with the specified deck
      // TODO Open a menu giving the option of pvp
      that.scene.start("GameScene",
        {isTutorial: false,
          deck: that.getDeckCode(),
          mmCode: `ai`}
          )
    }
  }
}
