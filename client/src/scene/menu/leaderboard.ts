import 'phaser'
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { Color, Space, Style, BBStyle } from '../../settings/settings'
import Menu from './menu'
import MenuScene from '../menuScene'
import Buttons from '../../lib/buttons/buttons'

const width = 1000
const RESULTS_PER_PAGE = 10
const USERNAME = 'Kai'

export default class LeaderboardMenu extends Menu {
  private leaderboardData: Array<{
    rank: number
    username: string
    elo: number
    wins: number
    losses: number
  }>

  constructor(scene: MenuScene, params) {
    super(scene, width, params)

    // Sizer has no pad between lines
    this.sizer.space.line = 0
    this.sizer.space.bottom = 0

    this.createHeader('Leaderboard')
    this.initializeData()
    this.createContent()

    // Add panel to a scrollable panel
    let scrollable = this.createScrollablePanel(scene, this.sizer)
    scrollable.layout()
  }

  private initializeData() {
    this.leaderboardData = [
      { rank: 1, username: 'Faker', elo: 1500, wins: 42, losses: 12 },
      { rank: 2, username: 'EasyHoon', elo: 1480, wins: 38, losses: 15 },
      { rank: 3, username: 'Jordan', elo: 1475, wins: 35, losses: 18 },
      { rank: 4, username: 'Henrik', elo: 1475, wins: 33, losses: 20 },
      { rank: 5, username: 'Kai', elo: 1450, wins: 28, losses: 25 },
      { rank: 6, username: 'Bob', elo: 1445, wins: 25, losses: 28 },
      { rank: 7, username: 'PlayerSeven', elo: 1440, wins: 22, losses: 31 },
      { rank: 8, username: 'PlayerEight', elo: 1435, wins: 20, losses: 33 },
      { rank: 9, username: 'PlayerNine', elo: 1430, wins: 18, losses: 35 },
      { rank: 10, username: 'PlayerTen', elo: 1425, wins: 15, losses: 38 },
      { rank: 11, username: 'PlayerEleven', elo: 1420, wins: 12, losses: 41 },
      { rank: 12, username: 'PlayerTwelve', elo: 1415, wins: 10, losses: 43 },
      { rank: 13, username: 'PlayerThirteen', elo: 1410, wins: 8, losses: 45 },
      { rank: 14, username: 'PlayerFourteen', elo: 1405, wins: 5, losses: 48 },
      { rank: 15, username: 'PlayerFifteen', elo: 1400, wins: 3, losses: 50 },
      { rank: 16, username: 'PlayerSixteen', elo: 1395, wins: 2, losses: 51 },
      { rank: 17, username: 'PlayerSeventeen', elo: 1390, wins: 1, losses: 52 },
      { rank: 18, username: 'PlayerEighteen', elo: 1385, wins: 0, losses: 53 },
      { rank: 19, username: 'PlayerNineteen', elo: 1380, wins: 0, losses: 54 },
      { rank: 20, username: 'PlayerTwenty', elo: 1375, wins: 0, losses: 55 },
      { rank: 21, username: 'PlayerTwentyOne', elo: 1370, wins: 0, losses: 56 },
      { rank: 22, username: 'PlayerTwentyTwo', elo: 1365, wins: 0, losses: 57 },
      {
        rank: 23,
        username: 'PlayerTwentyThree',
        elo: 1360,
        wins: 0,
        losses: 58,
      },
      {
        rank: 24,
        username: 'PlayerTwentyFour',
        elo: 1355,
        wins: 0,
        losses: 59,
      },
      {
        rank: 25,
        username: 'PlayerTwentyFive',
        elo: 1350,
        wins: 0,
        losses: 60,
      },
      { rank: 26, username: 'PlayerTwentySix', elo: 1345, wins: 0, losses: 61 },
      {
        rank: 27,
        username: 'PlayerTwentySeven',
        elo: 1340,
        wins: 0,
        losses: 62,
      },
      {
        rank: 28,
        username: 'PlayerTwentyEight',
        elo: 1335,
        wins: 0,
        losses: 63,
      },
      {
        rank: 29,
        username: 'PlayerTwentyNine',
        elo: 1330,
        wins: 0,
        losses: 64,
      },
      { rank: 30, username: 'PlayerThirty', elo: 1325, wins: 0, losses: 65 },
    ]
  }

  private createContent() {
    // Create a header that lists each column name
    let headerSizer = this.scene.rexUI.add.sizer({
      orientation: 'horizontal',
      width: width,
    })

    let rankText = this.scene.add.text(0, 0, '\tRank', Style.basic)
    let usernameText = this.scene.add.text(0, 0, 'Username', Style.basic)
    let winsText = this.scene.add.text(0, 0, 'Wins', Style.basic)
    let lossesText = this.scene.add.text(0, 0, 'Losses', Style.basic)
    let eloText = this.scene.add.text(0, 0, 'Elo', Style.basic)

    headerSizer
      .add(rankText, { proportion: 1 })
      .add(usernameText, { proportion: 3 })
      .add(winsText, { proportion: 1 })
      .add(lossesText, { proportion: 1 })
      .add(eloText, { proportion: 1 })

    const line = this.scene.add.line(0, 0, 0, 0, width, 0, Color.line)

    // Create scrollable panel for all player rows
    let scrollablePanel = this.scene.rexUI.add.scrollablePanel({
      width: width,
      height: (Space.windowHeight * 2) / 3,
      scrollMode: 0,
      panel: {
        child: this.createPlayerRows(),
      },
      slider: false,
      mouseWheelScroller: {
        speed: 0.5,
      },
    })

    this.sizer.add(headerSizer).add(line).add(scrollablePanel)
  }

  private createPlayerRows() {
    // Show all rows instead of paginating
    let entriesSizer = this.scene.rexUI.add.sizer({
      orientation: 'vertical',
      width: width,
    })

    // Create individual rows for all entries
    this.leaderboardData.forEach((entry) => {
      let rowSizer = this.createRow(entry)
      entriesSizer.add(rowSizer)
    })

    return entriesSizer
  }

  private createRow(entry: {
    rank: number
    username: string
    elo: number
    wins: number
    losses: number
  }) {
    let rowSizer = this.scene.rexUI.add.sizer({
      width: width,
    })

    // If this row has current user's username, highlight it
    if (entry.username === USERNAME) {
      rowSizer.addBackground(
        this.scene.add.rectangle(0, 0, 10, 10, Color.backgroundLight),
      )
    }

    // Add each text object
    let rankText = this.scene.add.text(
      0,
      0,
      `\t${entry.rank.toString()}`,
      Style.basic,
    )
    let usernameText = this.scene.add.text(0, 0, entry.username, Style.basic)
    let winsText = this.scene.add.text(0, 0, entry.wins.toString(), Style.basic)
    let lossesText = this.scene.add.text(
      0,
      0,
      entry.losses.toString(),
      Style.basic,
    )
    let eloText = this.scene.add.text(0, 0, entry.elo.toString(), Style.basic)

    // Add each text with the right proportion
    rowSizer
      .add(rankText, { proportion: 1 })
      .add(usernameText, { proportion: 3 })
      .add(winsText, { proportion: 1 })
      .add(lossesText, { proportion: 1 })
      .add(eloText, { proportion: 1 })

    return rowSizer
  }

  private createScrollablePanel(scene: Phaser.Scene, panel) {
    let scrollable = scene['rexUI'].add.scrollablePanel({
      x: Space.windowWidth / 2,
      y: Space.windowHeight / 2,
      width: width,
      height: Space.windowHeight - Space.pad * 4,

      panel: {
        child: panel.setDepth(1),
      },

      mouseWheelScroller: {
        speed: 1,
      },
    })

    scrollable.name = 'top'
    return scrollable
  }
}
