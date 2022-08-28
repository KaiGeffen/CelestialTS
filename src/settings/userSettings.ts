import Server from "../server"
import { baseCards } from "../catalog/catalog"


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
      animationSpeed: location.port === '4949' ? 1 : 0.25, // Max speed if playing locally
      // Whether the player should pass automatically if there's nothing they can play
      autopass: true,

      // List of Messages that user should be shown
      // NOTE Doesn't get pushed to sql, is the result of the userProgress below
      newMessages: [],


      // Settings tied to user's account
      decks: [],

      // TODO Rethink this and the userprogress.ts module - they approach displaying new messages in a specific way that might not fit within the beta
      // List of all things user has accomplished (Beat Anubis, seen Discord, etc)
      userProgress: [],

      // For adventure mode, for each card, whether or not that card has been unlocked
      inventory: getStartingInventory(),

      // List of each mission by its id, and if the player has completed it
      completedMissions: [],
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
    if (key in sessionStorage) {
      return JSON.parse(sessionStorage.getItem(key))
    }
    else {
      return JSON.parse(localStorage.getItem(key))      
    }
  }

  static _set(key: string, value: any) {
    if (key in sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value))

      // If key is in session storage then we're signed in
      // User progress and decks should be communicated to the server immediately
      if (key === 'userProgress') {
        Server.sendUserProgress(value)
      }
      else if (key === 'decks') {
        Server.sendDecks(value)
      }
    }
    else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  // Set the nth index of the given array
  static _setIndex(key: string, index: number, value: any) {
    let ary = this._get(key)
    
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
    }
    else {
      return amt
    }
  }
}

function getStartingInventory(): boolean[] {
  let ary = Array(baseCards.length).fill(false);

  // Unlock each of the starting cards
  [0,4,9,6,11,12,13,18].forEach(i => {
    ary[i] = true
  })

  return ary
}
