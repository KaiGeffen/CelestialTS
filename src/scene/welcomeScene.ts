import "phaser"
import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings } from "../settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/button"


const tutorialItem = 'tutorialKnown'
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

  'meow',
  'yell'
]

export default class WelcomeScene extends BaseScene {
  
  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  // TODO This should happen once, somewhere before here. This scene is preloaded many times
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

    // Ensure that every user setting is either set, or set it to its default value
    ensureUserSettings()

    this.sound.volume = UserSettings._get('volume')
  }

  create(): void {
    // Display text and button
    this.add.text(Space.windowWidth/2, 200, "Celestial",
      StyleSettings.title).setOrigin(0.5)

    // Start Button
    new Button(this, Space.windowWidth/2, 350, "Click to Start", this.doStart).setOrigin(0.5).setStyle(StyleSettings.announcement)

    // Tutorial Button
    let btnTutorial = new Button(this, Space.windowWidth/2, Space.windowHeight - 125, "Tutorial", this.doTutorial).setOrigin(0.5)

    // Credits button
    let btnCredits = new Button(this, Space.windowWidth/2, Space.windowHeight - 50, "Credits", this.doCredits).setOrigin(0.5)

    super.create()
  }

  private createTutorialPrompt(): void {
    let promptContainer = this.add.container(0, 0).setDepth(25)
    let exitPrompt = function() {
      // Set that user has been prompted to try the tutorial
      localStorage.setItem(tutorialItem, JSON.stringify(true))

      this.scene.start("BuilderScene", {isTutorial: false})
      // promptContainer.setVisible(false)
    }

    // Exit confirmation container
    let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0xffffff, 0).setOrigin(0, 0)
    invisibleBackground.setInteractive().on('pointerdown', exitPrompt, this)

    let visibleBackground = this.add.rectangle(Space.windowWidth/2, Space.windowHeight/2, 800, 200, ColorSettings.menuBackground, 0.95)
    visibleBackground.setInteractive()

    let txtHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Would you like to try the tutorial?', StyleSettings.announcement).setOrigin(0.5, 0.5)

    let btnYes = new Button(this, Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', this.doTutorial).setOrigin(1, 0.5)
    let btnNo = new Button(this, Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', exitPrompt).setOrigin(0, 0.5)

    promptContainer.add([invisibleBackground, visibleBackground, txtHint, btnYes, btnNo])
  }

  private doStart(): void {
    this.sound.play('click')

    // Guide user to Tutorial if this is their first time here
    if (localStorage.getItem(tutorialItem) === null) {
      this.createTutorialPrompt()
    }
    else {
      this.scene.start("BuilderScene", {isTutorial: false})
    }
  }

  private doTutorial(): void {
    // Set that user has seen the tutorial
    localStorage.setItem(tutorialItem, JSON.stringify(true))

    this.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})

    // this.scene.start("BuilderScene", {isTutorial: true})
  }

  private doCredits(): void {
    this.scene.start("CreditsScene")
  }
}
