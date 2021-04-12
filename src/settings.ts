import "phaser"

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
  pageOffset: 1200
}

export const ColorSettings: Record<string, any> = {
  background: 0x202070,
  recapBackground: 0x707070,

  button: '#090',
  announcement: '#703420',
  stack: '#e9b',
  textHighlight: '#ff0',

  cardText: '#d00',
  cardTextBackground: '#88a',

  cardHighlight: 0xa0a034,
  cardUnplayable: 0x888888,

  middleLine: 0x702020,
  mulliganHighlight: 0xffaaaa,

  filterSelected: 0xffaf00,
  menuBackground: 0x704820 //0x662b00
}

const FontSettings: Record<string, string> = {
  standard: '36px Arial Bold',
  small: '14px Arial Italic',
  large: '44px Arial Bold',
  huge: '54px Calibri Bold',
  stack: '85px Arial Bold'
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
    wordWrap: { width: Space.cardSize - Space.stackOverlap, useAdvancedWrap: true }
  },
  announcement: {
    font: FontSettings.huge,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 4
  },
  cardText: {
    font: FontSettings.standard,
    color: ColorSettings.cardText,
    backgroundColor: ColorSettings.cardTextBackground,
    wordWrap: { width: 500, useAdvancedWrap: true },
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
  }
}
