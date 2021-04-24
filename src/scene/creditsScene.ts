import "phaser"
import { StyleSettings, Space } from "../settings"
import BaseScene from "./baseScene"


export default class CreditsScene extends BaseScene {
  
  constructor() {
    super({
      key: "CreditsScene"
    })
  }

  create(): void {
    this.add.text(Space.windowWidth/2, 80, "Credits",
      StyleSettings.title).setOrigin(0.5)

    let txtStart = this.add.text(Space.windowWidth/2, Space.windowHeight - 40, "Click to exit",
      StyleSettings.announcement).setOrigin(0.5)

    let backgroundClickable = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight,
      0x000, 0).setOrigin(0, 0)
    backgroundClickable.setInteractive()
    backgroundClickable.on('pointerdown', this.doWelcome, this)

    // Credit for all art
    let creditText: string = "All icons are from game-icons.net under CC BY 3.0"

    let creditsDelapouite = "Delapouite: https://delapouite.com/\nSparkles, Spy, Swift, Crypt, Fishing Boat, Factory, Mine, Force, Uprising, Sarcophagus, Anubis, Horus, Enrage, Camera, Butterfly, Bandit, Wanted Poster, Night Vision, Bastet, Stable, Pelican, Beehive, Eagle, Icarus"
    let creditsLorc = "Lorc: https://lorcblog.blogspot.com/\nBone Knife, Cog, Crossed Bones, Dove, Juggle, Drown, Gears, Dash, Cosmos, Fruiting, Gift, Paranoia, Hurricane, Dinosaur Bones, Oak, Cardback, Broken Bone, Robot, Bee, Disintegrate, Imprison"
    let creditsBerandas = "Lord Berandas: https://www.deviantart.com/berandas\nSine, AI"
    let creditsDarkZaitzev = "Dark Zaitzev: https://www.deviantart.com/darkzaitzev\nStalker"
    let creditsCathelineau = "Cathelineau: Tumulus"
    let creditsSkoll = "Skoll: Raise Dead"
    let creditsCaroAsercion = "Caro Asercion: Boar"
    
    let authors = [creditsDelapouite, creditsLorc, creditsBerandas, creditsDarkZaitzev, creditsCathelineau, creditsSkoll, creditsCaroAsercion]
    for (var i = 0; i < authors.length; i++) {
      creditText += '\n\n\t\t\t\t' + authors[i]
    }

    this.add.text(Space.windowWidth/2, 150, creditText,
      StyleSettings.credits).setOrigin(0.5, 0)

    super.create()
  }

  private doWelcome(): void {
    this.sound.play('click')
    this.scene.start("WelcomeScene")
  }
}
