import { UserSettings } from '../settings'


// Maintain a list of Messages, which appear when visiting the main menu
// This list can be added to, and will skip adding a redundant message
// This is list is checked to see if any messages are yet to be seen
// If any are, it returns the first and marks it as seen

interface Message {
	name: string,
	text: string,
	seen: boolean
}

export default class MessageManager {
	// Get and return the first unread message, mark that message as read
	static readFirstUnreadMessage(): string {
		let messages: Message[] = UserSettings._get('messages')

		for(var i = 0; i < messages.length; i++) {
			if (!messages[i].seen) {
				
				// Mark the message as read
				messages[i].seen = true
				UserSettings._set('messages', messages)

				return messages[i].text
			}
		}

		return undefined
	}

	// Add a new unread message to the list
	static addUnreadMessage(name: string): void {
		// Message exists already
		let msgPreexists = UserSettings._get('messages').find(msg => msg.name === name) !== undefined
		
		if (!msgPreexists) {
			let msg: Message = {
				name: name,
				text: allMsgs[name],
				seen: false
			}

			UserSettings._push('messages', msg)
		}
	}
}

// All of the message names/text
const allMsgs = {
	tutorialComplete: 
`You completed the tutorial. All of the cards in the
base set are now available to you!

Click start to check them out.`,
	coreChallengesComplete:
`You completed all the core set challenges. More
advanced challenges are now available!

The expansion can be enabled from the deck menu.`
}