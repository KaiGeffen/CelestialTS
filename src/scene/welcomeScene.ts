import "phaser"
// TODO Remove unused
import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings } from "../settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Menu from "../lib/menu"


const TUTORIAL_COMPLETE_MSG =
`You completed the tutorial. All of the cards in the
base set are now available to you!

Click start to check them out.`


export default class WelcomeScene extends BaseScene {
  tutorialRegion

  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  init(params: any): void {
    this.tutorialRegion = new TutorialRegion(this)
  }

  create(params?: any): void {
    // Region for tutorial options
    this.tutorialRegion.create()

    // Display text and button
    this.add.text(Space.windowWidth/2, 200, "Celestial",
      StyleSettings.title).setOrigin(0.5)

    // Tutorial button (Do first tutorial if they haven't started it, otherwise open the tutorial selection)
    let btnTutorial = new Button(this, Space.windowWidth/2 - 200, Space.windowHeight - 50, "Tutorial").setOrigin(0.5)
    btnTutorial.setOnClick(this.tutorialRegion.onOpenMenu(btnTutorial))

    // Credits button
    let btnCredits = new Button(this, Space.windowWidth/2, Space.windowHeight - 50, "Credits", this.doCredits).setOrigin(0.5)

    // Discord button
    let btnDiscord = new Button(this, Space.windowWidth/2 + 200, Space.windowHeight - 50, "Discord").setOrigin(0.5)
    btnDiscord.setOnClick(this.doDiscord(btnDiscord))

    // Start Button
    new Button(this, Space.windowWidth/2, 350, "Click to Start", this.doStart(btnTutorial)).setOrigin(0.5).setStyle(StyleSettings.announcement)



    // If the player just completed the tutorial and is returning to this scene
    if (params['tutorialComplete']) {
      this.createTutorialCompleteMessage()

      // NOTE This needs to happen before new options are indicated below, because it can set those settings
      UserSettings._set('newTutorial', true)
    }

    // Indicate which buttons have new options in them
    this.indicateNewOptions(btnTutorial, btnDiscord)
    
    super.create()

    // Ensure that the param doesn't keep the same value next time it's started
    params.tutorialComplete = false
  }

  private createTutorialPrompt(btnTutorial: Button): void {
    let promptContainer = this.add.container(0, 0).setDepth(25)
    let exitPrompt = function() {
      promptContainer.setVisible(false)
    }

    // Exit confirmation container
    let invisibleBackground = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight, 0x000000, 0.2).setOrigin(0, 0)
    invisibleBackground.setInteractive().on('pointerdown', exitPrompt, this)

    let visibleBackground = this.add['rexRoundRectangle'](Space.windowWidth/2, Space.windowHeight/2, 800, 200, 30, ColorSettings.menuBackground).setAlpha(0.95)
    visibleBackground.setInteractive()

    let txtHint = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 40, 'Would you like to try the tutorial?', StyleSettings.announcement).setOrigin(0.5, 0.5)

    // Yes button exits this menu and opens the tutorial menu
    let btnYes = new Button(this, Space.windowWidth/2 - 50, Space.windowHeight/2 + 40, 'Yes', exitPrompt).setOrigin(1, 0.5)
    btnYes.setOnClick(this.tutorialRegion.onOpenMenu(btnTutorial))
    let btnNo = new Button(this, Space.windowWidth/2 + 50, Space.windowHeight/2 + 40, 'No', this.doDeckbuilder).setOrigin(0, 0.5)

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
    let txtMessage = this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 50, TUTORIAL_COMPLETE_MSG, StyleSettings.basic).setOrigin(0.5, 0)
    
    promptContainer.add([invisibleBackground, visibleBackground, txtTitle, txtMessage])
  }

  private indicateNewOptions(btnTutorial: Button, btnDiscord: Button): void {
    if (UserSettings._get('newDiscord')) {
      btnDiscord.glow()
    }

    if (UserSettings._get('newTutorial')) {
      btnTutorial.glow()
    }
  }

  // Do everything that occurs when the start button is pressed - either start, or prompt tutorial
  private doStart(btnTutorial: Button): () => void {
    let that = this
    return function() {
      that.sound.play('click')

      // Guide user to Tutorial if this is their first time here
      if (!UserSettings._get('tutorialKnown')) {
        // Set that user has been prompted to try the tutorial
        UserSettings._set('tutorialKnown', true)

        that.createTutorialPrompt(btnTutorial)
      }
      else {
        that.doDeckbuilder()
      }
    }
  }

  private doDeckbuilder(): void {
    this.scene.start("BuilderScene", {isTutorial: false})
  }

  private doCredits(): void {
    this.scene.start("CreditsScene")
  }
  
  private doDiscord(btnDiscord: Button): () => void {
    return function() {
      btnDiscord.stopGlow()
      UserSettings._set('newDiscord', false)
    
      window.open("https://discord.gg/UXWswspB8S")
    }
  }
}


class TutorialRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  menu: Menu

  constructor(scene: Phaser.Scene) {
    this.init(scene)
  }

  init(scene: Phaser.Scene): void {
    this.scene = scene
  }

  create(): void {
    let that = this

    // Dimensions
    // Height of the label
    let yLbl = Space.cardSize / 2

    let xDelta = (Space.cardSize + Space.pad) * 3/2
    let yDelta = Space.cardSize + Space.pad + yLbl
    let x = Space.cardSize + Space.pad/2
    let y = Space.cardSize * 3/2 + Space.pad * 2

    let width = xDelta * 3 //Space.cardSize * 5 + Space.pad * 2
    let height = yDelta * 3 + yLbl //Space.cardSize * 3 + Space.pad * 4 * 2
    
    // Make this menu which all the objects go in
    this.menu = new Menu(
      this.scene, 
      Space.windowWidth / 2,
      Space.windowHeight / 2,
      width,
      height,
      false,
      30)



    // Basics button + reminder
    let txtBasics = this.scene.add.text(0, 0 - yDelta - yLbl, 'Basics', StyleSettings.announcement).setOrigin(0.5, 1)

    let btnBasics = this.scene.add.image(0, 0 - yDelta, 'icon-basics')
    this.setIconHover(btnBasics)
    btnBasics.on('pointerdown', function() {
      that.scene.sound.play('click')
      that.scene.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})
    })

    // Anubis tutorial
    let txtAnubis = this.scene.add.text(-xDelta, -yLbl, 'Anubis', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnAnubis = this.scene.add.image(-xDelta, 0, 'icon-anubis')

    // Robots tutorial
    let txtRobots = this.scene.add.text(0, -yLbl, 'Robots', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnRobots = this.scene.add.image(0, 0, 'icon-robots')

    // Stalker tutorial
    let txtStalker = this.scene.add.text(xDelta, -yLbl, 'Stalker', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnStalker = this.scene.add.image(xDelta, 0, 'icon-stalker')

    // Expansion
    // Crypt tutorial
    let txtCrypt = this.scene.add.text(-xDelta, yDelta - yLbl, 'Crypt', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnCrypt = this.scene.add.image(-xDelta, yDelta, 'icon-crypt')

    // Bastet tutorial
    let txtBastet = this.scene.add.text(0, yDelta - yLbl, 'Bastet', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnBastet = this.scene.add.image(0, yDelta, 'icon-bastet')

    // Horus tutorial
    let txtHorus = this.scene.add.text(xDelta, yDelta - yLbl, 'Horus', StyleSettings.announcement).setOrigin(0.5, 1)
    let btnHorus = this.scene.add.image(xDelta, yDelta, 'icon-horus')

    // Unlock (Make clickable and legible) any tutorials which user now has access to
    let completed = UserSettings._get('completedTutorials')
    if (completed.includes('Basics')) {
      this.setIconHover(btnAnubis)
      btnAnubis.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("AnubisCatalogScene")
      })

      this.setIconHover(btnRobots)
      btnRobots.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("RobotsCatalogScene")
      })

      this.setIconHover(btnStalker)
      btnStalker.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("StalkerCatalogScene")
      })
    }
    else {
      txtAnubis.setText('???').setAlpha(0.3)
      btnAnubis.setAlpha(0.3)

      txtRobots.setText('???').setAlpha(0.3)
      btnRobots.setAlpha(0.3)

      txtStalker.setText('???').setAlpha(0.3)
      btnStalker.setAlpha(0.3)
    }
    // Unlock the lowest row of challenges if the previous row is complete
    if (completed.includes('Anubis') && completed.includes('Robots') && completed.includes('Stalker')) {
      this.setIconHover(btnCrypt)
      btnCrypt.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("CryptCatalogScene")
      })

      this.setIconHover(btnBastet)
      btnBastet.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("BastetCatalogScene")
      })

      this.setIconHover(btnHorus)
      btnHorus.on('pointerdown', function() {
        that.scene.sound.play('click')
        that.scene.scene.start("HorusCatalogScene")
      })
    }
    else
    {
      txtCrypt.setText('???').setAlpha(0.3)
      btnCrypt.setAlpha(0.3)

      txtBastet.setText('???').setAlpha(0.3)
      btnBastet.setAlpha(0.3)

      txtHorus.setText('???').setAlpha(0.3)
      btnHorus.setAlpha(0.3)
    }

    // Add everything to this menu
    this.menu.add([
      btnBasics, txtBasics,
      txtAnubis, btnAnubis,
      txtRobots, btnRobots,
      txtStalker, btnStalker,
      txtCrypt, btnCrypt,
      txtBastet, btnBastet,
      txtHorus, btnHorus,
      ])

    // Add check marks over each completed tutorial
    this.createCheckMarks(xDelta, yDelta)
  }

  onOpenMenu(btnTutorial: Button): () => void {
    let that = this
    return function() {
      btnTutorial.stopGlow()
      UserSettings._set('tutorialKnown', true)
      UserSettings._set('newTutorial', false)

      that.menu.open()
    }
  }

  // Create a check mark over each tutorial that user has completed
  private createCheckMarks(xDelta: number, yDelta: number): void {
    if (UserSettings._get('completedTutorials').includes('Basics')) {
      this.menu.add(this.scene.add.text(0, -yDelta, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    // Core set decks
    if (UserSettings._get('completedTutorials').includes('Anubis')) {
      this.menu.add(this.scene.add.text(-xDelta, 0, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserSettings._get('completedTutorials').includes('Robots')) {
      this.menu.add(this.scene.add.text(0, 0, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserSettings._get('completedTutorials').includes('Stalker')) {
      this.menu.add(this.scene.add.text(xDelta, 0, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    // Expansion decks
    if (UserSettings._get('completedTutorials').includes('Crypt')) {
      this.menu.add(this.scene.add.text(-xDelta, yDelta, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserSettings._get('completedTutorials').includes('Bastet')) {
      this.menu.add(this.scene.add.text(0, yDelta, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserSettings._get('completedTutorials').includes('Horus')) {
      this.menu.add(this.scene.add.text(xDelta, yDelta, '✓', StyleSettings.checkMark).setOrigin(0.5).setDepth(1))
    }
  }

  // Set the coloring that happens when the icon is hovered/not
  private setIconHover(btn: Phaser.GameObjects.Image): void {
    btn.setInteractive()
    btn.on('pointerover', function() {
      btn.setTint(ColorSettings.cardHighlight)
    })
    btn.on('pointerout', function() {
      btn.clearTint()
    })
  }
}
