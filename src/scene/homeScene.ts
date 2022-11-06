import "phaser"
import { Style, Color, Space, UserProgress, Url, UserSettings } from "../settings/settings"
import { allCards } from "../catalog/catalog"
import BaseScene from "./baseScene"
import Button from "../lib/buttons/button"
import Buttons from "../lib/buttons/buttons"
import Icons from "../lib/buttons/icons"
import Icon from "../lib/icon"
import Menu from "../lib/menu"
import intro from "../adventures/intro.json"
import Loader from '../loader/loader'


const headerHeight = Space.iconSize + Space.pad * 2

export default class HomeScene extends BaseScene {

  constructor() {
    super({
      key: "HomeScene"
    })
  }

  create(): void {
    this.createHeader()

    this.createButtons()
    
    super.create()
  }

  // Hide the signin button
  beforeExit(): void {
    document.getElementById("signin").hidden = true
  }

  private createHeader(): void {
    // Make the background
    let background = this.add.rectangle(0, 0, Space.windowWidth, headerHeight, Color.background2)
    .setOrigin(0)

    this.plugins.get('rexDropShadowPipeline')['add'](background, {
      distance: 3,
      angle: -90,
      shadowColor: 0x000000,
    })
    
    // Show the login button
    document.getElementById("signin").hidden = false

    // Create Discord button
    let btnDiscord = new Icons.Discord(this, Space.smallButtonWidth + Space.pad, 9)
    .setOrigin(0)

    btnDiscord.setOnClick(this.doDiscord(btnDiscord))

    // Create title
    this.add.text(Space.windowWidth/2, headerHeight/2, "Celestial", Style.homeTitle)
    .setOrigin(0.5)
  }

  private createButtons(): void {
    const y = headerHeight + (Space.windowHeight - headerHeight)/2

    const width = (Space.windowWidth - Space.pad * 3)/2
    const height = Space.windowHeight - headerHeight - Space.pad * 2

    let rectLeft = this.add.rectangle(Space.windowWidth/2 - Space.pad/2,
      headerHeight + Space.pad,
      width,
      height,
      0x303030,
      1)
    .setOrigin(1, 0)

    // Add tweens that make the map circle
    const time = 30000

    let map = this.add.sprite(0, 0, 'bg-Map Small')
    .setOrigin(0)

    let tweens: Phaser.Tweens.Tween[] = []
    tweens.push(this.tweens.add({
      targets: map,
      x: -(map.displayWidth - width - Space.pad),
      duration: time,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    }))

    tweens.push(this.tweens.add({
      targets: map,
      y: -(map.displayHeight - height - Space.pad - headerHeight),
      duration: time,
      delay: time/2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    }))

    // While not hovered, rectangle is greyed
    rectLeft.setInteractive()
    .on('pointerover', () => {
      map.setTint(0x444444)
    })
    .on('pointerout', () => {
      map.clearTint()
    })
    .on('pointerdown', () => {
      this.doAdventure()
    })

    map.mask = new Phaser.Display.Masks.BitmapMask(this, rectLeft)

    // Text over the rectangle
    this.add.text(rectLeft.x - rectLeft.displayWidth/2, rectLeft.y + rectLeft.displayHeight/2, 'Adventure', Style.homeTitle)
    .setOrigin(0.5)



    // Free Play button
    let rectRight = this.add.rectangle(Space.windowWidth/2 + Space.pad/2,
      headerHeight + Space.pad,
      width,
      height,
      0x303030,
      1)
    .setOrigin(0, 0)

    let freePlay = this.add.sprite(
      rectRight.x,
      rectRight.y,
      'bg-Free Play')
    .setOrigin(0)

    // While not hovered, rectangle is greyed
    rectRight.setInteractive()
    .on('pointerover', () => {
      freePlay.setTint(0x444444)
    })
    .on('pointerout', () => {
      freePlay.clearTint()
    })
    .on('pointerdown', this.doStart())

    freePlay.mask = new Phaser.Display.Masks.BitmapMask(this, rectRight)

    // Text over the rectangle
    this.add.text(rectRight.x + rectRight.displayWidth/2, rectRight.y + rectRight.displayHeight/2, 'Free Play', Style.homeTitle)
    .setOrigin(0.5)
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
      that.doDeckbuilder()
    }
  }

  private doDeckbuilder(): void {
    UserProgress.addAchievement('deckMenuNotice')
    
    this.beforeExit()
    this.scene.start("BuilderScene", {isTutorial: false})
  }

  private doAdventure(): void {
    // If the loader hasn't finished loading the story assets, error
    if (!Loader.postLoadComplete) {
      this.signalError("Assets for story mode are still loading...")
      return
    }

    this.beforeExit()

    // If user hasn't completed the tutorial, jump to the last tutorial they haven't completed
    const missions = UserSettings._get('completedMissions')
    for (let i = 0; i < intro.length; i++) {

      // If this tutorial mission hasn't been completed, jump to that mission
      if (!missions[i]) {
        this.scene.start("TutorialGameScene", {isTutorial: false, deck: undefined, mmCode: `ai:t${i}`, missionID: i})
        return
      }
    }

    // Otherwise, go to the adventure scene map
    this.scene.start("AdventureScene")
  }

  private doDiscord(btnDiscord: Button): () => void {
    return function() {
      UserProgress.addAchievement('discord')
    
      window.open(Url.discord)
    }
  }
}
