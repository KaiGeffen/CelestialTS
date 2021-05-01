import "phaser"
// TODO Remove unused
import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings } from "../settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/button"


export default class WelcomeScene extends BaseScene {
  
  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  create(params?: any): void {
    // Display text and button
    this.add.text(Space.windowWidth/2, 200, "Celestial",
      StyleSettings.title).setOrigin(0.5)

    // Start Button
    new Button(this, Space.windowWidth/2, 350, "Click to Start", this.doStart).setOrigin(0.5).setStyle(StyleSettings.announcement)

    // Tutorial Button
    let btnTutorial = new Button(this, Space.windowWidth/2, Space.windowHeight - 125, "Tutorial", this.doTutorial).setOrigin(0.5)

    // Credits button
    let btnCredits = new Button(this, Space.windowWidth/2, Space.windowHeight - 50, "Credits", this.doCredits).setOrigin(0.5)

    // If the player just completed the tutorial and is returning to this scene
    if (params['tutorialComplete']) {
      this.createTutorialCompleteMessage()
    }
    
    super.create()

    // Ensure that the param doesn't keep the same value next time it's started
    params.tutorialComplete = false
  }

  private createTutorialPrompt(): void {
    let promptContainer = this.add.container(0, 0).setDepth(25)
    let exitPrompt = function() {
      // Set that user has been prompted to try the tutorial
      UserSettings._set('tutorialKnown', true)

      promptContainer.setVisible(false)
    }

    // Exit confirmation container
    let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
    invisibleBackground.setInteractive().on('pointerdown', exitPrompt, this)

    let visibleBackground = this.add['rexRoundRectangle'](Space.windowWidth/2, Space.windowHeight/2, 800, 200, 30, ColorSettings.menuBackground).setAlpha(0.95)
    visibleBackground.setInteractive()

    let txtHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Would you like to try the tutorial?', StyleSettings.announcement).setOrigin(0.5, 0.5)

    let btnYes = new Button(this, Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', this.doTutorial).setOrigin(1, 0.5)
    let btnNo = new Button(this, Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', exitPrompt).setOrigin(0, 0.5)

    promptContainer.add([invisibleBackground, visibleBackground, txtHint, btnYes, btnNo])
  }

  private createTutorialCompleteMessage(): void {
    let promptContainer = this.add.container(0, 0).setDepth(25)
    let exitPrompt = function() {
      promptContainer.setVisible(false)
    }

    // Exit confirmation container
    let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
    invisibleBackground.setInteractive().on('pointerdown', exitPrompt, this)

    let visibleBackground = this.add['rexRoundRectangle'](Space.windowWidth/2, Space.windowHeight/2, 800, 300, 30, ColorSettings.menuBackground).setAlpha(0.95)
    visibleBackground.setInteractive()

    let txtTitle = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 110, 'Congratulations!', StyleSettings.announcement).setOrigin(0.5)
    let txtMessage = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 50,
`You completed the tutorial. All of the cards in the
base set are now available to you!

Click start to check them out.`, StyleSettings.basic).setOrigin(0.5, 0)
    
    promptContainer.add([invisibleBackground, visibleBackground, txtTitle, txtMessage])
  }


  private doStart(): void {
    this.sound.play('click')

    // Guide user to Tutorial if this is their first time here
    if (!UserSettings._get('tutorialKnown')) {
      this.createTutorialPrompt()
    }
    else {
      this.scene.start("BuilderScene", {isTutorial: false})
    }
  }

  private doTutorial(): void {
    // Set that user has seen the tutorial
    UserSettings._set('tutorialKnown', true)

    // this.scene.start("CatalogScene")

    this.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})

    // this.scene.start("BuilderScene", {isTutorial: true})
  }

  private doCredits(): void {
    this.scene.start("CreditsScene")
  }
}
