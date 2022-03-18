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
  iconSeparation: 180,
  // The maximum height that something can be and still fit within the standard 780 browser height
  maxHeight: 750,
  textAreaHeight: 60,

  // These values are experimental and related to the 3/15 gui pass
  cardWidth: 140,
  cardHeight: 200,
}
