import Story from './story'
import ClientState from './clientState'
import Card from './card'

import Play from './play'


export default class Recap {
	sums: number[]
	wins: number[]
	safety: number[]
	// The card, owner, and text (deprecated) for each play before this point
	playList: Play[]
	stateList: ClientState[]

	constructor(sums: number[],
		wins: number[],
		safety: number[],
		playList: Play[],
		stateList: ClientState[]) {
		
		this.sums = sums
		this.wins = wins
		this.safety = safety
		this.playList = playList
		
		// The full state of the game player sees before/after each act in the story
		this.stateList = stateList
	}
}
