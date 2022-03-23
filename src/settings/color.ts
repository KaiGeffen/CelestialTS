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
  white: 0xffffff,


  // Trial colors
  background: 0xF5F2EB,

  c1: 0x664930,
  c1s: '#664930',
  c2: 0xAE9E8D,
  c2s: '#ae9e8d',

  darken: 0x333333,


}


// The colors for each component of the app (Ex: Slider)
export const Color: Record<string, any> = {
  // TODO Trial
  smallText: CoreColors.c2s,
  basicText: CoreColors.c1s,
  border: CoreColors.c1,
  darken: CoreColors.darken,


  // Background of the webpage
  background: CoreColors.background, //CoreColors.primary,

  // Fill color of progress bar in loading screen
  progressBackground: CoreColors.secondary,
  progressFill: CoreColors.white,



  // Menu components
  menuBackground: CoreColors.secondary,
  menuBorder: CoreColors.primary,
  menuHeader: CoreColors.primary,

  // Button components
  button: CoreColors.variantS,
  buttonHighlight: 0xaaaaaa,
  buttonBorder: CoreColors.white,

  // Icon components
  iconHighlight: CoreColors.variant,

  // Slider components
  sliderIndicator: CoreColors.primary,
  sliderThumb: CoreColors.primary,

  // Radio button components
  radioOutline: CoreColors.primary,
  radioFill: CoreColors.variant,

  // Filter tint when active
  filterSelected: CoreColors.variant,

  // Text entered within text areas
  textArea: CoreColors.variantS,
  textAreaBackground: '#444',
  textAreaBackgroundAlt: CoreColors.secondaryS,



  // Card components
  cardText: CoreColors.primary,
  // Text color for the reminders in card text (References, keywords)
  cardTextSecondary: '#555',
  cardTextBackground: '#aace',
  cardUnplayable: 0x888888,
  cardHighlight: CoreColors.variant,
  // The color of the mana if cost has been reduced
  cardCostReduced: '#fff',



  // Color for text that references a button
  buttonReference: CoreColors.variantS,

  // Color for text that references a card
  cardReference: CoreColors.primaryS,

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
