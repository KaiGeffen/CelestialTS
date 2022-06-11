import BasicButton from './basic'
import AvatarButton from './avatar'
import NewDeckButton from './newDeck'
import DecklistButton from './decklist'
import PremadeButton from './premade'
import TextButton from './text'
import { InspireButton, NourishButton } from './keywords'


// Export all of the available buttons
export default class Buttons {
	static Basic = BasicButton
	static Avatar = AvatarButton
	static NewDeck = NewDeckButton
	static Decklist = DecklistButton
	static Premade = PremadeButton
	static Text = TextButton
	static Keywords = {
		Inspire: InspireButton,
		Nourish: NourishButton,
	}
}
