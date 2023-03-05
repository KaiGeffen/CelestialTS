// The base colors used throughout this app
const CoreColors: Record<string, number | string> = {
  white: 0xF5F2EB,
  whiteS: '#F5F2EB',

  black: 0x353F4E,
  blackS: '#353F4E',

  gold: 0xFABD5D,
  goldS: '#FABD5D',
  
  blue: 0x5F99DC,
  blueS: '#5F99DC',

  brown: 0x664930,
  brownS: '#664930',

  grey: 0x555555,
  greyA: 0x555555e0,
  lightGrey: 0x888888,


  // TODO Change to background light/dark
  backgroundDark: 0xCBC1A8,
  backgroundLight: 0xF5F2EB,


  alts: '#817467',

  darken: 0x333333,

  buttonSelected: 0xBCB4B4,
  filterSelected: 0x3C67FF,
}


// The colors for each component of the app (Ex: Slider)
export const Color: Record<string, any> = {
  
  // TODO Reorganize, don't expose these
  black: CoreColors.black,
  white: CoreColors.white,
  whiteS: CoreColors.whiteS,
  // TODO Rename
  goldenS: CoreColors.goldS,


  header: CoreColors.brown,

  // TODO Trial
  basicText: CoreColors.brownS,
  altText: CoreColors.alts,
  border: CoreColors.brown,
  darken: CoreColors.darken,

  buttonSelected: CoreColors.buttonSelected,
  filterSelected: CoreColors.filterSelected,
  buttonTxtSelected: CoreColors.whiteS,
  
  textboxText: '#ffffff',

  // Slider ui element
  sliderTrack: CoreColors.backgroundDark,
  sliderIndicator: CoreColors.gold,


  // Builder
  cardCount: CoreColors.goldS,

  // TODO Refactor dynamic card displays, remove the background color
  // Colors for the cost and the background for it
  cardTextSecondary: '#5A5',
  cardTextBackground: CoreColors.black,
  // The color of either stat if it has been changed
  cardStatChanged: CoreColors.blueS,

  // Hint text fill and background (What shows when you hover something that has an explanation)
  hintFill: CoreColors.white,
  hintBackground: CoreColors.greyA,

  // Colors for any error messages that pop up
  error: CoreColors.whiteS,
  errorBackground: CoreColors.blackS,
  errorStroke: CoreColors.gold,



  // Outline plugin color
  outline: CoreColors.gold,

  // Lines used throughout ui
  line: CoreColors.black,


  // Background of the webpage
  backgroundDark: CoreColors.backgroundDark,
  backgroundLight: CoreColors.backgroundLight,








  // Fill color of progress bar in loading screen
  progressBackground: CoreColors.backgroundDark,
  progressFill: CoreColors.white,

  avatarDeselected: CoreColors.grey,

  // Button components
  button: CoreColors.whiteS,
  buttonHighlight: 0xaaaaaa,
  buttonBorder: CoreColors.white,

  // Color for the various charts
  radar: CoreColors.goldS,
  bar: CoreColors.blueS + '99',
  barBorder: CoreColors.goldS,

  // Pass button
  passText: CoreColors.blackS,


  // Card components
  cardGreyed: CoreColors.lightGrey,

  // Adventure mode components
  mapIndicator: CoreColors.blue,




  // TUTORIAL
  // Background for the tutorial text
  tutorialBackground: '#aace',

  // A translucent background that draws attention to one element on the screen
  focusBackground: CoreColors.grey,

}
