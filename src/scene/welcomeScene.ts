import "phaser"
import { StyleSettings, Space } from "../settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"


const SOUNDS = [
  'success',
  'failure',
  'click',
  'open',
  'close',
  'play',
  'pass',
  'draw',
  'discard',
  'create',
  'shuffle',
  'resolve',
  'win',
  'lose',
  'tie',

  'build',
  'inspire',
  'nourish',

  'yell'
]

export default class WelcomeScene extends BaseScene {
  
  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  // Load all assets used throughout the scenes
  preload(): void {
    // Load all of the card and token images
    this.load.path = "assets/"

    allCards.forEach( (card) => {
      this.load.image(card.name, `images/${card.name}.png`)
    })
    
    // Load all audio
    SOUNDS.forEach( (sound) => {
      this.load.audio(sound, `sfx/${sound}.wav`)
    })
    this.load.audio('background', 'music/background.wav')

    // Ensure that audio plays even when tab loses focus
    this.sound.pauseOnBlur = false
  }

  create(): void {
    // Display text and button
    this.add.text(Space.windowWidth/2, 200, "Celestial",
      StyleSettings.title).setOrigin(0.5)

    let txtStart = this.add.text(Space.windowWidth/2, 350, "Click to start",
      StyleSettings.announcement).setOrigin(0.5)

    let backgroundClickable = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight,
      0x000, 0).setOrigin(0, 0)
    backgroundClickable.setInteractive()
    backgroundClickable.on('pointerdown', this.doStart, this)

    // Tutorial Button
    let btnTutorial = this.add.text(Space.windowWidth/2, Space.windowHeight - 125, "Tutorial",
      StyleSettings.button).setOrigin(0.5)
    btnTutorial.setInteractive()
    btnTutorial.on('pointerdown', this.doTutorial, this)

    // Credits button
    let btnCredits = this.add.text(Space.windowWidth/2, Space.windowHeight - 50, "Credits",
      StyleSettings.button).setOrigin(0.5)
    btnCredits.setInteractive()
    btnCredits.on('pointerdown', this.doCredits, this)

    super.create()
  }

  private doStart(): void {
    this.sound.play('click')
    this.scene.start("BuilderScene", {isTutorial: false})
  }

  private doTutorial(): void {
    this.sound.play('click')
    this.scene.start("BuilderScene", {isTutorial: true})
  }

  private doCredits(): void {
    this.sound.play('click')
    this.scene.start("CreditsScene")
  }
}
