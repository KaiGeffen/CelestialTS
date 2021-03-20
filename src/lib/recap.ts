import Story from './story'
import { Card } from '../catalog/catalog'


export default class Recap {
	sums: number[]
	wins: number[]
	safety: number[]
	playList: [Card, number, string][]

	constructor(sums: number[],
		wins: number[],
		safety: number[],
		playList: [Card, number, string][] = []) {
		
		this.sums = sums
		this.wins = wins
		this.safety = safety
		this.playList = playList
	}
}
