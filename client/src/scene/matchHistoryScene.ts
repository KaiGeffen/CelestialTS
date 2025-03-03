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
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js'

const headerHeight = Space.iconSize + Space.pad * 2
const width = Space.windowWidth - Space.sliderWidth

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
        elo: 1820,
        opponentElo: 1850,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Fire Dragons', cosmetics: { avatar: 3 } },
        opponentDeck: {
          name: 'Dragon Fury',
          cosmetics: { avatar: 1 },
        },
      },
      {
        time: new Date('2024-03-15T13:15:00'),
        opponentUsername: 'SpellWeaver',
        elo: 1780,
        opponentElo: 1750,
        roundsWon: 0,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Control Mage', cosmetics: { avatar: 4 } },
        opponentDeck: {
          name: 'Arcane Masters',
          cosmetics: { avatar: 2 },
        },
      },
      {
        time: new Date('2024-03-14T19:45:00'),
        opponentUsername: 'NatureCaller',
        elo: 1900,
        opponentElo: 1920,
        roundsWon: 1,
        roundsLost: 1,
        roundsTied: 1,
        wasWin: false,
        deck: { name: 'Forest Spirits', cosmetics: { avatar: 0 } },
        opponentDeck: {
          name: "Nature's Wrath",
          cosmetics: { avatar: 5 },
        },
      },
      {
        time: new Date('2024-03-14T18:30:00'),
        opponentUsername: 'ShadowMage',
        elo: 1650,
        opponentElo: 1600,
        roundsWon: 2,
        roundsLost: 0,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Dark Arts', cosmetics: { avatar: 2 } },
        opponentDeck: {
          name: 'Shadow Legion',
          cosmetics: { avatar: 3 },
        },
      },
      {
        time: new Date('2024-03-14T16:15:00'),
        opponentUsername: 'LightBringer',
        elo: 1720,
        opponentElo: 1750,
        roundsWon: 1,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Holy Knights', cosmetics: { avatar: 5 } },
        opponentDeck: {
          name: 'Divine Order',
          cosmetics: { avatar: 4 },
        },
      },
      {
        time: new Date('2024-03-14T15:00:00'),
        opponentUsername: 'StormCaller',
        elo: 1840,
        opponentElo: 1800,
        roundsWon: 2,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Thunder Lords', cosmetics: { avatar: 1 } },
        opponentDeck: {
          name: 'Lightning Strike',
          cosmetics: { avatar: 0 },
        },
      },
      {
        time: new Date('2024-03-14T14:30:00'),
        opponentUsername: 'FrostMage',
        elo: 1755,
        opponentElo: 1780,
        roundsWon: 3,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Ice Kingdom', cosmetics: { avatar: 2 } },
        opponentDeck: { name: 'Frozen Throne', cosmetics: { avatar: 4 } },
      },
      {
        time: new Date('2024-03-14T13:15:00'),
        opponentUsername: 'PyroKing',
        elo: 1890,
        opponentElo: 1820,
        roundsWon: 5,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Inferno', cosmetics: { avatar: 3 } },
        opponentDeck: { name: 'Flame Legion', cosmetics: { avatar: 1 } },
      },
      {
        time: new Date('2024-03-14T12:00:00'),
        opponentUsername: 'EarthShaker',
        elo: 1680,
        opponentElo: 1710,
        roundsWon: 4,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Stone Guard', cosmetics: { avatar: 5 } },
        opponentDeck: { name: 'Mountain Kings', cosmetics: { avatar: 2 } },
      },
      {
        time: new Date('2024-03-14T11:30:00'),
        opponentUsername: 'WindWalker',
        elo: 1920,
        opponentElo: 1890,
        roundsWon: 5,
        roundsLost: 3,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Storm Riders', cosmetics: { avatar: 0 } },
        opponentDeck: { name: 'Aerial Force', cosmetics: { avatar: 3 } },
      },
      {
        time: new Date('2024-03-14T10:15:00'),
        opponentUsername: 'VoidMaster',
        elo: 1840,
        opponentElo: 1860,
        roundsWon: 2,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Dark Matter', cosmetics: { avatar: 4 } },
        opponentDeck: { name: 'Void Walkers', cosmetics: { avatar: 1 } },
      },
      {
        time: new Date('2024-03-14T09:00:00'),
        opponentUsername: 'TimeLord',
        elo: 1750,
        opponentElo: 1720,
        roundsWon: 5,
        roundsLost: 1,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Chronos', cosmetics: { avatar: 2 } },
        opponentDeck: { name: 'Time Weavers', cosmetics: { avatar: 5 } },
      },
      {
        time: new Date('2024-03-13T20:45:00'),
        opponentUsername: 'MindBender',
        elo: 1680,
        opponentElo: 1650,
        roundsWon: 5,
        roundsLost: 4,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Psychic Force', cosmetics: { avatar: 1 } },
        opponentDeck: { name: 'Mind Flayers', cosmetics: { avatar: 3 } },
      },
      {
        time: new Date('2024-03-13T19:30:00'),
        opponentUsername: 'BeastMaster',
        elo: 1790,
        opponentElo: 1820,
        roundsWon: 3,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Wild Pack', cosmetics: { avatar: 4 } },
        opponentDeck: { name: 'Feral Kings', cosmetics: { avatar: 2 } },
      },
      {
        time: new Date('2024-03-13T18:15:00'),
        opponentUsername: 'SoulKeeper',
        elo: 1850,
        opponentElo: 1830,
        roundsWon: 5,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Spirit Guard', cosmetics: { avatar: 3 } },
        opponentDeck: { name: 'Soul Collectors', cosmetics: { avatar: 0 } },
      },
      {
        time: new Date('2024-03-13T17:00:00'),
        opponentUsername: 'BloodHunter',
        elo: 1720,
        opponentElo: 1750,
        roundsWon: 1,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Crimson Order', cosmetics: { avatar: 5 } },
        opponentDeck: { name: 'Blood Legion', cosmetics: { avatar: 4 } },
      },
      {
        time: new Date('2024-03-13T16:45:00'),
        opponentUsername: 'StarGazer',
        elo: 1880,
        opponentElo: 1850,
        roundsWon: 5,
        roundsLost: 3,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Celestial Guard', cosmetics: { avatar: 2 } },
        opponentDeck: { name: 'Star Walkers', cosmetics: { avatar: 1 } },
      },
      {
        time: new Date('2024-03-13T15:30:00'),
        opponentUsername: 'DreamWeaver',
        elo: 1690,
        opponentElo: 1720,
        roundsWon: 2,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Dream Warriors', cosmetics: { avatar: 0 } },
        opponentDeck: { name: 'Nightmare Legion', cosmetics: { avatar: 3 } },
      },
      {
        time: new Date('2024-03-13T14:15:00'),
        opponentUsername: 'StormBringer',
        elo: 1920,
        opponentElo: 1890,
        roundsWon: 5,
        roundsLost: 4,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Thunder Guard', cosmetics: { avatar: 4 } },
        opponentDeck: { name: 'Lightning Lords', cosmetics: { avatar: 2 } },
      },
      {
        time: new Date('2024-03-13T13:00:00'),
        opponentUsername: 'FrostQueen',
        elo: 1780,
        opponentElo: 1810,
        roundsWon: 3,
        roundsLost: 5,
        roundsTied: 0,
        wasWin: false,
        deck: { name: 'Ice Maidens', cosmetics: { avatar: 1 } },
        opponentDeck: { name: 'Frozen Guard', cosmetics: { avatar: 5 } },
      },
      {
        time: new Date('2024-03-13T11:45:00'),
        opponentUsername: 'ShadowKing',
        elo: 1850,
        opponentElo: 1820,
        roundsWon: 5,
        roundsLost: 2,
        roundsTied: 0,
        wasWin: true,
        deck: { name: 'Dark Empire', cosmetics: { avatar: 3 } },
        opponentDeck: { name: 'Shadow Warriors', cosmetics: { avatar: 0 } },
      },
    ]

    if (Flags.local) {
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

      const response = await fetch(
        `https://celestialtcg.com/match_history/${uuid}`,
      )
      console.log('response was', response)
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

    // Create scrollable panel with header
    let scrollablePanel = this.rexUI.add
      .scrollablePanel({
        x: Space.windowWidth / 2,
        y: (Space.windowHeight + headerHeight) / 2,
        width: width,
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
      width: width,
    })

    this.matchHistoryData.forEach((entry) => {
      let rowSizer = this.createRow(entry)
      entriesSizer.add(rowSizer)
    })

    return entriesSizer
  }

  private createRow(entry: MatchHistoryEntry) {
    const rowHeight = 40
    const avatarSize = rowHeight - 5
    const textPadding = 10 // Padding between avatar and text

    let rowSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      width: width,
      height: rowHeight,
    })

    // Time text
    const time = entry.time
    const timeS = `${time.getMonth() + 1}/${time.getDate()}\n${time.getHours()}:${String(
      time.getMinutes(),
    ).padStart(2, '0')}`
    const timeText = this.add.text(0, 0, `\t${timeS}`, Style.basic)

    // Opponent Info
    const oppContainer = new ContainerLite(this, 0, 0).setOrigin(0)
    const oppAvatar = new Buttons.Avatar(
      oppContainer,
      0,
      rowHeight / 2,
      entry.opponentDeck.cosmetics.avatar,
    )
    const oppText = this.add
      .text(
        0,
        0,
        `${entry.opponentUsername}(${entry.opponentElo})`,
        Style.basic,
      )
      .setOrigin(0, 0.5)
    oppContainer.add(oppText)

    // Results text
    const resultS = `${entry.roundsWon}-${entry.roundsLost}-${entry.roundsTied}`
    let resultsText = this.add.text(0, 0, resultS, Style.basic)

    // User Info
    const userContainer = new ContainerLite(this, 0, 0).setOrigin(0)
    new Buttons.Avatar(
      userContainer,
      0,
      rowHeight / 2,
      entry.deck.cosmetics.avatar,
    )
    const userText = this.add
      .text(0, 0, `${entry.deck.name}(${entry.elo})`, Style.basic)
      .setOrigin(0, 0.5)
    userContainer.add(userText)

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
      .add(oppContainer, { proportion: 2, align: 'left' })
      .add(resultsText, { proportion: 1 })
      .add(userContainer, { proportion: 2, align: 'left' })

    return rowSizer
  }
}
