// The base colors used throughout this app (Primary, secondary, variant)
const CoreColors: Record<string, any> = {
  primary: 0x202070,
  primaryS: '#202070',
  
  secondary: 0x43438a,
  secondaryS: "#43438a",
  
  variant: 0xb3b320, // 0xa0a034
  variantS: '#b3b320',

  red: 0xffaaaa,

  green: 0x007000,
  greenS: '#070',

  black: 0x000000,
  blackS: '#000',
  white: 0xffffff,
  whiteS: '#ffffff',

  grey: 0x555555,
  greyA: 0x555555e0,


  // Trial colors
  background: 0xF5F2EB,
  background2: 0xffffff,

  c1: 0x664930,
  c1s: '#664930', // Basic text brown color
  c2: 0xAE9E8D,
  c2s: '#ae9e8d',

  alts: '#817467',

  darken: 0x333333,

  buttonSelected: 0xBCB4B4,
  filterSelected: 0x3C67FF,

  // Golden icon, for trophy
  golden: 0xFABD5D,
  goldenS: '#FABD5D',

  // Breath icon, and things relating to breath
  breath: '#5F99DC',


}


// The colors for each component of the app (Ex: Slider)
export const Color: Record<string, any> = {
  // TODO Trial
  smallText: CoreColors.c2s,
  basicText: CoreColors.c1s,
  altText: CoreColors.alts,
  border: CoreColors.c1,
  darken: CoreColors.darken,

  buttonSelected: CoreColors.buttonSelected,
  filterSelected: CoreColors.filterSelected,
  buttonTxtSelected: CoreColors.whiteS,

  textboxText: CoreColors.c1,
  textboxBackground: CoreColors.c2s,
  header: CoreColors.c1,

  backgroundAlt: CoreColors.c2,

  sliderTrack: 0xE0E3EE,
  sliderIndicator: 0x5F5555,
  sliderThumb: 0x9F9999,

  cardCount: CoreColors.goldenS,

  // Colors for the cost and the background for it
  cardText: 0xFABD5D,
  cardTextBackground: CoreColors.black,
  // The color of the mana if cost has been reduced
  cardCostReduced: CoreColors.breath,

  // Hint text fill and background (What shows when you hover something that has an explanation)
  hintFill: CoreColors.white,
  hintBackground: CoreColors.greyA,

  // Colors for any error messages that pop up
  error: CoreColors.whiteS,
  errorBackground: CoreColors.blackS,
  errorStroke: '#c00',

  // Outline plugin color
  outline: CoreColors.golden,

  // Lines used throughout ui
  line: 0xeeeeee,

  // A translucent background that draws attention to one element on the screen
  focusBackground: CoreColors.grey,


  // Background of the webpage
  background: CoreColors.background, //CoreColors.primary,
  background2: CoreColors.background2,

  // Fill color of progress bar in loading screen
  progressBackground: CoreColors.secondary,
  progressFill: CoreColors.white,

  avatar: CoreColors.goldenS,

  // Color of the text for results (End screen) of rounds you won
  resultsWin: CoreColors.goldenS,

  // Background color for any search bars
  searchBackground: '#F2F2F2',


  // Menu components
  menuBackground: CoreColors.secondary,
  menuBorder: CoreColors.primary,
  menuHeader: CoreColors.primary,

  // Button components
  button: CoreColors.whiteS,//CoreColors.variantS,
  buttonHighlight: 0xaaaaaa,
  buttonBorder: CoreColors.white,

  // Icon components
  iconHighlight: CoreColors.variant,

  // Slider components
  // sliderIndicator: CoreColors.primary,
  // sliderThumb: CoreColors.primary,

  // Radio button components
  radioOutline: CoreColors.primary,
  radioFill: CoreColors.variant,

  // Text entered within text areas
  textArea: CoreColors.variantS,
  textAreaBackground: '#444',
  textAreaBackgroundAlt: CoreColors.secondaryS,

  // Color for the various charts
  radar: CoreColors.goldenS,
  bar: CoreColors.breath + '99',
  barBorder: CoreColors.goldenS,

  // Color for text that references anything
  reference: CoreColors.goldenS,

  // Pass button
  passText: '#fff',//'#a467e6',
  strokeText: '#000',


  // Card components
  // cardText: CoreColors.primary,
  // Text color for the reminders in card text (References, keywords)
  cardTextSecondary: '#555',
  // cardTextBackground: '#aace',
  cardUnplayable: 0x888888,
  cardHighlight: CoreColors.variant,



  // Color for text that references a button
  buttonReference: CoreColors.variantS,


  // Rulebook components
  rulebookText: CoreColors.black,
  rulebookBackground: "#aac",



  // The highlight behind a card that is selected for mulligan
  mulliganHighlight: CoreColors.red,

  // The shadow of a stack text that is highlighted
  stackText: CoreColors.greenS,
  stackHighlight: CoreColors.variantS,

  // Rectangle showing which player has priority
  priorityRectangle: 0xf0f0f0,



  // The highlight behind a card that is selected in the catalog
  catalogHighlight: CoreColors.red,

  // Credits components
  creditsText: CoreColors.black,
  creditsBackground: "#aac",

  // The color of the background while searching for an opponent
  searchingBackground: CoreColors.primary,

  // Background for the tutorial text
  tutorialBackground: '#aace',
  tutorialBorder: CoreColors.greenS,

  // Check mark for when a tutorial is complete
  checkMark: '#0f0',
}
