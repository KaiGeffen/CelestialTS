/**
 * Utility class for managing the cinematic animation element
 */
export default class Cinematic {
  /**
   * Ensures the animation element is visible
   * @throws Error if animation element is not found
   */
  public static ensure(): void {
    const animations = document.getElementsByClassName('animation')
    if (animations.length !== 1) {
      throw new Error('There should be exactly 1 animation on the page.')
    }

    const animation: HTMLVideoElement = <HTMLVideoElement>animations.item(0)
    animation.style.display = ''
  }

  /**
   * Hides the animation element
   * @throws Error if animation element is not found
   */
  public static hide(): void {
    const animations = document.getElementsByClassName('animation')
    if (animations.length !== 1) {
      throw new Error('There should be exactly 1 animation on the page.')
    }

    const animation: HTMLVideoElement = <HTMLVideoElement>animations.item(0)
    animation.style.display = 'none'
  }
}
