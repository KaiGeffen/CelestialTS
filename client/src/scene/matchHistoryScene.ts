import 'phaser'
import { Style, Color, Space, UserSettings, Flags } from '../settings/settings'
import BaseScene from './baseScene'
import UserDataServer from '../network/userDataServer'
import { MATCH_HISTORY_PORT, URL } from '../../../shared/network/settings'

interface MatchHistoryEntry {
  opponent_username: string
  opponent_elo: number
  rounds_won: number
  rounds_lost: number
  rounds_tied: number
  deck_name: string
  opponent_deck: string
  match_date: string
}

const headerHeight = Space.iconSize + Space.pad * 2
const width = 1000

export default class MatchHistoryScene extends BaseScene {
  private matchHistoryData: MatchHistoryEntry[] = []

  constructor() {
    super({
      key: 'MatchHistoryScene',
    })
  }

  create(): void {
    this.createHeader()
    this.fetchMatchHistoryData()
    super.create()
  }

  private createHeader(): void {
    // Make the background header
    let background = this.add
      .rectangle(0, 0, Space.windowWidth, headerHeight, Color.backgroundLight)
      .setOrigin(0)

    this.plugins.get('rexDropShadowPipeline')['add'](background, {
      distance: 3,
      angle: -90,
      shadowColor: 0x000000,
    })

    // Create back button
    let btnBack = this.add
      .text(Space.pad * 2, headerHeight / 2, '← Back', Style.basic)
      .setOrigin(0, 0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.sound.play('click')
        this.scene.start('HomeScene')
      })

    // Create title
    this.add
      .text(
        Space.windowWidth / 2,
        headerHeight / 2,
        'Match History',
        Style.homeTitle,
      )
      .setOrigin(0.5)
  }

  private async fetchMatchHistoryData() {
    try {
      const uuid = UserDataServer.getUUID()
      if (!uuid) {
        throw new Error('User not logged in')
      }

      const baseUrl = Flags.local
        ? `http://${URL}:${MATCH_HISTORY_PORT}`
        : 'https://celestialtcg.com'
      const response = await fetch(`${baseUrl}/match_history/${uuid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch match history data')
      }
      this.matchHistoryData = await response.json()
      this.createContent()
    } catch (error) {
      console.error('Error fetching match history data:', error)
      this.signalError('Failed to load match history data')
    }
  }

  private createContent() {
    // Create header with column names
    let headerSizer = this.rexUI.add.sizer({
      x: Space.windowWidth / 2,
      y: headerHeight + Space.pad,
      orientation: 'horizontal',
      width: width,
    })

    let timeText = this.add.text(0, 0, '\tTime', Style.basic)
    let opponentText = this.add.text(0, 0, 'Opponent', Style.basic)
    let resultsText = this.add.text(0, 0, 'Results', Style.basic)
    let deckText = this.add.text(0, 0, 'Deck Name', Style.basic)

    headerSizer
      .add(timeText, { proportion: 1 })
      .add(opponentText, { proportion: 2 })
      .add(resultsText, { proportion: 1 })
      .add(deckText, { proportion: 2 })
      .layout()

    const line = this.add.line(
      Space.windowWidth / 2,
      headerHeight + Space.pad * 2,
      0,
      0,
      width,
      0,
      Color.line,
    )

    // Create scrollable panel for match history
    let scrollablePanel = this.rexUI.add
      .scrollablePanel({
        x: Space.windowWidth / 2,
        y: (Space.windowHeight + headerHeight) / 2,
        width: width,
        height: Space.windowHeight - headerHeight - Space.pad * 3,
        scrollMode: 0,
        panel: {
          child: this.createMatchRows(),
        },
        slider: {
          track: this.rexUI.add.roundRectangle(
            0,
            0,
            20,
            10,
            10,
            Color.backgroundLight,
          ),
          thumb: this.rexUI.add.roundRectangle(
            0,
            0,
            20,
            0,
            10,
            Color.backgroundDark,
          ),
        },
        mouseWheelScroller: {
          speed: 0.5,
        },
      })
      .layout()
  }

  private createMatchRows() {
    let entriesSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      width: width,
    })

    this.matchHistoryData.forEach((entry) => {
      let rowSizer = this.createRow(entry)
      entriesSizer.add(rowSizer)
    })

    return entriesSizer
  }

  private createRow(entry: MatchHistoryEntry) {
    let rowSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      width: width,
      height: 40,
    })

    const date = new Date(entry.match_date)
    const timeStr = `${date.getMonth() + 1}/${date.getDate()}\n${date.getHours()}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}`

    // Format results as W-L-T
    const results = `${entry.rounds_won}-${entry.rounds_lost}-${entry.rounds_tied}`

    // Add opponent's ELO in parentheses
    const opponentText = `${entry.opponent_username}(${entry.opponent_elo})`

    let timeText = this.add.text(0, 0, `\t${timeStr}`, Style.basic)
    let oppText = this.add.text(0, 0, opponentText, Style.basic)
    let resultsText = this.add.text(0, 0, results, Style.basic)
    let deckText = this.add.text(0, 0, entry.deck_name, Style.basic)

    // Add background color based on win/loss
    const background = this.add.rectangle(
      0,
      0,
      width,
      35,
      entry.rounds_won > entry.rounds_lost ? 0x00ff00 : 0xff0000,
      0.2,
    )

    rowSizer
      .addBackground(background)
      .add(timeText, { proportion: 1 })
      .add(oppText, { proportion: 2 })
      .add(resultsText, { proportion: 1 })
      .add(deckText, { proportion: 2 })

    return rowSizer
  }
}
