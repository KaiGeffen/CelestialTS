import "phaser"


export class UserSettings {
  static values = [
  'vsAi',
  'explainKeywords',
  'mmCode',
  'volume']

  static _get(s: string) {
    // if (!this.values.includes(s)) {
    //   new Error()
    // }

    return JSON.parse(localStorage.getItem(s))
  }

  static _set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export function ensureUserSettings(): void {
  const defaultSettings = {
    vsAi: true,
    explainKeywords: true,
    mmCode: '',
    volume: 0.3,
    music: false,
    useExpansion: false,
    tutorialKnown: false
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
  stackX: 800
}

export const ColorSettings: Record<string, any> = {
  background: 0x202070,
  recapBackground: 0x707070,

  button: '#292',
  buttonHighlight: 0xaaaaaa,

  announcement: '#703420',
  stack: '#e9b',
  textHighlight: '#ff0',

  cardText: '#cc1f19',
  reminderText: '#333',
  cardTextBackground: '#aace',

  cardHighlight: 0xa0a034,
  cardUnplayable: 0x888888,

  middleLine: 0x702020,
  particle: 0x3030a0,
  mulliganHighlight: 0xffaaaa,

  filterSelected: 0xffaf00,
  menuBackground: 0x43438a,// 0x704820, //0x662b00
  sliderButton: 0x703420,
  slider: 0x3bc9c7,

  tutorialBackground: "#704820"
}

const FontSettings: Record<string, string> = {
  standard: '36px Arial Bold',
  small: '14px Arial Italic',
  large: '44px Arial Bold',
  huge: '54px Calibri Bold',
  stack: '85px Arial Bold',
  title: '128px Calibri Bold',
  credits: '19px Arial Bold'
}

export const StyleSettings: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
  basic: {
    font: FontSettings.standard,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  },
  button: {
    font: FontSettings.large,
    color: ColorSettings.button,
    stroke: '#000',
    strokeThickness: 3
  },
  small: {
    font: FontSettings.small,
    color: '#000',
    wordWrap: { width: Space.cardSize - Space.stackOverlap, useAdvancedWrap: false }
  },
  announcement: {
    font: FontSettings.huge,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 4
  },
  tutorial: {
    font: FontSettings.large,
    color: '#fff',
    backgroundColor: ColorSettings.cardTextBackground,
    wordWrap: { width: Space.windowWidth - 200 },
    fixedWidth: Space.windowWidth - 200,
    padding: { x: 10, y: 5 },
    stroke: '#000',
    strokeThickness: 3
  },
  cardText: {
    font: FontSettings.standard,
    color: ColorSettings.cardText,
    backgroundColor: ColorSettings.cardTextBackground,
    wordWrap: { width: 500, useAdvancedWrap: false },
    padding: { x: 10, y: 5 },
    stroke: '#000',
    strokeThickness: 0
  },
  stack: {
    font: FontSettings.stack,
    color: ColorSettings.stack,
    fixedWidth: Space.cardSize,
    fixedHeight: Space.cardSize,
    align: 'center'
  },
  filter: {
    font: FontSettings.standard,
  },
  title: {
    font: FontSettings.title,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 6
  },
  credits: {
    font: FontSettings.credits,
    color: "#fff",
    wordWrap: { width: 1000, useAdvancedWrap: false },
    stroke: '#000',
    strokeThickness: 1
  }
}

// Config for the BBCode text objects, used in cardInfo
export const BBConfig = {
  fontFamily: 'Cambria',
  fontSize: '36px',
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
