import SearchingRegion from "./searching"

import OurHandRegion from "./ourHand"
import TheirHandRegion from "./theirHand"
import StoryRegion from "./story"
import OurScoreRegion from "./ourScore"
import DecksRegion from "./decks"
import DiscardPilesRegion from "./discardPiles"
import OurButtonsRegion from "./ourButtons"
import TheirScoreRegion from "./theirScore"
import { OurDeckOverlay, TheirDeckOverlay, OurDiscardOverlay, TheirDiscardOverlay } from "./pileOverlays"
import PassRegion from './pass'
import ScoresRegion from './scores'

import MulliganRegion from "./mulliganRegion"
import ResultsRegion from "./results"


export default class Regions {
	static Searching = SearchingRegion
	static OurHand = OurHandRegion
	static TheirHand = TheirHandRegion
	static Story = StoryRegion
	static OurScore = OurScoreRegion
	static TheirScore = TheirScoreRegion
	static OurButtons = OurButtonsRegion
	static Decks = DecksRegion
	static DiscardPiles = DiscardPilesRegion
	static OurDeck = OurDeckOverlay
	static TheirDeck = TheirDeckOverlay
	static OurDiscard = OurDiscardOverlay
	static TheirDiscard = TheirDiscardOverlay
	static Pass = PassRegion
	static Scores = ScoresRegion

	static Mulligan = MulliganRegion
	static Results = ResultsRegion
}
