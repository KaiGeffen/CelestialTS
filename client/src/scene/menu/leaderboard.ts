import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { Color, Space, Style, BBStyle } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'
import Buttons from '../../lib/buttons/buttons'

const width = 600
const RESULTS_PER_PAGE = 10

export default class LeaderboardMenu extends Menu {
  private leaderboardData: Array<{rank: number, username: string, elo: number}>

  constructor(scene: MenuScene, params) {
    super(scene, width, params)
    
    this.createHeader('Leaderboard')
    this.initializeData()
    this.createContent()

    // Add panel to a scrollable panel
    let scrollable = this.createScrollablePanel(scene, this.sizer)
    scrollable.layout()
  }

  private initializeData() {
    this.leaderboardData = [
      { rank: 1, username: 'Faker', elo: 1500 },
      { rank: 2, username: 'EasyHoon', elo: 1480 },
      { rank: 3, username: 'Jordan', elo: 1475 },
      { rank: 4, username: 'Henrik', elo: 1475 },
      { rank: 5, username: 'Kai', elo: 1450 },
      { rank: 6, username: 'Bob', elo: 1445 },
      { rank: 7, username: 'PlayerSeven', elo: 1440 },
      { rank: 8, username: 'PlayerEight', elo: 1435 },
      { rank: 9, username: 'PlayerNine', elo: 1430 },
      { rank: 10, username: 'PlayerTen', elo: 1425 },
      { rank: 11, username: 'PlayerEleven', elo: 1420 },
      { rank: 12, username: 'PlayerTwelve', elo: 1415 },
      { rank: 13, username: 'PlayerThirteen', elo: 1410 },
      { rank: 14, username: 'PlayerFourteen', elo: 1405 },
      { rank: 15, username: 'PlayerFifteen', elo: 1400 },
      { rank: 16, username: 'PlayerSixteen', elo: 1395 },
      { rank: 17, username: 'PlayerSeventeen', elo: 1390 },
      { rank: 18, username: 'PlayerEighteen', elo: 1385 },
      { rank: 19, username: 'PlayerNineteen', elo: 1380 },
      { rank: 20, username: 'PlayerTwenty', elo: 1375 },
      { rank: 21, username: 'PlayerTwentyOne', elo: 1370 },
      { rank: 22, username: 'PlayerTwentyTwo', elo: 1365 },
      { rank: 23, username: 'PlayerTwentyThree', elo: 1360 },
      { rank: 24, username: 'PlayerTwentyFour', elo: 1355 },
      { rank: 25, username: 'PlayerTwentyFive', elo: 1350 },
      { rank: 26, username: 'PlayerTwentySix', elo: 1345 },
      { rank: 27, username: 'PlayerTwentySeven', elo: 1340 },
      { rank: 28, username: 'PlayerTwentyEight', elo: 1335 },
      { rank: 29, username: 'PlayerTwentyNine', elo: 1330 },
      { rank: 30, username: 'PlayerThirty', elo: 1325 },
    ];
  }

  private createContent() {
    // Create scrollable panel for all player rows
    let scrollablePanel = this.scene.rexUI.add.scrollablePanel({
      width: width,
      height: Space.windowHeight * 2 / 3,
      scrollMode: 0,
      panel: {
        child: this.createPlayerRows()
      },
      slider: false,
      mouseWheelScroller: {
        speed: 0.5
      }
    })

    this.sizer.add(scrollablePanel)
  }

  private createPlayerRows() {
    // Show all rows instead of paginating
    let entriesSizer = this.scene.rexUI.add.sizer({
      orientation: 'vertical',
      width: width,
      space: { item: Space.pad }
    })

    // Create individual rows for all entries
    this.leaderboardData.forEach(entry => {
      let rowSizer = this.createRow(entry, Style.basic)
      entriesSizer.add(rowSizer)
    })

    return entriesSizer
  }

  private createRow(entry: {rank: number, username: string, elo: number}, 
                   style: any, 
                   backgroundColor?: number) {
    let rowSizer = this.scene.rexUI.add.sizer({
      width: width,
      space: { 
        item: Space.pad,
        left: Space.pad * 2  // Add left padding
      }
    })

    if (backgroundColor) {
      rowSizer.addBackground(
        this.scene.add.rectangle(0, 0, 1, 1, backgroundColor)
      )
    }

    let rankText = this.scene.add.text(0, 0, 
      entry.rank.toString(), style)
    let usernameText = this.scene.add.text(0, 0, 
      entry.username, style)
    let eloText = this.scene.add.text(0, 0, 
      entry.elo.toString(), style)

    rowSizer
      .add(rankText, { proportion: 1 })
      .add(usernameText, { proportion: 4 })
      .add(eloText, { proportion: 1, align: 'right' })

    return rowSizer
  }

  private createScrollablePanel(scene: Phaser.Scene, panel) {
    let scrollable = scene['rexUI'].add.scrollablePanel({
      x: Space.windowWidth/2,
      y: Space.windowHeight/2,
      width: width,
      height: Space.windowHeight - Space.pad * 4,
      
      panel: {
        child: panel.setDepth(1)
      },

      mouseWheelScroller: {
        speed: 1
      }
    })

    scrollable.name = 'top'
    return scrollable
  }
} 