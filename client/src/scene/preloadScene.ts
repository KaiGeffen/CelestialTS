import 'phaser'
import jwt_decode from 'jwt-decode'
import type { CredentialResponse } from 'google-one-tap'
import type { GoogleJwtPayload } from '../types/google'
import Loader from '../loader/loader'
import UserDataServer from '../network/userDataServer'
import {
  Color,
  Mobile,
  Space,
  Style,
  BBStyle,
  Url,
  UserSettings,
  Flags,
} from '../settings/settings'
import Button from '../lib/buttons/button'
import Buttons from '../lib/buttons/buttons'
import ensureMusic from '../loader/audioManager'
import Cinematic from '../lib/cinematic'

// Scene for user to select a sign in option, without loading assets
export class SigninScene extends Phaser.Scene {
  // True when user is signed or chose to be a guest
  signedInOrGuest: boolean = false
  guestButton: Button
  // Whether the gsi element should automatically login
  autoSelect: boolean

  constructor(args) {
    super({
      key: args === undefined ? 'SigninScene' : args.key,
    })
  }

  init(params = { autoSelect: true }) {
    this.autoSelect = params.autoSelect
  }

  create(): void {
    document.getElementById('signin').hidden = false

    // Ensure user is signed out
    UserSettings.clearSessionStorage()

    // Ensure animation is displayed
    Cinematic.ensure()

    // Add buttons to sign in or play as a guest
    this.createButtons()

    // On mobile, encourage user to lock in landscape mode
    if (Flags.mobile) {
      this.createLandscapeMessaging()
    }
  }

  // Create buttons for each of the signin options (Guest, OAuth)
  private createButtons(): void {
    const x = Space.windowWidth / 2
    const y = Space.windowHeight - Space.buttonHeight / 2 - Space.pad

    this.guestButton = new Buttons.Basic(this, x, y, 'Guest', () => {
      this.onOptionClick()
    }).setDepth(-1)

    // TODO Use y value
    this.createGoogleGSIButton()
  }

  // Create elements which encourage the user to be in landscape mode
  private createLandscapeMessaging(): void {
    function isLandscape() {
      switch (screen.orientation.type) {
        case 'landscape-primary':
        case 'landscape-secondary':
          return true
        default:
          return false
      }
    }

    let txt = this['rexUI'].add
      .BBCodeText(
        Space.windowWidth / 2,
        Space.windowHeight / 2,
        'Use landscape mode',
        BBStyle.error,
      )
      .setOrigin(0.5)
      .setInteractive()
      .setVisible(!isLandscape())

    screen.orientation.onchange = () => {
      // Brief delay to ensure that dimensions have changed
      setTimeout(() => {
        // Center guest button
        const x = window.innerWidth / 2
        const y = window.innerHeight / 2
        this.guestButton.setPosition(x, y)
        txt.setPosition(x, y)
      }, 5)

      // Set blocking text visibility based on new orientation
      txt.setVisible(!isLandscape())
    }
  }

  private onOptionClick(): void {
    this.signedInOrGuest = true

    // Make the buttons unclickable
    this.guestButton.disable()
    document.getElementById('signin').hidden = true

    // Ensure that music is playing
    ensureMusic(this)

    if (!this.load.isLoading()) {
      this.scene.start('HomeScene')
    }
  }

  private createGoogleGSIButton(): void {
    google.accounts.id.initialize({
      client_id: Url.oauth,
      log_level: 'debug',
      ux_mode: 'popup',

      callback: (token: CredentialResponse) => {
        const payload = jwt_decode<GoogleJwtPayload>(token.credential)

        // Send the jti to confirm a connection
        // After server responds, complete login
        UserDataServer.login(payload, this.game, () => this.onOptionClick())
      },
    })

    // Render the button
    google.accounts.id.renderButton(document.getElementById('signin'), {
      theme: 'filled_black',
      size: 'large',
      shape: 'rectangular',
      text: 'signin',
      width: Space.buttonWidth,
    })
  }
}

export class PreloadScene extends SigninScene {
  constructor() {
    super({
      key: 'PreloadScene',
    })
  }

  // Load all assets used throughout the game
  preload(): void {
    // Ensure that every user setting is either set, or set it to its default value
    UserSettings._ensure()

    // Ensure that audio plays even when tab loses focus
    this.sound.pauseOnBlur = false

    this.sound.volume = UserSettings._get('volume') * 5

    // Load the assets used in this scene
    Loader.preload(this)
  }

  create() {
    if (Flags.online) {
      // Gain access to chart plugin
      this.load.script(
        'chartjs',
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.8.0/chart.min.js',
      )
    }

    // When loading is complete, if user selected an option, start home screen
    this.load.on('complete', () => {
      if (this.signedInOrGuest) {
        this.scene.start('HomeScene')
      }
    })

    // NOTE This does not block and these assets won't be loaded in time for below code
    Loader.loadAll(this)

    super.create()
  }
}
