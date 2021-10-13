// A record of the user's progress, what they have achieved, what informative messages they have seen
import { Color, UserSettings } from './settings'


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
	// Returns true if the achievement is new, false if it exists already
	static addAchievement(key: string): boolean {
		if (!UserSettings._get('userProgress').includes(key)) {

			// Add any associated messages that user should now see
			if (key in allMsgs) {
				UserSettings._push('newMessages', allMsgs[key])
			}

			// Add this achievement to list of user achievements
			UserSettings._push('userProgress', key)

			return true
		}

		return false
	}

	// Check if user progress contains given key
	static contains(key: string): boolean {
		return UserSettings._get('userProgress').includes(key)
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
[`You can find premade decks by clicking the choices
on the left side of the screen.

[color=${Color.cardReference}]Anubis[/color] is a great deck to start with.`, 'builder'],
	draftNotice:
[`Draft a deck of 15 cards from random choices
of 4 cards each.

Play as long as you like with the deck you make.`, 'draft'],
}
