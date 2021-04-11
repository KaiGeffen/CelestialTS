export const ColorSettings = {
  background: '#202070',
  recapBackground: '#707070',
  textHighlight: '#ff0',

  button: '#090',
  announcement: '#703420',
  stack: '#e9b',

  cardText: '#d00',
  cardTextBackground: '#88a',

  cardHighlight: 0xa0a034,
  cardUnplayable: 0x888888
}

const FontSettings = {
  standard: '36px Arial Bold',
  small: '14px Arial',
  large: '44px Arial Bold',
  huge: '54px Arial Bold',
}

export const StyleSettings = {
  basic: {
    font: FontSettings.standard,
    color: '#000'
  },
  button: {
    font: FontSettings.large,
    color: ColorSettings.button
  },
  small: {
    font: FontSettings.small,
    color: '#000',
    wordWrap: { width: 70, useAdvancedWrap: true }
  },
  announcement: {
    font: FontSettings.huge,
    color: ColorSettings.announcement//'#f71'
  },
  cardText: {
    font: FontSettings.standard,
    color: ColorSettings.cardText,
    backgroundColor: ColorSettings.cardTextBackground,
    wordWrap: { width: 500, useAdvancedWrap: true }
  },
  stack: {
    font: '85px Arial',
    color: ColorSettings.stack,
    fixedWidth: 100,
    fixedHeight: 100,
    align: 'center'
  },
  filter: {
    font: FontSettings.standard,
  }
}

export const space = {
  cardSize: 100,
  pad: 20,
  cardsPerRow: 8,
  rowsPerPage: 4,
  cardsPerPage: 8 * 4,
  stackOffset: 30,
  stackOverlap: 40,
  // How far from the left announcement text should start (Passed!, Mulliganing, etc) 
  announceOffset: 800 - 20,
  pageOffset: 1200
}
