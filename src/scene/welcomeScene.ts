import "phaser"
import { StyleSettings, Space } from "../settings"


export class WelcomeScene extends Phaser.Scene {
  
  constructor() {
    super({
      key: "WelcomeScene"
    })
  }

  create(): void {
    this.add.text(Space.windowWidth/2, 200, "Celestial",
      StyleSettings.title).setOrigin(0.5)

    let txtStart = this.add.text(Space.windowWidth/2, 350, "Click to start",
      StyleSettings.announcement).setOrigin(0.5)

    let backgroundClickable = this.add.rectangle(0, 0, Space.windowWidth, Space.windowHeight,
      0x000, 0).setOrigin(0, 0)
    backgroundClickable.setInteractive()
    backgroundClickable.on('pointerdown', this.doStart, this)

    let btnCredits = this.add.text(Space.windowWidth/2, Space.windowHeight - 50, "Credits",
      StyleSettings.button).setOrigin(0.5)
    btnCredits.setInteractive()
    btnCredits.on('pointerdown', this.doCredits, this)
  }

  private doStart(): void {
    this.scene.start("BuilderScene")
  }

  private doCredits(): void {
    this.scene.start("CreditsScene")
  }
}
