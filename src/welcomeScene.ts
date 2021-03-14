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

    var creditText: string = "All icons from game-icons.net under CC BY 3.0"
    this.add.text(1100/2, 600, creditText,
      { font: '24px Arial Bold'}).setOrigin(0.5)

    this.input.on('pointerdown', function (/*pointer*/) {
      this.scene.start("BuilderScene")
    }, this)

  }
}
