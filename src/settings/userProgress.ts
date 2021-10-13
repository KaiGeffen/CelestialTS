// A record of the user's progress, what they have achieved, what informative messages they have seen







// What state a given progress is in: Not yet earned, not yet seen, seen
enum ProgressState {
	Unearned,
	Unseen,
	Seen
}

// Message manager should take a screen, look at user's progress mapping, and tell you what message to show






const allMsgs = {
	mobile: 
[`It looks like you're playing on a mobile device.

Celestial is not yet fully supported on mobile,
so if possible you may want to switch to desktop.`, Screen.Main],
	tutorialComplete: 
[`You completed the tutorial. All of the cards in the
base set are now available to you!

Click start to check them out.`, Screen.Main],
	coreChallengesComplete:
[`You completed all the core set challenges. More
advanced challenges are now available!

The expansion can be enabled from the deck menu.`, Screen.Main],
	deckMenuNotice:
[`You can find premade decks by clicking the
[color=${Color.buttonReference}]Deck[/color] button below.

[color=${Color.cardReference}]Anubis[/color] is a great deck to start with.`, Screen.Builder],
	draftNotice:
[`Draft a deck of 15 cards from random choices
of 4 cards each.

Play as long as you like with the deck you make.`, Screen.Draft],
}