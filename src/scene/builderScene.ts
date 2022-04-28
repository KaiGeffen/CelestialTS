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
    return this.deckRegion.addCardToDeck(card)
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
      key: "AdventureBuilderScene",
      lastScene: "AdventureScene"
    })
  }

  create(params): void {
    super.create(params)

    this.filterRegion = new FilterRegion().create(this, true)

    this.deckRegion = new DeckRegion().create(this, this.startCallback())
    this.deckRegion.addRequiredCards(params.deck)
    
    this.catalogRegion = new CatalogRegion().create(this, this.deckRegion.width)

    // Must filter out cards that you don't have access to
    this.filter()
  }

  updateSavedDeck(deck: string): void {}

  private startCallback(): () => void {
    let that = this

    return function() {
      // Start a match against an ai opponent with the specified deck
      that.scene.start("AdventureGameScene",
        {isTutorial: false,
          deck: that.getDeckCode(),
          mmCode: `ai:${that.params.opponent}`,
          missionID: that.params.id}
          )
    }
  }
}

export class BuilderScene extends BuilderBase {
  lastDecklist: number
  lastDeck: string

  constructor() {
    super({
      key: "BuilderScene",
      lastScene: "HomeScene"
    })
  }
  
  create(params): void {
    super.create(params)

    this.decklistsRegion = new DecklistsRegion().create(this)

    this.filterRegion = new FilterRegion().create(this, false)

    this.deckRegion = new DeckRegion().create(this, this.startCallback())
    if (this.lastDeck !== undefined) {
      this.deckRegion.setDeck(this.lastDeck)
    }
    
    this.catalogRegion = new CatalogRegion().create(this, this.deckRegion.width)

    // Set starting deck
    if (this.lastDecklist !== undefined) {
      this.decklistsRegion.selectDeck(this.lastDecklist)
    }
    else if (this.lastDeck !== undefined) {
      this.deckRegion.setDeck(this.lastDeck)
    }
  }

  updateSavedDeck(deck: string): void {
    this.decklistsRegion.updateSavedDeck(deck)
  }

  beforeExit(): void {
    this.rememberSettings()
  }

  // Remember what deck / decklist was selected
  private rememberSettings() {
    // Remember the deck for when the builder is returned to
      this.lastDecklist = this.decklistsRegion.getSelectedDeckIndex()
      this.lastDeck = this.getDeckCode()
  }

  private startCallback(): () => void {
    let that = this

    return function() {
      // Remember the deck for when the builder is returned to
      that.rememberSettings()

      // Open the mode menu to select what mode to play in with the given deck
      that.scene.launch('MenuScene', {
        menu: 'mode',
        activeScene: that,
        deck: that.getDeckCode(),
      })
    }
  }
}
