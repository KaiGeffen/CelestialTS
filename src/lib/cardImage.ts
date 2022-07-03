import "phaser"
import { cardback } from "../catalog/catalog"
import { Color, Style, BBStyle, Time, Space } from "../settings/settings"
import Card from './card'
import { allCards } from "../catalog/catalog"
import { StatusBar } from "../lib/status"
import { KeywordLabel, ReferenceLabel } from '../lib/keywordLabel'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export class CardImage {
  card: Card
  image: Phaser.GameObjects.Image

  scene: Phaser.Scene

  txtCost: Phaser.GameObjects.Text
  txtPoints: Phaser.GameObjects.Text

  keywords: KeywordLabel[] = []
  // All referenced cards
  references: ReferenceLabel[] = []

  // Whether the current card is required in this context (Must be in the deck)
  required = false

  unplayable: boolean = false
  // A container just for this cardImage / objects related to it
  container: ContainerLite | Phaser.GameObjects.Container

  // The index of this container within its parent container before it was brought to top
  renderIndex: number = undefined

  constructor(card: Card, container: any, interactive: Boolean = true) {
    this.init(card, container, interactive)
  }

  init(card: Card, outerContainer: any, interactive: Boolean) {
    this.card = card

    let scene: Phaser.Scene = outerContainer.scene
    this.scene = scene

    // Card image
    this.image = scene.add.image(0, 0, card.name)//.setAlpha(0.3)
    this.image.setDisplaySize(Space.cardWidth, Space.cardHeight)

    // Stat text
    let hint = this.scene['hint']
    this.txtCost = this.scene.add['rexBBCodeText'](
      -Space.cardWidth/2 + 25,
      -Space.cardHeight/2 + 25,
      `${card.cost}`,
      BBStyle.cardStats)
    .setOrigin(0.5)
    .setAlpha(0.001)
    .setInteractive()
    .on('pointerover', () => hint.showText(`This card costs ${this.txtCost.text} breath to play.`))
    .on('pointerout', () => hint.hide())
    .on('pointerdown', () => this.image.emit('pointerdown'))

    this.txtPoints = this.scene.add['rexBBCodeText'](
      -Space.cardWidth/2 + 25,
      -Space.cardHeight/2 + 77,
      `${card.points}`,
      BBStyle.cardStats)
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerover', () => hint.showText(`This card is worth ${this.txtPoints.text} point${card.points === 1 ? '' : 's'}.`))
    .on('pointerout', () => hint.hide())
    .on('pointerdown', () => this.image.emit('pointerdown'))
    this.setPoints(card.points)

    // Add keywords and references
    this.addKeywords()
    this.addReferences()

    // This container
    this.container = this.createContainer(outerContainer)

    if (interactive) {
      this.image.setInteractive()
      this.setOnHover(this.onHover(), this.onHoverExit())

      // If the mouse moves outside of the game, exit the hover also
      this.scene.input.on('gameout', this.onHoverExit(), this)
    }
  }

  destroy(): void {
    this.container.destroy()
  }

  show(): CardImage {
    this.container.setVisible(true)

    return this
  }

  hide(): CardImage {
    this.container.setVisible(false)

    return this
  }

  // Set the callback to fire when this card's image is clicked
  setOnClick(f: () => void, removeListeners = false): CardImage {
    if (removeListeners) {
      this.removeOnClick()
    }

    this.image.on('pointerdown', f)

    return this
  }

  // Remove all callbacks that fire when this card's image is clicked
  removeOnClick(): void {
    this.image.removeAllListeners('pointerdown')

    // this.keywords.forEach((keyword) => {
    //   keyword.removeAllListeners('pointerdown')
    // })
  }

  // Set the callback to fire when this card's image is hovered, and one for when exited
  setOnHover(fHover: () => void, fExit: () => void): CardImage {
    let that = this

    this.image.on('pointerover', fHover)
    this.image.on('pointerout', () => {
      const pointer = that.scene.input.activePointer

      // Check if any of the internal elements are highlighted (Keywords, references, etc)
      let overInternal = false;
      [
      this.txtCost, this.txtPoints,
      ...this.keywords,
      ...this.references,
      ].forEach(obj => {
        if (obj.getBounds().contains(pointer.x, pointer.y)) {
          overInternal = true
        }
      })

      if (!overInternal) {
        fExit()
      }
    })

    return this
  }

  // Set whether this card is playable
  setPlayable(isPlayable: Boolean): void {
    this.unplayable = !isPlayable

    if (isPlayable) {
      this.image.clearTint()
    }
    else {
      this.image.setTint(Color.cardUnplayable)
    }
  }

  // Set whether this card is described or not
  setDescribable(isDescribable: Boolean): void {
    if (!isDescribable) {
      this.image.removeInteractive()
    }
    else{
      // TODO Enable if isDescribable is true
      throw 'setDescribable(true) is not implemented for cardImage'
    }
  }

  setTransparent(value: Boolean): CardImage {
    if (value) {
      this.container.setAlpha(0.2)
    }
    else {
      this.container.setAlpha(1)
    }

    return this
  }

  setPosition(position: [number, number]): CardImage {
    this.container.setPosition(position[0], position[1])

    return this
  }

  // Set the displayed cost of this card, don't change the cost if cost is null
  setCost(cost: number): CardImage {
    if (cost !== null) {
      if (cost === this.card.cost) {
        this.txtCost.setAlpha(0.001)
      }
      else {
        this.txtCost.setAlpha(1)
      }

      this.txtCost.setText(`[stroke=${Color.cardCostReduced}]${cost}[/stroke]`)
    }

    return this
  }

  // Set the displayed point value of the card, or hide it if it's equal to the default value
  setPoints(amt: number): CardImage {
    // If this is the default of the card, don't display any custom point value
    if(this.card.dynamicText === '') {
      this.txtPoints.setAlpha(0.001)
    }

    // TODO Change color name
    this.txtPoints.setText(`[stroke=${Color.cardCostReduced}]${amt}[/stroke]`)

    return this
  }

  // Remove the highlight from this card
  removeHighlight(): () => void {
    let that = this

    return function() {
      that.scene.plugins.get('rexOutlinePipeline')['remove'](that.image)
    }
  }

  // Set that this card is required and can't be removed from the deck
  setRequired(): void {
    this.image.setTint(Color.cardUnplayable)
    this.required = true
  }

  private createContainer(outerContainer): ContainerLite {
    // Depending on the type of the outer container, need to do different things
    let container
    if (outerContainer instanceof Phaser.GameObjects.Container) {
      container = this.scene.add.container()
    }
    else if (outerContainer instanceof ContainerLite) {
      container = new ContainerLite(this.scene, 0, 0, Space.cardWidth, Space.cardHeight)
    }
    else {
      throw 'CardImage was given a container that isnt of a correct type'
    }

    // Add each of the objects
    container.add([this.image, this.txtCost, this.txtPoints, ...this.keywords, ...this.references])

    // Make outercontainer contain this container
    outerContainer.add(container)

    return container
  }

  private addKeywords(): void {
    let that = this

    this.card.keywords.forEach((keywordTuple) => {
      let keyword = new KeywordLabel(
        this.scene,
        keywordTuple.name,
        keywordTuple.x,
        keywordTuple.y,
        keywordTuple.value)

      // Keyword should trigger the hover/click for the image behind
      keyword.on('pointerdown', () => {
        that.image.emit('pointerdown')
      })

      this.keywords.push(keyword)
    })
  }

  private addReferences(): void {
    let that = this

    this.card.references.forEach((referenceTuple) => {
      let reference = new ReferenceLabel(
        this.scene,
        referenceTuple.name,
        referenceTuple.x,
        referenceTuple.y)

      // reference should trigger the hover/click for the image behind
      reference.on('pointerdown', () => {
        that.image.emit('pointerdown')
      })

      this.references.push(reference)
    })
  }

  private onHover(): () => void {
    let that = this

    function doHighlight() {
      var postFxPlugin = that.scene.plugins.get('rexOutlinePipeline')

      postFxPlugin['remove'](that.image)
      postFxPlugin['add'](that.image,
        {
          thickness: Space.highlightWidth,
          outlineColor: Color.outline,
          quality: 0.3,
        })
    }

    return function() {
      // cardInfo.setVisible(true)

      if (!that.unplayable) {
        console.log('hover')
        that.scene.sound.play('hover')
        doHighlight()
      }

    }
  }

  private onHoverExit(): () => void {
    let that = this
    return () => {
      that.removeHighlight()()
    }
  }

  // Move this cardImage above everything else in its container when it's hovered
  moveToTopOnHover(): CardImage {
    let that = this
    let container = this.container
    let parentContainer = container.parentContainer

    // Reverse the order of everything from this objects index on
    // This makes this appear above everything, and things to the right to be in reverse order
    let onHover = function() {
      // If the render index has already been set, we are already reversed
      if (that.renderIndex !== undefined) {
        return
      }

      // Remember the index that this was at
      that.renderIndex = parentContainer.getIndex(container)

      // From the top of the list until this cardImage, reverse the order
      for (let i = parentContainer.length - 1; i >= that.renderIndex; i--) {
        parentContainer.bringToTop(parentContainer.getAt(i))
      }
    }

    let onExit = function() {
      // From INDEX to the top is reversed, flip it back
      for (let i = parentContainer.length - 1; i >= that.renderIndex; i--) {
        parentContainer.bringToTop(parentContainer.getAt(i))
      }

      // Reset the render index to show no longer reversed
      that.renderIndex = undefined
    }

    // Set the hover / exit callbacks
    this.setOnHover(onHover, onExit)

    return this
  }

  // Toggle whether this card appears as being set to mulligan or not
  icon: Phaser.GameObjects.Image
  toggleSelectedForMulligan(): CardImage {
    if (this.icon !== undefined) {
      this.icon.destroy()
      this.icon = undefined
    }
    else {
      this.icon = this.container.scene.add.image(0, 0, 'icon-XOut')
      this.container.add(this.icon)
    }

    return this
  }

  // Copy the location of another cardImage
  copyLocation(card: CardImage): CardImage {
    const x = card.container.x + card.container.parentContainer.x
    const y = card.container.y + card.container.parentContainer.y

    this.container.setPosition(x, y)

    return this
  }
}
