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

export const Space = {
  windowWidth: 1100,
  windowHeight: 650,
  cardSize: 100,
  pad: 20,
  cardsPerRow: 8,
  rowsPerPage: 4,
  cardsPerPage: 8 * 4,
  stackOffset: 30,
  stackOverlap: 40,
  // How far from the left announcement text should start (Passed!, Mulliganing, etc) 
  announceOffset: 800 - 20,
  scoresOffset: 800 + 50,
  pageOffset: 1200,
  stackX: 800,
  highlightWidth: 5,
  iconSeparation: 180
}

// The colors used throughout this app
const Color: Record<string, any> = {
  primary: 0x202070,
  secondary: 0x43438a,
  variant: 0xa0a034,

  black: '#000000',
}

export const ColorSettings: Record<string, any> = {
  // The background for all menus
  menuBackground: Color.secondary,

  // The border for menus
  menuBorder: Color.primary,

  // Tint for button when hovered
  buttonHighlight: 0xaaaaaa,

  // Text color for the reminders in card text (References, keywords)
  reminderText: '#333',

  // Tint when a card is unplayable
  cardUnplayable: 0x888888,

  // Border color when a card is highlighted
  cardHighlight: Color.variant,

  // Tint when an icon is hovered
  iconHighlight: Color.variant,

  // Color for text that references a button
  buttonReference: '#209020',

  // Color for text that references a card
  cardReference: '#cc1f19',

  // Colors for slider components
  sliderIndicator: Color.primary,
  sliderThumb: Color.primary,

  // Rulebook components
  rulebookText: Color.black,
  rulebookBackground: "#aac",

  // Button standard color
  button: '#209020',

  // Tint for when a filter is toggled on
  filterSelected: 0xffaf00,

  // Text within text areas
  textArea: '#209020',

  // The outline of a radio button
  radioOutline: Color.primary,

  // The inner fill of a radio button
  radioFill: Color.variant,

  // The highlight behind a card that is selected in the catalog
  catalogHighlight: 0xffaaaa,

  // The highlight behind a card that is selected for mulligan
  mulliganHighlight: 0xffaaaa,

  // Credits components
  creditsText: Color.black,
  creditsBackground: "#aac",

  // Rectangle showing which player has priority
  priorityRectangle: 0xf0f0f0,

  // The color of the background while searching for an opponent
  searchingBackground: Color.primary,

  // The shadow of a stack text that is highlighted
  stackHighlight: '#ff0',

  // Fill color of progress bar in loading screen
  progressFill: Color.primary,

  // Background of the webpage
  background: Color.primary,




  // TODO Remove below? Might be used in fonts
  white: '#ffffff',
  black: '#000000',

  recapBackground: 0x707070,


  announcement: '#703420',
  stack: '#e9b',
  textHighlight: '#ff0',

  cardText: '#cc1f19',
  cardTextBackground: '#aace',

  particle: 0x3030a0,

  sliderButton: 0x703420,
  slider: 0x3bc9c7,

  tutorialBackground: "#704820",

  
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
    backgroundColor: ColorSettings.cardTextBackground,
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
    color: ColorSettings.stack,
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
    color: '#0f0',
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

export const TimeSettings: Record<string, number> = {
  recapStateMinimum: 1000,
  recapTween: 500,
  recapTweenWithPause: 400,
  textSpeed: 15
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
  backgroundStrokeColor: '#070',
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
  padding: { 
    left: 5,
    right: 5,
    top: 5,
    bottom: 5
  }
}

