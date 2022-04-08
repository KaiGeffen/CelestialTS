import "phaser"
import Server from "../server"
import { collectibleCards, baseCards } from "../catalog/catalog"
import { CardImage, cardInfo } from "../lib/cardImage"
import { Style, Color, UserSettings, UserProgress, Space, Mechanics } from "../settings/settings"
import { decodeCard, encodeCard } from "../lib/codec"
import Card from "../lib/card"

// TODO Bundle these into a single import
import Button from '../lib/buttons/button'
import { SymmetricButtonSmall, ButtonNewDeck } from '../lib/buttons/backed'
import { IButtonX, IButtonPremade } from '../lib/buttons/icon'
import { UButton } from '../lib/buttons/underlined'
import { TextButton } from '../lib/buttons/text'
import { ButtonDecklist } from '../lib/buttons/decklist'

import Icon from "../lib/icon"
import Menu from "../lib/menu"
import avatarNames from '../lib/avatarNames'
import BaseScene from "./baseScene"
import PrebuiltDeck from "../catalog/prebuiltDecks"

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';




const maxCostFilter: number = 7

import DecklistsRegion from './builderRegions/decklists'
import FilterRegion from './builderRegions/filter'
import CatalogRegion from './builderRegions/catalog'
import DeckRegion from './builderRegions/deck'



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

    this.decklistsRegions = new DecklistsRegion().create(this)

    this.filterRegion = new FilterRegion().create(this, false)

    this.deckRegion = new DeckRegion().create(this, this.decklistsRegions.width)
    
    this.catalogRegion = new CatalogRegion().create(this, this.decklistsRegions.width)
  }
}
