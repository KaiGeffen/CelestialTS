import 'phaser'
import jwt_decode from 'jwt-decode'
import Loader from '../loader/loader'
import Server from '../network/server'
import {
  Color,
  Mobile,
  Space,
  Style,
  BBStyle,
  Url,
  UserProgress,
  UserSettings,
  Flags,
} from '../settings/settings'
import Button from '../lib/buttons/button'
import Buttons from '../lib/buttons/buttons'
import ensureMusic from '../loader/audioManager'

const google = null
const FB = null

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
    this.ensureAnimation()

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
      if (!Flags.local) {
        // Ensure that any other automatic sign-ins are cancelled
        google.accounts.id.cancel()
      }

      this.onOptionClick()
    }).setDepth(-1)

    if (!Flags.local) {
      // Google GIS
      this.createGoogleGSIButton(y - 100)

      // Facebook signin
      // this.createFacebookButton(y - 200)
    }
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

    // Ensure that music is playing
    ensureMusic(this)

    if (!this.load.isLoading()) {
      this.scene.start('HomeScene')
    }
  }

  private createGoogleGSIButton(y: number): void {
    // const client = google.accounts['oauth2'].initTokenClient({
    // 	client_id: Url.oauth,
    // 	scope: 'https://www.googleapis.com/auth/userinfo.email',
    // 	callback: (tokenResponse) => {
    // 		console.log('This is google authorization response:')
    // 		console.log(tokenResponse)

    // 		Server.login(tokenResponse.access_token, this)

    // 		this.onOptionClick()

    // 	},
    // })

    google.accounts.id.initialize({
      client_id: Url.oauth,
      // log_level: 'debug',
      auto_select: this.autoSelect,
      cancel_on_tap_outside: false,

      // login_uri: 'https://celestialtcg.com/gapi',

      callback: (token) => {
        const payload: any = jwt_decode(token.credential)

        // Send the jti to confirm a connection
        // After server responds, complete login
        Server.login(payload, this.game, () => this.onOptionClick())
      },
    })

    // NOTE Ensure that one-tap appears even if the user has closed it in the past
    document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`

    google.accounts.id.prompt()
  }

  private ensureAnimation(): void {
    const animations = document.getElementsByClassName('animation')
    if (animations.length !== 1) {
      throw new Error('There should be exactly 1 animation on the page.')
    }

    const animation: HTMLVideoElement = <HTMLVideoElement>animations.item(0)
    animation.style.display = ''
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
        // this.scene.start('HomeScene')
        this.scene.start('TutorialGameScene', {
          isTutorial: false,
          deck: undefined,
          mmCode: `ai:t${0}`,
          missionID: 0,
        })
      }
    })

    // NOTE This does not block and these assets won't be loaded in time for below code
    Loader.loadAll(this)

    super.create()
  }
}
