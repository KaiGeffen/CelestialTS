import "phaser"
import { Style, Color, Space } from "../settings/settings"
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

    this.add.text(Space.windowWidth/2, 80, "Credits", Style.title).setOrigin(0.5)

    let btnExit = new Button(this, Space.windowWidth/2, Space.windowHeight - 40, "Exit", this.doWelcome).setOrigin(0.5)
  }

  private createCreditsTextbox(): void {
    // Credit for all art
    let creditText: string = "All icons are from game-icons.net under CC BY 3.0"

    let creditsDelapouite = "Delapouite: https://delapouite.com/\nStars, Spy, Swift, Crypt, Fishing Boat, Factory, Mine, Chimney, Uprising, Sarcophagus, Anubis, Horus, Enrage, Camera, Butterfly, Bandit, Wanted Poster, Night Vision, Bastet, Stable, Pelican, Beehive, Eagle, Icarus, Ecology, Scarab, Kneel, Desert, Generator, Conquer, Cornucopia, Paramountcy, Sunflower, Gentle Rain, PVP icon, Draft icon, Exit icon, Retry icon"
    let creditsLorc = "Lorc: https://lorcblog.blogspot.com/\nBone Knife, Cog, Crossed Bones, Dove, Juggle, Drown, Gears, Dash, Cosmos, Fruiting, Gift, Paranoia, Hurricane, Dinosaur Bones, Lotus, Oak, Cardback, Broken Bone, Robot, Bee, Disintegrate, Imprison, Fish Bones, Bounty, Anvil, Nightmare, Sickness, Cogsplosion, Phoenix, Symbiosis, Sun, Carrion, Basics icon, Review icon"
    let creditsBerandas = "Lord Berandas: https://www.deviantart.com/berandas\nSine, AI"
    let creditsDarkZaitzev = "Dark Zaitzev: https://www.deviantart.com/darkzaitzev\nStalker"
    let creditsCathelineau = "Cathelineau: Tumulus, Occupation"
    let creditsSkoll = "Skoll: Unearth, Pocket Watch, Password icon"
    let creditsCaroAsercion = "Caro Asercion: Boar, Axolotl, Heron"

    // Become machine is CC0, which doesn't require attribution
    
    let authors = [creditsDelapouite, creditsLorc, creditsBerandas, creditsDarkZaitzev, creditsCathelineau, creditsSkoll, creditsCaroAsercion]
    for (var i = 0; i < authors.length; i++) {
      creditText += '\n\n' + authors[i]
    }

    let credits = this.add['rexInputText'](
        Space.windowWidth/2, 150, Space.windowWidth, Space.windowHeight - 250, {
          type: 'textarea',
          text: creditText,
          fontFamily: Style.basic.fontFamily,
          fontSize: Style.basic.fontSize,
          color: Color.creditsText,
          backgroundColor: Color.creditsBackground,
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
