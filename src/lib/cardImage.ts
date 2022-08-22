import "phaser"
import { cardback } from "../catalog/catalog"
import { Color, Style, BBStyle, Time, Space } from "../settings/settings"
import Card from './card'
import { allCards } from "../catalog/catalog"
import { StatusBar } from "../lib/status"
import { KeywordLabel, ReferenceLabel } from '../lib/keywordLabel'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'


export class CardImage {
  scene: Phaser.Scene

  card: Card
  image: Phaser.GameObjects.Image

  // Visual elements that appear on the cardImage
  txtCost: Phaser.GameObjects.Text
  txtPoints: Phaser.GameObjects.Text
  keywords: KeywordLabel[] = []
  references: ReferenceLabel[] = []

  // A container just for this cardImage and elements within it
  container: ContainerLite | Phaser.GameObjects.Container

  // Whether or not this object is hovered currently
  hovered = false

  hoverCallback = () => {}
  exitCallback = () => {}
  clickCallback = () => {}

  // The index of this container within its parent container before it was brought to top
  renderIndex: number = undefined

  constructor(card: Card, container: any, interactive: Boolean = true) {
    card = card || cardback
    this.init(card, container, interactive)
  }

  init(card: Card, outerContainer: any, interactive: Boolean) {
    let that = this
    this.card = card

    let scene: Phaser.Scene = outerContainer.scene
    this.scene = scene

    // Card image
    this.image = scene.add.image(0, 0, card.name)
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
    .on('pointerout', () => {this.onHoverExit()(); hint.hide()})
    .on('pointerdown', () => that.clickCallback())

    this.txtPoints = this.scene.add['rexBBCodeText'](
      -Space.cardWidth/2 + 25,
      -Space.cardHeight/2 + 77,
      `${card.points}`,
      BBStyle.cardStats)
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerover', () => hint.showText(`This card is worth ${this.txtPoints.text} point${card.points === 1 ? '' : 's'}.`))
    .on('pointerout', () => {this.onHoverExit()(); hint.hide()})
    .on('pointerdown', () => that.clickCallback())
    this.setPoints(card.points)

    // Add keywords and references
    this.addKeywords()
    this.addReferences()

    // This container
    this.container = this.createContainer(outerContainer)

    if (interactive) {
      this.image.setInteractive()
      .on('pointerover', this.onHover())
      .on('pointerout', this.onHoverExit())
      .on('pointerdown', () => that.clickCallback())

      // If the mouse moves outside of the game, exit the hover also
      // NOTE This logic won't run until the frame after user interacts with the canvas
      // Removed, phaser does this anyways on returning to focus
      // this.scene.input.on('gameout', this.onHoverExit(true))
    }
  }

  destroy(): void {
    [
    this.image,
    this.txtCost,
    this.txtPoints,
    ...this.keywords,
    ...this.references,
    this.container
    ].forEach(obj => {
      obj.destroy()
    })
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
    // let callback
    // if (removeListeners || this.clickCallback === undefined) {
    //   callback = f
    // }
    // else {
    //   callback = () => {
    //     this.clickCallback()
    //     f()
    //   }
    // }

    this.clickCallback = f

    return this
  }

  // Set the callback to fire when this card's image is hovered, and one for when exited
  setOnHover(fHover: () => void, fExit: () => void): CardImage {
    var oldHover = this.hoverCallback
    this.hoverCallback = () => {
      oldHover()
      fHover()
    }

    var oldExit = this.exitCallback
    this.exitCallback = () => {
      // Don't do the callback if this isn't currently hovered
      if (!this.hovered) {
        return
      }

      oldExit()
      fExit()
    }

    return this
  }

  removeOnHover(): CardImage {
    this.hoverCallback = () => {}
    this.exitCallback = () => {}

    return this
  }

  // Set whether this card is playable
  setPlayable(isPlayable: Boolean): void {
    if (isPlayable) {
      this.image.clearTint()
    }
    else {
      this.image.setTint(Color.cardUnplayable)
    }
  }

  // Set that a card has resolved (In the story)
  setResolved(): CardImage {
    this.image.setTint(Color.cardUnplayable)
    
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
        keywordTuple.value,
        () => {that.clickCallback()})

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
        referenceTuple.y,
        () => {that.clickCallback()})

      this.references.push(reference)
    })
  }

  // Move this cardImage above everything else in its container when it's hovered
  moveToTopOnHover(): CardImage {
    let that = this
    let container = this.container
    let parentContainer = container.parentContainer

    // Reverse the order of everything from this objects index on
    // This makes this appear above everything, and things to the right to be in reverse order
    let fHover = () => {
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

    let fExit = () => {
      // From INDEX to the top is reversed, flip it back
      for (let i = parentContainer.length - 1; i >= that.renderIndex; i--) {
        parentContainer.bringToTop(parentContainer.getAt(i))
      }

      // Reset the render index to show no longer reversed
      that.renderIndex = undefined
    }

    this.setOnHover(fHover, fExit)

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

    return () => {
      // If already hovered, exit
      if (this.hovered) {
        return
      }
      this.hovered = true

      // Play a sound
      this.scene.sound.play('hover')

      // Apply the highlight effect
      doHighlight()

      // Do the callback
      this.hoverCallback()
    }
  }

  private onHoverExit(ignoreOverInternal = false): () => void {
    return () => {
      if (!this.hovered) {
        return
      }

      // If still over the internal elements, exit
      const pointer = this.scene.input.activePointer

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

      if (!ignoreOverInternal && overInternal) {
        return
      }

      // Remove the highlight effect
      this.scene.plugins.get('rexOutlinePipeline')['remove'](this.image)

      // Do the callback
      this.exitCallback()

      // Set the parameter to no longer hovered
      this.hovered = false
    }
  }

  // Show which player controls the card while it's in the story
  showController(player: number): CardImage {
    let color, angle
    if (player === 0) {
      color = 0x0000ff
      angle = -90
    } else {
      color = 0xff0000
      angle = 90
    }

    this.scene.plugins.get('rexDropShadowPipeline')['add'](this.image, {
      distance: 10,
      angle: angle,
      shadowColor: color,
    })

    return this
  }

}
