import "phaser"


export class UserSettings {
  static values = [
  'vsAi',
  'explainKeywords',
  'mmCode',
  'volume',]

  static _get(s: string) {
    // if (!this.values.includes(s)) {
    //   new Error()
    // }
    return JSON.parse(localStorage.getItem(s))
  }

  static _set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  static _push(key: string, value: any) {
    let ary = this._get(key)
    
    ary.push(value)

    this._set(key, ary)
  }
}

export function ensureUserSettings(): void {
  const defaultSettings = {
    vsAi: true,
    explainKeywords: true,
    mmCode: '',
    volume: 0.3,
    musicVolume: 0.0,
    animationSpeed: 0.25,
    useExpansion: false,
    tutorialKnown: false,
    completedTutorials: [],
    newDiscord: true, // Discord has a new indicator until clicked
    newTutorial: true, // Tutorial has new indicator when new tutorials are unlocked
    messages: [], // A list of the Messages that user has which are read/unread
    draftDeckCode: '', // The user's current drafted deck
    draftRecord: [0, 0], // The win/loss record with current deck
  }

  for (var key in defaultSettings) {

    // If this value isn't set in local storage, set it to its default
    if (localStorage.getItem(key) === null) {
      UserSettings._set(key, defaultSettings[key])
    }
  }
}

// Determine if height or width is the limiting factor for this window
// 1100 x 650 is the size of the background
let heightIsLimiting = window.innerHeight < (650 / 1100) * window.innerWidth 
let height, width
if (heightIsLimiting) {
  height = Math.floor(window.innerHeight) - 10
  width = Math.floor(height * (1100 / 650))
} else {
  width = Math.floor(window.innerWidth)
  height = Math.floor(width * (650 / 1100) - 10)
}
// TODO Calculate cards per row and cards per rows per page

export const Space = {
  windowWidth: width,
  windowHeight: height,
  cardSize: 100,
  pad: 20,
  rowsPerPage: 4,
  cardsPerPage: 8 * 4,
  stackOffset: 30,
  stackOverlap: 40,
  // How far from the left announcement text should start (Passed!, Mulliganing, etc) 
  announceOffset: width - 300 - 20,
  scoresOffset: width - 300 + 50,
  stackX: width - 300,
  highlightWidth: 5,
  iconSeparation: 180
}

// The base colors used throughout this app (Primary, secondary, variant)
const Color: Record<string, any> = {
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
}

// The colors for each component in the app (Ex: Slider)
export const ColorSettings: Record<string, any> = {
  // Background of the webpage
  background: Color.primary,

  // Fill color of progress bar in loading screen
  progressBackground: Color.secondary,
  progressFill: Color.white,



  // Menu components
  menuBackground: Color.secondary,
  menuBorder: Color.primary,

  // Button components
  button: Color.variantS,
  buttonHighlight: 0xaaaaaa,
  buttonBorder: Color.white,

  // Icon components
  iconHighlight: Color.variant,

  // Slider components
  sliderIndicator: Color.primary,
  sliderThumb: Color.primary,

  // Radio button components
  radioOutline: Color.primary,
  radioFill: Color.variant,

  // Filter tint when active
  filterSelected: Color.variant,

  // Text entered within text areas
  textArea: Color.variantS,



  // Card components
  cardText: Color.primary,
  // Text color for the reminders in card text (References, keywords)
  cardTextSecondary: '#555',
  cardTextBackground: '#aace',
  cardUnplayable: 0x888888,
  cardHighlight: Color.variant,



  // Color for text that references a button
  buttonReference: Color.variantS,

  // Color for text that references a card
  cardReference: Color.black,

  // Rulebook components
  rulebookText: Color.black,
  rulebookBackground: "#aac",



  // The highlight behind a card that is selected for mulligan
  mulliganHighlight: Color.red,

  // The shadow of a stack text that is highlighted
  stackText: Color.greenS,
  stackHighlight: Color.variantS,

  // Rectangle showing which player has priority
  priorityRectangle: 0xf0f0f0,



  // The highlight behind a card that is selected in the catalog
  catalogHighlight: Color.red,

  // Credits components
  creditsText: Color.black,
  creditsBackground: "#aac",

  // The color of the background while searching for an opponent
  searchingBackground: Color.primary,

  // Background for the tutorial text
  tutorialBackground: '#aace',
  tutorialBorder: Color.greenS,

  // Check mark for when a tutorial is complete
  checkMark: '#0f0',
}

// const FontSettings: Record<string, [string, string]
export const FontSettings: Record<string, Record<string, string>> = {
  standard: {size: '36px', font: 'Arial', full: '36px Arial Bold'},
  small: {size: '14px', font: 'Arial', full: '14px Arial Italic'},
  large: {size: '44px', font: 'Arial', full: '44px Arial Bold'},
  huge: {size: '54px', font: 'Calibri', full: '54px Calibri Bold'},
  stack: {size: '85px', font: 'Arial', full: '85px Arial Bold'},
  title: {size: '128px', font: 'Calibri', full: '128px Calibri Bold'},
  credits: {size: '19px', font: 'Arial', full: '19px Arial Bold'}
}

const fontFamily = 'Cambria'//'Playfair Display'//'EB Garamond'//'Georgia'//'Garamond'//'Cambria'

export const StyleSettings: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
  basic: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    // fontStyle: "Bold",
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  },
  button: {
    fontFamily: fontFamily,
    fontSize: FontSettings.large.size,
    color: ColorSettings.button,
    stroke: '#000',
    strokeThickness: 3
  },
  small: {
    fontFamily: fontFamily,
    fontSize: FontSettings.small.size,
    color: '#000',
    wordWrap: { width: Space.cardSize - Space.stackOverlap, useAdvancedWrap: false }
  },
  announcement: {
    fontFamily: fontFamily,
    fontSize: FontSettings.huge.size,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 4
  },
  tutorial: {
    fontFamily: fontFamily,
    fontSize: FontSettings.large.size,
    color: '#fff',
    backgroundColor: ColorSettings.tutorialBackground,
    wordWrap: { width: Space.windowWidth - 200 },
    fixedWidth: Space.windowWidth - 200,
    padding: { x: 10, y: 5 },
    stroke: '#000',
    strokeThickness: 3
  },
  cardText: {
    fontFamily: 'EB Garamond',
    fontSize: FontSettings.standard.size,
    color: ColorSettings.cardText,
    backgroundColor: ColorSettings.cardTextBackground,
    wordWrap: { width: 500, useAdvancedWrap: false },
    padding: { x: 10, y: 5 },
    stroke: '#000',
    strokeThickness: 0
  },
  stack: {
    fontFamily: fontFamily,
    fontSize: FontSettings.stack.size,
    color: ColorSettings.stackText,
    fixedWidth: Space.cardSize,
    fixedHeight: Space.cardSize,
    align: 'center'
  },
  filter: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size
  },
  title: {
    fontFamily: fontFamily,
    fontSize: FontSettings.title.size,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 6
  },
  credits: {
    fontFamily: fontFamily,
    fontSize: FontSettings.credits.size,
    color: "#fff",
    wordWrap: { width: 1000, useAdvancedWrap: false },
    stroke: '#000',
    strokeThickness: 1
  },
  catalog: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    // fontStyle: "Bold",
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2,
    wordWrap: { width: 1030, useAdvancedWrap: false },
  },
  checkMark: {
    fontFamily: fontFamily,
    fontSize: FontSettings.huge.size,
    color: ColorSettings.checkMark,
    stroke: '#000',
    strokeThickness: 4
  },
  new: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    // fontStyle: "Bold",
    color: '#ff0',
    stroke: '#000',
    strokeThickness: 2
  },
}

export class TimeSettings {
  static recapStateMinimum(): number {
    return 1000 / (UserSettings._get('animationSpeed') + 0.75)
  }

  static recapTween(): number {
    return 500 / (UserSettings._get('animationSpeed') + 0.75)
  }

  static recapTweenWithPause(): number {
    return 400 / (UserSettings._get('animationSpeed') + 0.75)
  }

  static textSpeed(): number {
    return 15
  }
}

// Config for the BBCode text objects, used in cardInfo
// TODO Group these all into one export
export const BBConfig = {
  fontFamily: fontFamily,
  fontSize: FontSettings.standard.size,
  color: ColorSettings.cardText,
  backgroundColor: ColorSettings.cardTextBackground,
  backgroundStrokeColor: "#0005",
  backgroundStrokeLineWidth: 2,
  backgroundCornerRadius: 5,
  backgroundHorizontalGradient: false,
  padding: { 
    left: 10,
    right: 10,
    top: 5,
    bottom: 5
  },
  underline: {
    color: ColorSettings.cardText,
    thickness: 2,
    offset: 8
  },
  strokeThickness: 3,
  wrap: {
    mode: 'word',
    width: 500
  }
}

export const TutorialBBConfig = {
  fontFamily: fontFamily,
  fontSize: FontSettings.large.size,
  color: '#fff',
  stroke: '#000',
  strokeThickness: 3,
  backgroundColor: ColorSettings.cardTextBackground,
  backgroundStrokeColor: ColorSettings.tutorialBorder,
  backgroundStrokeLineWidth: 3,
  backgroundCornerRadius: 5,
  backgroundHorizontalGradient: false,
  padding: { 
    left: 10,
    right: 10,
    top: 5,
    bottom: 5
  },
  wrap: {
    mode: 'word',
    width: 1000
  }
}

// Cost / Points shown above each card
export const CardStatsConfig = {
  fontFamily: fontFamily,
  fontSize: '20px',
  color: ColorSettings.cardText,
  backgroundColor: ColorSettings.cardTextBackground,
  backgroundStrokeColor: "#0005",
  backgroundStrokeLineWidth: 2,
  // backgroundCornerRadius: 5,
  backgroundHorizontalGradient: false,
  strokeThickness: 3,
  padding: { 
    left: 5,
    right: 5,
    top: 5,
    bottom: 5
  }
}

