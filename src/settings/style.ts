// Settings relating to styles of text or bbcode throughout the app
import "phaser"
import { Space, Color } from "./settings"

// All fonts used
const mainFont = 'Mulish'
const altFont = 'Cinzel'

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
    fontFamily: mainFont,
    fontSize: '16px',
    color: '#B6B9C5',
  },
  // When a card resolves in the story, show the points it earns
  cardResolution: {
    fontFamily: mainFont,
    fontSize: FontSettings.huge.size,
    color: Color.whiteS,
  },
  // Cost hint text
  builder: {
    fontFamily: mainFont,
    fontSize: '22px',
    color: Color.basicText,
    // fontStyle: "Bold",
  },
  // Count of a card in the deck
  cardCount: {
    fontFamily: mainFont,
    fontSize: '24px',
    color: Color.cardCount,
    stroke: '#0009',
    strokeThickness: 3,
  },
  // Cost numbers in filter
  textButton: {
    fontFamily: mainFont,
    fontSize: '20px',
    color: Color.altText,
  },
  // My Decks:
  header: {
    fontFamily: mainFont,
    fontSize: '24px',
    color: Color.header,
  },
  // Adventure mode flavor text
  flavor: {
    fontFamily: mainFont,
    fontSize: '28px',
    color: Color.flavor,
  },
  // Pass button
  pass: {
    fontFamily: altFont,
    fontSize: '40px',
    color: Color.passText,
  },
  // Moon button
  moon: {
    fontFamily: altFont,
    fontSize: '60px',
    color: Color.passText,
  },
  // Text for the deck title at the bottom of the avatar
  avatar: {
    fontFamily: mainFont,
    fontSize: '24px',
    color: Color.avatar,
    stroke: '#0009',
    strokeThickness: 3,
    backgroundColor: '#0009',
  },
  // Matching the size of text on the card images for hitareas
  reference: {
    fontFamily: mainFont,
    fontSize: '14px',
    color: '#FFC0CB00',
  },
  // Surname for characters in premade deck
  surname: {
    fontFamily: mainFont,
    fontSize: '34px',
    color: Color.basicText,
  },
  // The text saying if you won/lost/tied
  roundResult: {
    fontFamily: mainFont,
    fontSize: '60px',
    color: '#fff',
    stroke: Color.basicText,
    strokeThickness: 4
  },
  // Text that plays over the stillframes in journey
  stillframe: {
    fontFamily: mainFont,
    fontSize: FontSettings.huge.size,
    color: '#fff',
    stroke: Color.basicText,
    strokeThickness: 4,
    wordWrap: { width: Space.stillframeTextWidth },
  },

  basic: {
    fontFamily: mainFont,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    wordWrap: { width: Space.maxTextWidth }
  },
  button: {
    fontFamily: mainFont,
    fontSize: '20px',
    color: Color.button,
    stroke: '#000000',
    strokeThickness: 3,
  },
  small: {
    fontFamily: mainFont,
    fontSize: FontSettings.small.size,
    color: Color.smallText,
    wordWrap: { width: Space.cardSize - Space.stackOverlap, useAdvancedWrap: false }
  },
  announcement: {
    fontFamily: altFont,
    fontSize: FontSettings.huge.size,
    color: '#353F4E',//Color.basicText,
    // stroke: '#000',
    // strokeThickness: 1
  },
  announcementOverBlack: {
    fontFamily: altFont,
    fontSize: FontSettings.huge.size,
    color: Color.whiteS,
  },
  tutorial: {
    fontFamily: mainFont,
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
    fontFamily: mainFont,
    fontSize: FontSettings.stack.size,
    color: Color.stackText,
    fixedWidth: Space.cardSize,
    fixedHeight: Space.cardSize,
    align: 'center'
  },
  // filter: {
  //   fontFamily: mainFont,
  //   fontSize: FontSettings.standard.size
  // },
  // Title for menus
  menutitle: {
    fontFamily: mainFont,
    fontSize: FontSettings.title.size,
    color: '#fff',
    stroke: '#000',
    strokeThickness: 6
  },
  // Title for the home scene
  homeTitle: {
    fontFamily: altFont,
    fontSize: '70px',
    color: '#353F4E'
  },
  titleButtonText: {
    fontFamily: altFont,
    fontSize: '70px',
    color: '#F5F2EB'
  },
  credits: {
    fontFamily: mainFont,
    fontSize: FontSettings.credits.size,
    color: "#fff",
    wordWrap: { width: 1000, useAdvancedWrap: false },
    stroke: '#000',
    strokeThickness: 1
  },
  checkMark: {
    fontFamily: mainFont,
    fontSize: FontSettings.huge.size,
    color: Color.checkMark,
    stroke: '#000',
    strokeThickness: 4
  },
  new: {
    fontFamily: mainFont,
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
  //   fontFamily: mainFont,
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
    fontFamily: mainFont,
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
    fontFamily: mainFont,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    wordWrap: { width: Space.maxTextWidth },
    underline: {
      color: Color.basicText,
      thickness: 3,
      offset: 7,
    },
    halign: 'center',
    wrap: {
      mode: 'word',
      width: Space.maxTextWidth
    },
  },
  // Hint text shown when something onscreen is hovered
  hint: {
    fontFamily: mainFont,
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
    fontFamily: mainFont,
    fontSize: FontSettings.huge.size,
    color: Color.error,
    backgroundColor: Color.errorBackground,
    backgroundStrokeColor: Color.errorStroke,
    backgroundStrokeLineWidth: 4,
    backgroundCornerRadius: 5,
    backgroundHorizontalGradient: false,
    padding: { 
      left: Space.pad,
      right: Space.pad,
      top: Space.pad,
      bottom: Space.pad
    },
    // strokeThickness: 4,
    wrap: {
      mode: 'word',
      width: Space.windowWidth - Space.pad * 2
    }
  },
  // Text shown during the tutorial which animates
  tutorial: {
    fontFamily: mainFont,
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
    fontFamily: mainFont,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    backgroundColor: Color.background2,
    backgroundCornerRadius: 5,
    // backgroundStrokeColor: Color.outline,
    // backgroundStrokeLineWidth: 2,
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
  // Blocks of text in the options menu
  optionsBlock: {
    fontFamily: mainFont,
    fontSize: FontSettings.standard.size,
    color: Color.basicText,
    wrap: {
      mode: 'word',
      width: Space.maxTextWidth,
    },
  },
  // Deck names in builder
  deckName: {
    fontFamily: altFont,
    fontSize: FontSettings.huge.size,
    color: '#353F4E',
    halign: 'center',
    fixedHeight: 50,
  },
}
