// A record of the user's progress, what they have achieved, what informative messages they have seen
import { Color, UserSettings } from './settings'


// Have a list of messages user has seen (Key is descriptive string)
// And a list of messages they are ready to see
// If user has seen a given message, it shouldn't be added to the list that they are waiting to see


var userHasCompleted = []


// Message manager should take a screen, look at user's progress mapping, and tell you what message to show
export class UserProgress {
	// Get a message to display when the given screen is visited
	static getMessage(screen: string): string {
		let newMessages = UserSettings._get('newMessages')

		for (var i = 0; i < newMessages.length; i++) {
			let msg = newMessages[i]

			if (msg[1] === screen) {
				// Remove the message from list of messages to display
				UserSettings._pop('newMessages', i)

				// Return its contents
				return msg[0]
			}
		}

		return undefined
	}

	// Add a given accomplishment to user's progress. Some might also add a message that user will see
	static addAchievement(key: string): void {
		if (!UserSettings._get('userProgress').includes(key)) {

			// Add any associated messages that user should now see
			if (key in allMsgs) {
				UserSettings._push('newMessages', allMsgs[key])
			}

			// Add this achievement to list of user achievements
			UserSettings._push('userProgress', key)
		}
	}
}





const allMsgs = {
	mobile: 
[`It looks like you're playing on a mobile device.

Celestial is not yet fully supported on mobile,
so if possible you may want to switch to desktop.`, 'welcome'],
	tutorialComplete: 
[`You completed the tutorial. All of the cards in the
base set are now available to you!

Click start to check them out.`, 'welcome'],
	coreChallengesComplete:
[`You completed all the core set challenges. More
advanced challenges are now available!

The expansion can be enabled from the deck menu.`, 'welcome'],
	deckMenuNotice:
[`You can find premade decks by clicking the
[color=${Color.buttonReference}]Deck[/color] button below.

[color=${Color.cardReference}]Anubis[/color] is a great deck to start with.`, 'builder'],
	draftNotice:
[`Draft a deck of 15 cards from random choices
of 4 cards each.

Play as long as you like with the deck you make.`, 'draft'],
}