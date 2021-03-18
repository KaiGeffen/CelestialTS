import "phaser"

export class WelcomeScene extends Phaser.Scene {
  
  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  init() {
  }
  
  create(): void {
    var titleText: string = "Celestial"
    this.add.text(1100/2, 200, titleText,
      { font: '128px Arial Bold'}).setOrigin(0.5)

    var hintText: string = "Click to start"
    this.add.text(1100/2, 350, hintText,
      { font: '24px Arial Bold'}).setOrigin(0.5)

    var creditText: string = "All icons are from game-icons.net under CC BY 3.0"
    let creditsDelapouite = "Delapouite: https://delapouite.com/"//" {Sparkles, Spy, Swift, Crypt, Fishing Boat, Factory, Mine, Force, Uprising, Sarcophagus, Anubis, Horus, Enrage}"
    let creditsLorc = "Lorc: https://lorcblog.blogspot.com/"//" {Bone Knife, Cog, Crossed Bones, Dove, Juggle, Drown, Gears, Dash, Cosmos, Fruiting, Gift, Paranoia, Hurricane, Dinosaur Bones, Oak}"
    let creditsBerandas = "Lord Berandas: https://www.deviantart.com/berandas"// {Sine, AI}"
    let creditsDarkZaitzev = "Dark Zaitzev: https://www.deviantart.com/darkzaitzev"// {Stalker}"
    let creditsCathelineau = "Cathelineau"//: {Tumulus}"
    
    let authors = [creditsDelapouite, creditsLorc, creditsBerandas, creditsDarkZaitzev, creditsCathelineau]
    for (var i = 0; i < authors.length; i++) {
      creditText += '\n' + authors[i]
    }

    this.add.text(1100/2, 550, creditText,
      { wordWrap: { width: 1000, useAdvancedWrap: true }}).setOrigin(0.5)

    this.input.on('pointerdown', function (/*pointer*/) {
      this.scene.start("BuilderScene")
    }, this)

  }
}
