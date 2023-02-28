export const rulebookString = 
`[b]Sections[/b]
Overview
Start of match
Start phase
Action phase
End phase
Winning the match
Drawing cards
Precedence
FAQ

[b]Overview[/b]
Celestial is a game in which 2 players compete to win 5 rounds before their opponent by playing cards face-down from their hand to the 'Story' in front of them.

Once both players are done adding cards to the Story, all cards are revealed and their points are totaled. The player with the higher score wins that round.

Cards have a variety of effects, such as: Revealing, creating, transforming, drawing, discarding, and removing from the game other cards. Use all of this to your advantage, and predict what your opponent is planning, in order to win at Celestial.

Each player brings a deck of any 15 cards. If they would draw but their deck is empty, their discard pile is shuffled to form a new deck.

[b]Start of Match[/b]
Each player shuffles their 15 card deck.
Priority (The player who acts first) is determined at random at this time, and is known to both players.
Each player draws 3 cards and is prompted to mulligan, both players do this at the same time, and know when their opponent's mulligan is complete.

To mulligan, a player selects any number of the 3 cards from their starting hand. They then draw that many cards from their deck, and shuffle away the cards that they selected. Neither player knows which or how many cards their opponent chooses to mulligan.

Once both players have mulliganed, the first round begins.
Each round has the following structure: start phase, action phase, end phase.

[b]Start Phase[/b]
In the start phase, the following things occur in the following order:
* Any 'start of round' effects trigger (ex: Sun).
* If one player has won more rounds than the other, that player receives priority. Otherwise, priority is determined at random.
* Each player's maximum breath increases by 1 if it is less than 10.
* Each player's current breath is set to their maximum breath.
* Each player draws 2 cards.

[b]Action Phase[/b]
During the action phase, the player with priority can either pass, or play a card from their hand (Assuming they have sufficient breath to pay for it).
If they pass, their opponent is given priority.
If they play a card, they pay breath from their current breath equal to that card's cost.
The card then moves onto the story as the rightmost addition.
At this time, any 'when played' effects of the card activate (ex: Night Vision).
Their opponent is then given priority.
The action phase ends when both players pass in a row.
During this phase, each player cannot see the cards their opponent has played.

[b]End Phase[/b]
During the end phase, cards in the story resolve from left to right.
When a card resolves, it adds its points to its owner's score for the round, then its effect occurs, then it moves to its owner's discard pile.
Once all cards in the story have resolved, if on player has more points than their opponent, they are awarded a round win.

[b]Winning the Match[/b]
Once a player has won 5 rounds, they win the match.

[b]Drawing Cards[/b]
When a player 'draws a card' they do the following:
If they have 6 cards in hand, they skip their draw. Otherwise, they take the top card of their deck and add it to their hand as the rightmost card. If their deck is empty, their discard pile is shuffled to become their new deck.

[b]Precendence[/b]
Whenever a card would be selected from any zone (ex: Cling taking the highest cost card from your discard pile) the following system determines which card gets selected:
* First the deck is traversed from top to bottom, and any card meeting the conditions is picked.
* Then the discard pile is traversed from top to bottom, and any card meeting the conditions is picked.
* If no cards are picked this way, the effect does nothing.

[b]FAQ[/b]
Is my deck in the order that I see when hovering over it?
No, the true order of your deck is hidden from you. The order you see is sorted by cost.

Can cards that reset (ex: Hurricane) be worth points if they are Nourished?
No, the card contributes points first, then its effect resets your points to 0.`