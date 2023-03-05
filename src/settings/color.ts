// The base colors used throughout this app (Primary, secondary, variant)
const CoreColors: Record<string, number | string> = {
  white: 0xF5F2EB,
  whiteS: '#F5F2EB',

  black: 0x353F4E,
  blackS: '#353F4E',

  gold: 0xFABD5D,
  goldS: '#FABD5D',
  
  blue: 0x5F99DC,
  blueS: '#5F99DC',



  primary: 0x202070,
  primaryS: '#202070',
  
  secondary: 0x43438a,
  secondaryS: '#43438a',
  
  variant: 0xb3b320, // 0xa0a034
  variantS: '#b3b320',

  green: 0x007000,
  greenS: '#070',

  // black: 0x000000,
  

  grey: 0x555555,
  greyA: 0x555555e0,
  lightGrey: 0x888888,


  // Trial colors
  background: 0xCBC1A8,
  background2: 0xF5F2EB,

  c1: 0x664930,
  c1s: '#664930', // Basic text brown color
  c2: 0xAE9E8D,
  c2s: '#ae9e8d',

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


  header: CoreColors.c1,

  // TODO Trial
  basicText: CoreColors.c1s,
  altText: CoreColors.alts,
  border: CoreColors.c1,
  darken: CoreColors.darken,

  buttonSelected: CoreColors.buttonSelected,
  filterSelected: CoreColors.filterSelected,
  buttonTxtSelected: CoreColors.whiteS,
  
  textboxText: '#ffffff',

  // Slider ui element
  sliderTrack: CoreColors.background,
  sliderIndicator: CoreColors.gold,


  // Builder
  cardCount: CoreColors.goldS,

  // Colors for the cost and the background for it
  cardTextSecondary: '#5A5',
  cardTextBackground: CoreColors.black,
  // The color of either stat if it has been changed
  cardStatChanged: CoreColors.breathS,

  // Hint text fill and background (What shows when you hover something that has an explanation)
  hintFill: CoreColors.white,
  hintBackground: CoreColors.greyA,

  // Colors for any error messages that pop up
  error: CoreColors.whiteS,
  errorBackground: CoreColors.blackS,
  errorStroke: '#c00',

  // Outline plugin color
  outline: CoreColors.gold,

  // Lines used throughout ui
  line: CoreColors.black,

  // A translucent background that draws attention to one element on the screen
  focusBackground: CoreColors.grey,


  // Background of the webpage
  background: CoreColors.background,
  background2: CoreColors.background2,

  // Fill color of progress bar in loading screen
  progressBackground: CoreColors.background,
  progressFill: CoreColors.white,

  avatar: CoreColors.goldS,
  avatarDeselected: CoreColors.grey,

  // Color of the text for results (End screen) of rounds you won
  resultsWin: CoreColors.goldS,

  // Button components
  button: CoreColors.whiteS,
  buttonHighlight: 0xaaaaaa,
  buttonBorder: CoreColors.white,

  // Color for the various charts
  radar: CoreColors.goldS,
  bar: CoreColors.breathS + '99',
  barBorder: CoreColors.goldS,

  // Pass button
  passText: CoreColors.blackS,


  // Card components
  cardGreyed: CoreColors.lightGrey,

  // Adventure mode components
  mapIndicator: CoreColors.breath,

  // Background for the tutorial text
  tutorialBackground: '#aace',
}
