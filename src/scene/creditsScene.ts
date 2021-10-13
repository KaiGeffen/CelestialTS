import "phaser"
import { StyleSettings, ColorSettings, Space } from "../settings"
import BaseScene from "./baseScene"
import Button from "../lib/button"


export default class CreditsScene extends Phaser.Scene {
  
  constructor() {
    super({
      key: "CreditsScene"
    })
  }

  create(): void {
    this.createCreditsTextbox()

    this.add.text(Space.windowWidth/2, 80, "Credits", StyleSettings.title).setOrigin(0.5)

    let btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight - 40, "Exit", this.doWelcome).setOrigin(0.5)
  }

  private createCreditsTextbox(): void {
    // Credit for all art
    let creditText: string = "All icons are from game-icons.net under CC BY 3.0"

    let creditsDelapouite = "Delapouite: https://delapouite.com/\nStars, Spy, Swift, Crypt, Fishing Boat, Factory, Mine, Chimney, Uprising, Sarcophagus, Anubis, Horus, Enrage, Camera, Butterfly, Bandit, Wanted Poster, Night Vision, Bastet, Stable, Pelican, Beehive, Eagle, Icarus, Ecology, PVP icon, Draft icon"
    let creditsLorc = "Lorc: https://lorcblog.blogspot.com/\nBone Knife, Cog, Crossed Bones, Dove, Juggle, Drown, Gears, Dash, Cosmos, Fruiting, Gift, Paranoia, Hurricane, Dinosaur Bones, Lotus, Oak, Cardback, Broken Bone, Robot, Bee, Disintegrate, Imprison, Basics icon"
    let creditsBerandas = "Lord Berandas: https://www.deviantart.com/berandas\nSine, AI"
    let creditsDarkZaitzev = "Dark Zaitzev: https://www.deviantart.com/darkzaitzev\nStalker"
    let creditsCathelineau = "Cathelineau: Tumulus"
    let creditsSkoll = "Skoll: Raise Dead, Password icon"
    let creditsCaroAsercion = "Caro Asercion: Boar"
    
    let authors = [creditsDelapouite, creditsLorc, creditsBerandas, creditsDarkZaitzev, creditsCathelineau, creditsSkoll, creditsCaroAsercion]
    for (var i = 0; i < authors.length; i++) {
      creditText += '\n\n' + authors[i]
    }

    let credits = this.add['rexInputText'](
        Space.windowWidth/2, 150, Space.windowWidth, Space.windowHeight - 250, {
          type: 'textarea',
          text: creditText,
          fontFamily: StyleSettings.basic.fontFamily,
          fontSize: StyleSettings.basic.fontSize,
          color: ColorSettings.creditsText,
          backgroundColor: ColorSettings.creditsBackground,
          id: 'credits',
          readOnly: true
        })
      .setOrigin(0.5, 0)

     this.add.container(0, 0, credits)
  }

  private doWelcome(): void {
    this.scene.start("WelcomeScene")
  }
}
