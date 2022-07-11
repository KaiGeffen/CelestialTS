// Settings relating to styles of text or bbcode throughout the app
import "phaser"
import { Space, Color } from "./settings"

// The main font used
const fontFamily = 'Mulish'

// Settings for the font sizes
const FontSettings: Record<string, Record<string, string>> = {
  standard: {size: '24px'}, // TODO trial
  small: {size: '12px'},
  large: {size: '44px'},
  huge: {size: '50px'},
  stack: {size: '85px'},
  title: {size: '128px'},
  credits: {size: '19px'},
}

export const Style: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
  filter: {
    fontFamily: fontFamily,
    fontSize: '16px',
    color: '#B6B9C5',
  },
  // Cost hint text
  builder: {
    fontFamily: fontFamily,
    fontSize: '18px',
    color: Color.basicText,
    fontStyle: "Bold",
  },
  // Count of a card in the deck
  cardCount: {
    fontFamily: fontFamily,
    fontSize: '24px',
    color: Color.cardCount,
    stroke: '#0009',
    strokeThickness: 3,
  },
  // Cost numbers in filter
  textButton: {
    fontFamily: fontFamily,
    fontSize: '20px',
    color: Color.altText,
  },
  // My Decks:
  header: {
    fontFamily: fontFamily,
    fontSize: '24px',
    color: Color.header,
  },
  // Adventure mode flavor text
  flavor: {
    fontFamily: fontFamily,
    fontSize: '28px',
    color: '#B6B9C5',
  },
  // Pass button, other large buttons
  huge: {
    fontFamily: fontFamily,
    fontSize: '48px',
    color: Color.button,
  },
  // Text for the deck title at the bottom of the avatar
  avatar: {
    fontFamily: fontFamily,
    fontSize: '24px',
    color: Color.avatar,
    stroke: '#0009',
    strokeThickness: 3,
    backgroundColor: '#0009',
  },
  // Matching the size of text on the card images for hitareas
  reference: {
    fontFamily: fontFamily,
    fontSize: '14px',
    color: '#FFC0CB00',
  },
  // Surname for characters in premade deck
  surname: {
    fontFamily: fontFamily,
    fontSize: '34px',
    color: Color.basicText,
  },

  basic: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    wordWrap: { width: Space.maxTextWidth }
  },
  button: {
    fontFamily: fontFamily,
    fontSize: '20px',
    color: Color.button,
    stroke: '#000000',
    strokeThickness: 2,
  },
  small: {
    fontFamily: fontFamily,
    fontSize: FontSettings.small.size,
    color: Color.smallText,
    wordWrap: { width: Space.cardSize - Space.stackOverlap, useAdvancedWrap: false }
  },
  announcement: {
    fontFamily: fontFamily,
    fontSize: FontSettings.huge.size,
    color: '#fff',
    stroke: Color.basicText,
    strokeThickness: 4
  },
  tutorial: {
    fontFamily: fontFamily,
    fontSize: FontSettings.large.size,
    color: '#fff',
    backgroundColor: Color.tutorialBackground,
    wordWrap: { width: Space.windowWidth - 200 },
    fixedWidth: Space.windowWidth - 200,
    padding: { x: 10, y: 5 },
    stroke: '#000',
    strokeThickness: 3
  },
  stack: {
    fontFamily: fontFamily,
    fontSize: FontSettings.stack.size,
    color: Color.stackText,
    fixedWidth: Space.cardSize,
    fixedHeight: Space.cardSize,
    align: 'center'
  },
  // filter: {
  //   fontFamily: fontFamily,
  //   fontSize: FontSettings.standard.size
  // },
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
  checkMark: {
    fontFamily: fontFamily,
    fontSize: FontSettings.huge.size,
    color: Color.checkMark,
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

// The styling for BBCode objects, from the rexui module
export const BBStyle: Record<string, any> = {
  // cardText: {
  //   fontFamily: fontFamily,
  //   fontSize: '20px',
  //   color: Color.cardText,
  //   backgroundColor: Color.cardTextBackground,
  //   backgroundStrokeColor: "#0005",
  //   backgroundStrokeLineWidth: 2,
  //   backgroundCornerRadius: 5,
  //   backgroundHorizontalGradient: false,
  //   padding: { 
  //     left: 10,
  //     right: 10,
  //     top: 5,
  //     bottom: 5
  //   },
  //   underline: {
  //     color: Color.cardText,
  //     thickness: 2,
  //     offset: 8
  //   },
  //   strokeThickness: 3,
  //   wrap: {
  //     mode: 'word',
  //     width: 500
  //   }
  // },
  // Cost / Points shown above each card
  cardStats: {
    fontFamily: fontFamily,
    fontSize: '36px',
    color: Color.cardText,
    backgroundColor: Color.cardTextBackground,
    // backgroundStrokeColor: "#0005",
    // backgroundStrokeLineWidth: 2,
    // backgroundCornerRadius: 5,
    backgroundHorizontalGradient: false,
    strokeThickness: 3,
    padding: { 
      // left: 5,
      // right: 5,
      top: -5,
      bottom: -5
    }
  },
  basic: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    wordWrap: { width: Space.maxTextWidth },
    underline: {
      color: Color.basicText,
      thickness: 3,
      offset: 7,
    },
    halign: 'center',
  },
  // Hint text shown when something onscreen is hovered
  hint: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    color: Color.hintFill,
    backgroundColor: Color.hintBackground,
    backgroundStrokeColor: "#0005",
    backgroundStrokeLineWidth: 2,
    backgroundCornerRadius: 5,
    wrap: {
      mode: 'word',
      width: Space.maxTextWidth
    },
    // strokeThickness: 3,
    padding: {
      left: Space.padSmall,
      right: Space.padSmall,
      top: Space.padSmall,
      bottom: Space.padSmall
    },
    // lineSpacing: Space.cardHeight - Space.pad,
  },  // Error text that appears in the center of the screen
  error: {
    fontFamily: fontFamily,
    fontSize: FontSettings.huge.size,
    color: '#fff',
    backgroundColor: Color.cardTextBackground,
    backgroundStrokeColor: "#fff",
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
      color: Color.cardText,
      thickness: 2,
      offset: 8
    },
    strokeThickness: 4,
    wrap: {
      mode: 'word',
      width: 500
    }
  },
  // Text shown during the tutorial which animates
  tutorial: {
    fontFamily: fontFamily,
    fontSize: FontSettings.large.size,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 3,
    backgroundColor: Color.cardTextBackground,
    backgroundStrokeColor: Color.tutorialBorder,
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
  },
  // Description for avatars
  description: {
    fontFamily: fontFamily,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    backgroundColor: Color.background2,
    backgroundCornerRadius: 5,
    backgroundStrokeColor: Color.outline,
    backgroundStrokeLineWidth: 2,
    padding: { 
      left: Space.padSmall,
      right: Space.padSmall,
      top: Space.padSmall,
      bottom: Space.padSmall
    },
    wrap: {
      mode: 'word',
      width: Space.maxTextWidth,
    },
    underline: {
      color: Color.basicText,
      thickness: 3,
      offset: 7,
    },
  },
}
