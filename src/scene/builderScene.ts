import "phaser"
import Card from "../lib/card"
import BaseScene from "./baseScene"

import CatalogRegion from './builderRegions/catalog'
import DeckRegion from './builderRegions/deck'
import DecklistsRegion from './builderRegions/decklists'
import FilterRegion from './builderRegions/filter'
import { Space } from '../settings/settings'


// Features common between all builders
export class BuilderBase extends BaseScene {
  catalogRegion
  deckRegion
  decklistsRegion
  filterRegion

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

  // Change the displayed avatar to the given avatar
  setAvatar(id: number) {
    this.deckRegion.setAvatar(id)

    return this
  }

  // Set the displayed deck name to the given name
  setName(name: string) {
    this.deckRegion.setName(name)

    this.decklistsRegion.setName(name)

    return this
  }

  // Set the deck's name to be the premade for given avatar
  setPremade(id: number) {
    this.deckRegion.setPremade(id)

    // Animate the deck panel sliding out to be seen
    this.deckRegion.showPanel()
    this.catalogRegion.shiftRight()

    return this
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
    
    this.catalogRegion = new CatalogRegion().create(this, Space.deckPanelWidth)

    this.deckRegion = new DeckRegion().create(this, this.startCallback())
    this.deckRegion.addRequiredCards(params.deck)

    this.filterRegion = new FilterRegion().create(this, true)

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

    this.catalogRegion = new CatalogRegion().create(this, Space.decklistPanelWidth)

    this.deckRegion = new DeckRegion().create(this, this.startCallback(), this.updateDeckCallback())
    if (this.lastDeck !== undefined) {
      this.deckRegion.setDeck(this.lastDeck)
    }

    this.decklistsRegion = new DecklistsRegion().create(this)
    
    this.filterRegion = new FilterRegion().create(this, false)

    // Set starting deck
    if (this.lastDecklist !== undefined) {
      this.decklistsRegion.selectDeck(this.lastDecklist)
    }
    else if (this.lastDeck !== undefined) {
      this.deckRegion.setDeck(this.lastDeck)
    }
  }

  addCardToDeck(card: Card): boolean {
    // If no deck is selected, don't add the card
    if (this.decklistsRegion.savedDeckIndex === undefined) {
      // TODO What should happen here? Zoom up the card?
      return false
    }

    let result = this.deckRegion.addCardToDeck(card)

    this.updateSavedDeck(this.getDeckCode())

    return result
  }

  updateSavedDeck(deck?: string, name?: string, avatar?: number): void {
    this.decklistsRegion.updateSavedDeck(deck, name, avatar)
  }

  beforeExit(): void {
    this.rememberSettings()
  }

  setDeck(deckCode: string | Card[]): boolean {
    // Animate the deck panel sliding out to be seen
    this.deckRegion.showPanel()
    this.catalogRegion.shiftRight()

    return super.setDeck(deckCode)
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

  // Update the avatar or name for the current deck
  private updateDeckCallback(): (name: string, avatar: number) => void {
    let that = this

    return function(name: string, avatar: number) {
      that.updateSavedDeck(undefined, name, avatar)

      // Update the avatar
      that.setAvatar(avatar)

      // Update the name
      that.setName(name)
    }
  }

  deselectDeck(): void {
    this.deckRegion.hidePanel()
    this.catalogRegion.shiftLeft()
  }
}
