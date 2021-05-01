import Story from './story'
import ClientState from './clientState'
import Card from './card'


export default class Recap {
	sums: number[]
	wins: number[]
	safety: number[]
	playList: [Card, number, string][]
	stateList: ClientState[]

	constructor(sums: number[],
		wins: number[],
		safety: number[],
		playList: [Card, number, string][],
		stateList: ClientState[]) {
		
		this.sums = sums
		this.wins = wins
		this.safety = safety
		this.playList = playList
		
		// The full state of the game player sees before/after each act in the story
		this.stateList = stateList
	}
}
