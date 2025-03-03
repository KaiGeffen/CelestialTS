import 'phaser'
import {
  Style,
  Color,
  Space,
  UserSettings,
  Flags,
  Scroll,
} from '../settings/settings'
import BaseScene from './baseScene'
import UserDataServer from '../network/userDataServer'
import { MATCH_HISTORY_PORT, URL } from '../../../shared/network/settings'
import Buttons from '../lib/buttons/buttons'
import newScrollablePanel from '../lib/scrollablePanel'
import { MatchHistoryEntry } from '../../../shared/types/matchHistory'

const headerHeight = Space.iconSize + Space.pad * 2

export default class MatchHistoryScene extends BaseScene {
  private matchHistoryData: MatchHistoryEntry[] = []

  constructor() {
    super({
      key: 'MatchHistoryScene',
    })
  }

  create(): void {
    super.create()

    this.createHeader()
    this.fetchMatchHistoryData()
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
    new Buttons.Basic(
      this,
      Space.pad + Space.buttonWidth / 2,
      headerHeight / 2,
      'Back',
      () => {
        this.sound.play('click')
        this.scene.start('HomeScene')
      },
    )

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
    // Mock data for testing
    const mockData = [
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
      {
        time: new Date('2024-03-15T14:30:00'),
        opponentUsername: 'DragonMaster',
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons' },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage' },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits' },
      },
    ]

    // Use mock data if USE_MOCK flag is true
    if (Flags.local && true) {
      this.matchHistoryData = mockData as MatchHistoryEntry[]
      this.createContent()
      return
    }

    try {
      const uuid = UserDataServer.getUUID()
      if (!uuid) {
        this.signalError('Please log in to view match history')
        return
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
    // Create header content
    let headerSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      width: Space.windowWidth,
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

    // Create scrollable panel with header
    let scrollablePanel = this.rexUI.add
      .scrollablePanel({
        x: Space.windowWidth / 2,
        y: (Space.windowHeight + headerHeight) / 2,
        width: Space.windowWidth,
        height: Space.windowHeight - headerHeight - Space.pad * 3,

        header: headerSizer,

        panel: {
          child: this.createMatchRows(),
        },

        slider: {
          track: this.add.rectangle(0, 0, 20, 10, Color.backgroundLight),
          thumb: this.add.rectangle(0, 0, 20, 50, Color.backgroundLight),
        },

        mouseWheelScroller: {
          speed: 0.5,
        },

        space: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          header: Space.pad,
          panel: 0,
        },

        expand: {
          header: true,
        },
      })
      .layout()

    // Update the mousewheel handler bounds check
    this.input.on(
      'wheel',
      function (pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
        scrollablePanel.childOY -= dy
        scrollablePanel.t = Math.max(0, scrollablePanel.t)
        scrollablePanel.t = Math.min(0.999999, scrollablePanel.t)
      },
    )
  }

  private createMatchRows() {
    let entriesSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      width: Space.windowWidth,
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
      width: Space.windowWidth,
      height: 40,
    })

    const time = entry.time
    const timeS = `${time.getMonth() + 1}/${time.getDate()}\n${time.getHours()}:${String(
      time.getMinutes(),
    ).padStart(2, '0')}`

    // Format results as W-L-T
    const resultS = `${entry.roundsWon}-${entry.roundsLost}-${entry.roundsTied}`

    // Add opponent's ELO in parentheses
    const opponentS = `${entry.opponentUsername}(${entry.opponentElo})`

    // Add text objects
    let timeText = this.add.text(0, 0, `\t${timeS}`, Style.basic)
    let oppText = this.add.text(0, 0, opponentS, Style.basic)
    let resultsText = this.add.text(0, 0, resultS, Style.basic)
    let deckText = this.add.text(0, 0, entry.deck.name, Style.basic)

    // Add background color based on win/loss
    const background = this.add.rectangle(
      0,
      0,
      Space.windowWidth,
      35,
      entry.wasWin ? 0x00ff00 : 0xff0000,
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
