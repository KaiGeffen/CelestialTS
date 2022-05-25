import "phaser"
import { Style, Color, Space, UserProgress, Url } from "../settings/settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/button"
import Icon from "../lib/icon"
import Menu from "../lib/menu"


export default class HomeScene extends BaseScene {
  tutorialRegion

  constructor() {
    super({
      key: "HomeScene"
    })
  }

  init(): void {
    this.tutorialRegion = new TutorialRegion(this)
  }

  create(): void {
    // Region for tutorial options
    this.tutorialRegion.create()

    // Display text and button
    this.add.text(Space.windowWidth/2, Space.windowHeight/2 - 150, "Celestial",
      Style.title).setOrigin(0.5)

    // TODO Logout, save the most recent token so that new celestial.com website visits don't start logged out
    // if (!UserSettings._get('loggedIn')) {
    //   // Login button
    //   let btnLogin = new Button(this, Space.pad/2, 0, "Login", this.doLogin).setOrigin(0)
    // }

    // Discord button
    let btnDiscord = new Button(this, Space.windowWidth/2 + 100, Space.windowHeight - 50, "Discord").setOrigin(0.5)
    btnDiscord.setOnClick(this.doDiscord(btnDiscord))
    if (!UserProgress.contains('discord')) {
      btnDiscord.glowUntilClicked()
    }

    // Adventure button
    let btnAdventure = new Button(this, Space.windowWidth/2, Space.windowHeight - 100, "Adventure", this.doAdventure).setOrigin(0.5)

    // Start Button
    new Button(this, Space.windowWidth/2, Space.windowHeight/2, "Click to Start", this.doStart()).setOrigin(0.5)//.setStyle(Style.announcement)

    let msgText = UserProgress.getMessage('welcome')
    if (msgText !== undefined) {
      this.displayMessage(msgText)
    }
    
    super.create()
  }

  private displayMessage(message: string): void {
    return

    // TODO Rework all this
    let menu = new Menu(
      this,
      1000,
      300,
      true,
      25)

    // TODO Don't always say Congratulations, make the first line of message the title?
    let txtTitle = this.add.text(0, -110, 'Congratulations!', Style.announcement).setOrigin(0.5)
    let txtMessage = this.add.text(0, -50, message, Style.basic).setOrigin(0.5, 0)
    
    menu.add([txtTitle, txtMessage])
  }

  // Do everything that occurs when the start button is pressed - either start, or prompt tutorial
  private doStart(): () => void {
    let that = this
    return function() {
      // Guide user to Tutorial if this is their first time here
      if (UserProgress.addAchievement('tutorialKnown')) {
      }
      else {
        that.doDeckbuilder()
      }
    }
  }

  private doDeckbuilder(): void {
    UserProgress.addAchievement('deckMenuNotice')
    
    this.scene.start("BuilderScene", {isTutorial: false})
  }

  private doAdventure(): void {
    this.scene.start("AdventureScene")
  }

  private doCredits(): void {
    this.scene.start("CreditsScene")
  }
  
  private doDiscord(btnDiscord: Button): () => void {
    return function() {
      UserProgress.addAchievement('discord')
    
      window.open(Url.discord)
    }
  }

  private doLogin(): void {
    window.open(Url.oauth)
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
      width,
      height,
      false,
      30)


    // Add icons
    let iconBasics = new Icon(this.scene, this.menu, 0, -yDelta, 'Basics', function() {
      that.scene.scene.start("TutorialScene1", {isTutorial: true, tutorialNumber: 1, deck: []})
    })
    // let iconDraft = new Icon(this.scene, this.menu, -xDelta, -yDelta, 'Draft', function() {
    //   UserProgress.addAchievement('draftNotice')
    //   that.scene.scene.start("DraftBuilderScene")
    // })

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
    let iconLord = new Icon(this.scene, this.menu, -xDelta, yDelta, 'Lord', function() {
      that.scene.scene.start("LordCatalogScene")
    })
    let iconBastet = new Icon(this.scene, this.menu, 0, yDelta, 'Bastet', function() {
      that.scene.scene.start("BastetCatalogScene")
    })
    let iconHorus = new Icon(this.scene, this.menu, xDelta, yDelta, 'Horus', function() {
      that.scene.scene.start("HorusCatalogScene")
    })

    // Unlock (Make clickable and legible) any tutorials which user now has access to
    if (!UserProgress.contains('tutorialComplete')) {
      // iconDraft.lock()
      iconAnubis.lock()
      iconRobots.lock()
      iconStalker.lock()
    }
    if (!(UserProgress.contains('tutorialCompleteAnubis') &&
      UserProgress.contains('tutorialCompleteRobots') &&
      UserProgress.contains('tutorialCompleteStalker'))) {
      iconLord.lock()
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
      UserProgress.addAchievement('tutorialKnown')

      that.menu.open()
    }
  }

  // Create a check mark over each tutorial that user has completed
  private createCheckMarks(xDelta: number, yDelta: number): void {
    UserProgress.contains('tutorialCompleteAnubis')
    if (UserProgress.contains('tutorialComplete')) {
      this.menu.add(this.scene.add.text(0, -yDelta, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    // Core set decks
    if (UserProgress.contains('tutorialCompleteAnubis')) {
      this.menu.add(this.scene.add.text(-xDelta, 0, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserProgress.contains('tutorialCompleteRobots')) {
      this.menu.add(this.scene.add.text(0, 0, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserProgress.contains('tutorialCompleteStalker')) {
      this.menu.add(this.scene.add.text(xDelta, 0, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    // Expansion decks
    if (UserProgress.contains('tutorialCompleteLord')) {
      this.menu.add(this.scene.add.text(-xDelta, yDelta, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserProgress.contains('tutorialCompleteBastet')) {
      this.menu.add(this.scene.add.text(0, yDelta, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }

    if (UserProgress.contains('tutorialCompleteHorus')) {
      this.menu.add(this.scene.add.text(xDelta, yDelta, '✓', Style.checkMark).setOrigin(0.5).setDepth(1))
    }
  }

  // Set the coloring that happens when the icon is hovered/not
  private setIconHover(btn: Phaser.GameObjects.Image): void {
    btn.setInteractive()
    btn.on('pointerover', function() {
      btn.setTint(Color.iconHighlight)
    })
    btn.on('pointerout', function() {
      btn.clearTint()
    })
  }
}
