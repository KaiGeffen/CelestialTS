// Settings relating to various timing aspects, based on user's animation speed
import { UserSettings } from './settings'

export class Time {
  static recapStateMinimum(): number {
    return 1000 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static errorMsgTime(): number {
    return 1400 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static recapTween(): number {
    return 500 / (UserSettings._get('animationSpeed') * 2 + 0.5)
  }

  static recapTweenWithPause(): number {
    return 400 / (UserSettings._get('animationSpeed') * 2 + 0.5)
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
}
