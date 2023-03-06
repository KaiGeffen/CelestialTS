import BasicButton from './basic'
import BackedButton from './backed'
import AvatarButton from './avatar'
import NewDeckButton from './newDeck'
import DecklistButton from './decklist'
import TextButton from './text'
import MissionButton from './mission'
import { DeckButton, DiscardButton } from './stacks'
import { InspireButton, NourishButton, SightButton } from './keywords'


// Export all of the available buttons
export default class Buttons {
	static Basic = BasicButton
	static Backed = BackedButton
	static Avatar = AvatarButton
	static NewDeck = NewDeckButton
	static Decklist = DecklistButton
	static Text = TextButton
	static Stacks = {
		Deck: DeckButton,
		Discard: DiscardButton,
	}
	static Keywords = {
		Inspire: InspireButton,
		Nourish: NourishButton,
		Sight: SightButton,
	}
	static Mission = MissionButton
}
