import Server from "../server"
import { baseCards } from "../catalog/catalog"


// User settings will first look to see if the user is logged in
// If they are, it will prioritize the account data for that user (in session storage) over local storage
// If changes are made to account data, those are sent back to the server
export class UserSettings {
  // Ensure that each expected setting exists, or give it a default value
  static _ensure(): void {
    const defaultSettings = {

      // Settings
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



      // List of all things user has accomplished (Beat Anubis, seen Discord, etc)
      userProgress: [],

      igc: 0,

      // For adventure mode, for each card, whether or not that card has been unlocked
      inventory: Array(baseCards.length).fill(false),

      // List of each mission by its id, and if the player has completed it
      completedMissions: Array(100).fill(true), // Tutorial complete
      // inventory: Array(baseCards.length).fill(15).concat(Array(100).fill(0)),

      decks: [
        {name: 'Anubis', value: "21:20:20:17:17:14:14:6:3:3:3:3:0:0:0"},
        {name: 'Robots', value: "22:22:15:10:11:11:8:8:8:4:4:2:2:2:2"},
        {name: 'Stalker', value: "23:20:19:19:19:19:13:11:12:1:1:1:1:1:1"},
        {name: 'Lord', value: "62:44:20:20:57:11:11:11:69:69:69:63:63:0:0"},
        {name: 'Bastet', value: "71:71:11:11:11:11:34:34:34:33:33:28:28:28:0"},
        {name: 'Horus', value: "45:45:13:13:11:39:39:32:31:31:28:27:27:27:27"},
      ],

      draftDeckCode: '', // The user's current drafted deck
      draftRecord: [0, 0], // The win/loss record with current deck
      // loggedIn: false, // Whether or not the user is logged in to an account
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
