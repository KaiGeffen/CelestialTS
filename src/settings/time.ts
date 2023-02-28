// Settings relating to various timing aspects, based on user's animation speed
import { UserSettings } from './settings'

export class Time {
  // Time for a card to be played from hand to story
  static playCard(): number {
    return 400
  }

  static recapStateMinimum(): number {
    return 1000 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static errorMsgTime(): number {
    return 2500
  }

  static recapTween(): number {
    return 500 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static recapTweenWithPause(): number {
    return 400 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  // How long a hint text takes to fade in
  static hintFade(): number {
    return 500 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static textSpeed(): number {
    return 15
  }

  static vignetteSpeed(): number {
    return 30
  }

  static builderSlide(): number {
    return 300
  }

  static optionsTabSlide(): number {
    return 300
  }

  // How long the avatar emote lasts
  static emote = 1000

  // Time user must pause before hint appears
  static hint = 100

  // Time for the charts to display a new dataset
  static chart = 600

  // Time for menu to open / close
  static menuTransition = 200

  // Stillframes in adventure mode scrolling
  static stillframeScroll = 2000

  // Stillframes in adventure mode fading out
  static stillframeFade = 500

}
