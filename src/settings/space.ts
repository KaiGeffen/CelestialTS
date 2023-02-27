// Determine if height or width is the limiting factor for this window
// 1100 x 650 is the size of the background
let heightIsLimiting = window.innerHeight < (650 / 1100) * window.innerWidth 
let height, width
// if (heightIsLimiting) {
//   height = Math.floor(window.innerHeight) - 10
//   width = Math.floor(height * (1100 / 650))
// } else {
//   width = Math.floor(window.innerWidth)
//   height = Math.floor(width * (650 / 1100) - 10)
// }
width = Math.floor(window.innerWidth)
height = Math.floor(window.innerHeight)
console.log(`Screen dimensions: ${width} x ${height}`)

// TODO Most of this needs to change since the gui update

export var Space = {
  windowWidth: width,
  windowHeight: height,
  cardSize: 100,
  padSmall: 10,
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
  iconSeparation: 180,
  // The maximum height that something can be and still fit within the standard 780 browser height
  maxHeight: 750,
  textAreaHeight: 60,

  // These values are experimental and related to the 3/15 gui pass
  cardWidth: 336 * 7/10,
  cardHeight: 336,
  storyXOverlap: 30,
  storyYOverlap: 120, // If this is more than half of cardHeight, mistake
  // Height of the hand regions
  handHeight: 160,
  // Standard corner width for rounded rectangles
  corner: 10,
  // For basic text
  maxTextWidth: 500, // Note must be more than twice cardWidth for hints

  // Height of the filter bar in the deck editor
  filterBarHeight: 80,

  decklistPanelWidth: 240,
  deckPanelWidth: 320 + 50,

  // Textbox text in the tutorial that plays while stillframes show
  stillframeTextWidth: width - 120,

  // Dimensions for common buttons
  buttonWidth: 150,
  buttonHeight: 58,

  cutoutHeight: 49,

  avatarSize: 130,
  iconSize: 32,

  sliderWidth: 40,
}
