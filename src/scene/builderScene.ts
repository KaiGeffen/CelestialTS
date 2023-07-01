import "phaser"
import Card from "../lib/card"
import BaseScene from "./baseScene"

import CatalogRegion from './builderRegions/catalog'
import DeckRegion from './builderRegions/deck'
import DecklistsRegion from './builderRegions/decklists'
import FilterRegion from './builderRegions/filter'
import JourneyRegion from './builderRegions/journey'
import { Space, Mechanics } from '../settings/settings'


// Features common between all builders
export class BuilderBase extends BaseScene {
  catalogRegion: CatalogRegion
  deckRegion: DeckRegion
  decklistsRegion: DecklistsRegion
  filterRegion: FilterRegion

  // The params with which this class was invoked
  params

  create(params) {
    super.create()

    this.params = params
  }

  addCardToDeck(card: Card): string {
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

  // Check whether the deck is overfull
  isOverfull(): boolean { return this.deckRegion.isOverfull() }
}

export class AdventureBuilderScene extends BuilderBase {
  journeyRegion: JourneyRegion

  constructor() {
    super({
      key: "AdventureBuilderScene",
      lastScene: "AdventureScene"
    })
  }

  create(params): void {
    super.create(params)
    
    this.catalogRegion = new CatalogRegion().create(this, Space.deckPanelWidth)

    // TODO Not just the 100s digit number
    const avatar = (Math.floor(params.id / 100) - 1) % 6
    this.journeyRegion = new JourneyRegion().create(this, this.startCallback(), avatar, this.params.storyTitle, this.params.storyText)
    this.journeyRegion.addRequiredCards(params.deck)

    this.filterRegion = new FilterRegion().create(this, true)

    // Must filter out cards that you don't have access to
    this.filter()
  }

  addCardToDeck(card: Card): string {
    return this.journeyRegion.addCardToDeck(card)
  }

  getDeckCode(): string {
    return this.journeyRegion.getDeckCode()
  }

  updateSavedDeck(deck: string): void {}

  private startCallback(): () => void {
    let that = this

    return function() {
      // TODO Not just the 100s digit number
      const avatar = (Math.floor(that.params.id / 100) - 1) % 6

      // Start a match against an ai opponent with the specified deck
      that.scene.start("AdventureGameScene",
        {isTutorial: false,
          deck: that.getDeckCode(),
          mmCode: `ai:${that.params.opponent}`,
          missionID: that.params.id,
          avatar: avatar,
        })
    }
  }
  
  isOverfull(): boolean { return this.journeyRegion.isOverfull() }
}

export class BuilderScene extends BuilderBase {
  lastDecklist: number
  lastPremade: number

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

    this.decklistsRegion = new DecklistsRegion().create(this)
    
    this.filterRegion = new FilterRegion().create(this, false)

    // Set starting deck
    if (this.lastDecklist !== undefined) {
      this.decklistsRegion.selectDeck(this.lastDecklist)
    }
    else if (this.lastPremade !== undefined) {
      this.decklistsRegion.premadeCallback()(this.lastPremade)
    }
  }

  addCardToDeck(card: Card): string {
    // If a premade deck is selected, return an error string
    if (this.decklistsRegion.savedPremadeIndex !== undefined) {
      return `Can't add cards to a premade deck.`
    }

    // If no deck is selected, make a new deck and add this card
    if (this.decklistsRegion.savedDeckIndex === undefined) {
      // If creating an empty deck failed, return an error string
      if (!this.decklistsRegion.createEmptyDeck()) {
        return `Reached max number of decks (${Mechanics.maxDecks}).`
      }

      // NOTE Card gets added below (Deck starts empty)
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

    let result = super.setDeck(deckCode)

    this.updateSavedDeck(this.getDeckCode())

    return result
  }

  setSearchVisible(value: boolean): void {
    if (this.filterRegion.searchObj !== undefined) {
      // TODO Better integrate rexUI types
      this.filterRegion.searchObj['setVisible'](value)
    }
  }

  // Remember what deck / decklist was selected
  private rememberSettings() {
    // Remember the deck for when the builder is returned to
      this.lastDecklist = this.decklistsRegion.savedDeckIndex
      this.lastPremade = this.decklistsRegion.savedPremadeIndex
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
        avatar: that.deckRegion.avatarNumber,
      })
    }
  }

  // Update the avatar or name for the current deck
  private updateDeckCallback(): (name: string, avatar: number, deckCode: string) => void {
    let that = this

    return function(name: string, avatar: number, deckCode: string) {
      that.updateSavedDeck(undefined, name, avatar)

      // Update the avatar
      that.setAvatar(avatar)

      // Update the name
      that.setName(name)

      if (deckCode) {
        // Update the cards in the deck
        that.setDeck(deckCode)
      }
    }
  }

  // Deselect whatever decklist is selected
  deselect(): void {
    this.decklistsRegion.deselect()

    this.deckRegion.hidePanel()
    this.catalogRegion.shiftLeft()
  }
}
