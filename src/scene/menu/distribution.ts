import 'phaser';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';
import Buttons from '../../lib/buttons/buttons';
import { Color, Space, Style } from '../../settings/settings';
import Menu from './menu';
import Cutout from '../../lib/buttons/cutout';

// TODO Clean up
const width = 500

export default class DistributionMenu extends Menu {
	constructor(scene: Phaser.Scene, params) {
		super(scene)

		const costs = this.getCosts(params.currentDeck)

		let panel = scene['rexUI'].add.fixWidthSizer(
		{
			x: Space.windowWidth/2,
			y: Space.windowHeight/2,
			space: {
				left: Space.pad,
				right: Space.pad,
				top: Space.pad,
				bottom: Space.pad,
			}
		}
		)

		// Add background
		let rect = scene['rexUI'].add.roundRectangle(0, 0, 0, 0, Space.corner, Color.background, 1).setInteractive()
		panel.addBackground(rect)

		panel.add(this.createChart(costs))

		panel.layout()
	}

	private getCosts(deck: Cutout[]): number[] {
		let result = Array(10).fill(0)

		deck.forEach(cutout => {
			const card = cutout.card
			result[card.cost] += cutout.count
		})

		return result
	}

	private createChart(costs: number[]): any {
		return this.scene['rexUI'].add.chart(
			Space.windowWidth/2,
			Space.windowHeight/2,
			width - Space.padSmall*2,
			width - Space.padSmall*2,
			{
			type: 'bar',
			data: {
				labels: [0,1,2,3,4,5,6,7,8,9],
				datasets: [
				{
					label: 'Costs',
					backgroundColor: Color.bar,
					data: costs,
				},
				]
			},
			options: {
				plugins: {
					legend: { display: false },
				},
                // scales: {
                // 	x: {
                // 		beginAtZero: true,
                // 	},
                // 	y: {
                // 		beginAtZero: true,
                // 	},
                // }
            }
		})
	}
}
