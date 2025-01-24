import UserDataServer from '../network/userDataServer'
import Catalog from '../../../shared/state/catalog'
import { Space } from './settings'
import { Flags } from './flags'

// User settings will first look to see if the user is logged in
// If they are, it will prioritize the account data for that user (in session storage) over local storage
// If changes are made to account data, those are sent back to the server
export class UserSettings {
  // Ensure that each expected setting exists, or give it a default value
  static _ensure(): void {
    const defaultSettings = {
      // Device specific settings (Not tied to user account)
      vsAi: true,
      mmCode: '',
      volume: 0.3,
      musicVolume: 0.0,
      dialogVolume: 0.3,
      animationSpeed: Flags.local ? 1 : 0.25, // Max speed if playing locally
      // Whether the player should pass automatically if there's nothing they can play
      autopass: true,

      // List of Messages that user should be shown
      // NOTE Doesn't get pushed to sql, is the result of the userProgress below
      newMessages: [],

      // Settings tied to user's account
      decks: [],
      // List to use when playing with in development content
      devDecks: [],

      // TODO Rethink this and the userprogress.ts module - they approach displaying new messages in a specific way that might not fit within the beta
      // List of all things user has accomplished (Beat Anubis, seen Discord, etc)
      userProgress: [],

      // For adventure mode, for each card, whether or not that card has been unlocked
      inventory: getStartingInventory(),

      // List of each mission by its id, and if the player has completed it
      completedMissions: [],

      // Coordinates for the camera in adventure mode
      adventureCoordinates: {
        x: 4650 - Space.windowWidth / 2,
        y: 700 - Space.windowHeight / 2,
      },
    }

    for (var key in defaultSettings) {
      // If this value isn't set in local storage, set it to its default
      if (localStorage.getItem(key) === null) {
        UserSettings._set(key, defaultSettings[key])
      }
    }
  }

  // Get the given setting
  static _get(key: string) {
    // If using cards in development, save the deck separately
    if (key === 'decks' && Flags.devCards) {
      key = 'devDecks'
    }

    console.log('Getting key', key)
    if (key in sessionStorage) {
      console.log('From session storage...')
      console.log(sessionStorage.getItem(key))
      console.log(JSON.parse(sessionStorage.getItem(key)))
      return JSON.parse(sessionStorage.getItem(key))
    } else {
      return JSON.parse(localStorage.getItem(key))
    }
  }

  static _set(key: string, value: any) {
    // If using cards in development, save the deck separately
    if (key === 'decks' && Flags.devCards) {
      key = 'devDecks'
    }

    if (key in sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value))

      // If key is in session storage then we're signed in
      // User progress and decks should be communicated to the server immediately
      if (key === 'userProgress') {
        UserDataServer.sendUserProgress(value)
      } else if (key === 'decks') {
        UserDataServer.sendDecks(value)
      } else if (key === 'inventory') {
        UserDataServer.sendInventory(value)
      } else if (key === 'completedMissions') {
        UserDataServer.sendCompletedMissions(value)
      }
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  // Set the nth index of the given array
  static _setIndex(key: string, index: number, value: any) {
    let ary = this._get(key)

    console.log('Setting index', index, 'of', key, 'to', value)

    ary[index] = value

    this._set(key, ary)
  }

  static _push(key: string, value: any) {
    let ary = this._get(key)

    ary.push(value)

    this._set(key, ary)
  }

  static _pop(key: string, index: number): any {
    let ary = this._get(key)

    let result = ary[index]

    ary.splice(index, 1)

    this._set(key, ary)

    return result
  }

  // Get the quantity of a given card in inventory
  static _getQuantity(cardId: number): number {
    let amt = this._get('inventory')[cardId]

    if (isNaN(amt) || amt == null) {
      return 0
    } else {
      return amt
    }
  }

  static clearSessionStorage(): void {
    sessionStorage.clear()
  }
}

function getStartingInventory(): boolean[] {
  let ary = Array(Catalog.collectibleCards.length).fill(false)

  // Unlock each of the starting cards
  ;[0, 4, 9, 6, 11, 12, 13, 18].forEach((i) => {
    ary[i] = true
  })

  return ary
}
