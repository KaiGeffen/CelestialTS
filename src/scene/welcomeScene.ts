import "phaser"
// TODO Remove unused
import { StyleSettings, ColorSettings, Space, ensureUserSettings, UserSettings } from "../settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"
import MessageManager from "../lib/message"


export default class WelcomeScene extends BaseScene {
  tutorialRegion

  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  init(): void {
    this.tutorialRegion = new TutorialRegion(this)
  }

  create(): void {
    super.precreate()
    
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



    let msgText = MessageManager.readFirstUnreadMessage()
    if (msgText !== undefined) {
      this.displayMessage(msgText)

      // TODO Shouldn't do this in all cases, adjust if messages are more than just tutorials
      // NOTE This needs to happen before new options are indicated below, because it can set those settings
      UserSettings._set('newTutorial', true)
    }

    // Indicate which buttons have new options in them
    this.indicateNewOptions(btnTutorial, btnDiscord)
    
    super.create()
  }

  private createTutorialPrompt(btnTutorial: Button): void {
    let menu = new Menu(
      this,
      Space.windowWidth/2,
      Space.windowHeight/2,
      800,
      200,
      true,
      25)

    let txtHint = this.add.text(0, -40, 'Would you like to try the tutorial?', StyleSettings.announcement).setOrigin(0.5, 0.5)

    // Yes button exits this menu and opens the tutorial menu
    let btnYes = new Button(this, -50, 40, 'Yes', () => menu.close()).setOrigin(1, 0.5)
    btnYes.setOnClick(this.tutorialRegion.onOpenMenu(btnTutorial))
    let btnNo = new Button(this, 50, 40, 'No', this.doDeckbuilder).setOrigin(0, 0.5)

    menu.add([txtHint, btnYes, btnNo])
  }

  private displayMessage(message: string): void {
    let menu = new Menu(
      this,
      Space.windowWidth/2,
      Space.windowHeight/2,
      800,
      300,
      true,
      25)

    // TODO Don't always say Congratulations, make the first line of message the title?
    let txtTitle = this.add.text(0, -110, 'Congratulations!', StyleSettings.announcement).setOrigin(0.5)
    let txtMessage = this.add.text(0, -50, message, StyleSettings.basic).setOrigin(0.5, 0)
    
    menu.add([txtTitle, txtMessage])
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

    let xDelta = Space.iconSeparation
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


    // Add icons
    let iconBasics = new Icon(this.scene, this.menu, 0, -yDelta, 'Basics', function() {
      that.scene.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})
    })

    // Core icons
    let iconAnubis = new Icon(this.scene, this.menu, -xDelta, 0, 'Anubis', function() {
      that.scene.scene.start("AnubisCatalogScene")
    })
    let iconRobots = new Icon(this.scene, this.menu, 0, 0, 'Robots', function() {
      that.scene.scene.start("RobotsCatalogScene")
    })
    let iconStalker = new Icon(this.scene, this.menu, xDelta, 0, 'Stalker', function() {
      that.scene.scene.start("StalkerCatalogScene")
    })

    // Expansion icons
    let iconCrypt = new Icon(this.scene, this.menu, -xDelta, yDelta, 'Crypt', function() {
      UserSettings._set('useExpansion', true)
      that.scene.scene.start("CryptCatalogScene")
    })
    let iconBastet = new Icon(this.scene, this.menu, 0, yDelta, 'Bastet', function() {
      UserSettings._set('useExpansion', true)
      that.scene.scene.start("BastetCatalogScene")
    })
    let iconHorus = new Icon(this.scene, this.menu, xDelta, yDelta, 'Horus', function() {
      UserSettings._set('useExpansion', true)
      that.scene.scene.start("HorusCatalogScene")
    })

    // Unlock (Make clickable and legible) any tutorials which user now has access to
    let completed = UserSettings._get('completedTutorials')
    if (!completed.includes('Basics')) {
      iconAnubis.lock()
      iconRobots.lock()
      iconStalker.lock()
    }
    if (!(completed.includes('Anubis') && completed.includes('Robots') && completed.includes('Stalker'))) {
      iconCrypt.lock()
      iconBastet.lock()
      iconHorus.lock()
    }

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
