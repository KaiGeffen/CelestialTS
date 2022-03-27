// Settings relating to various timing aspects, based on user's animation speed
import { UserSettings } from './settings'

var foo = 1 //UserSettings._get('animationSpeed')
export class Time {
  static recapStateMinimum(): number {
    return 1000 / (foo * 2 + 0.75)
  }

  static errorMsgTime(): number {
    return 1400 / (foo * 2 + 0.75)
  }

  static recapTween(): number {
    return 500 / (foo * 2 + 0.75)
  }

  static recapTweenWithPause(): number {
    return 400 / (foo * 2 + 0.75)
  }

  static textSpeed(): number {
    return 15
  }

  static vignetteSpeed(): number {
    return 30
  }
}
