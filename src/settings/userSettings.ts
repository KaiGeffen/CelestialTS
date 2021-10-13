import { baseCards } from "../catalog/catalog"


// User settings will first look to see if the user is logged in
// If they are, it will prioritize the account data for that user (in session storage) over local storage
// If changes are made to account data, those are sent back to the server
export class UserSettings {
  // Ensure that each expected setting exists, or give it a default value
  static _ensure(): void {
    const defaultSettings = {
      vsAi: true,
      mmCode: '',
      volume: 0.3,
      musicVolume: 0.0,
      animationSpeed: 0.25,
      // Whether the player should pass automatically if there's nothing they can play
      autopass: true,
      tutorialKnown: false,
      completedTutorials: [],
      newDiscord: true, // Discord has a new indicator until clicked
      newTutorial: true, // Tutorial has new indicator when new tutorials are unlocked
      messages: [], // A list of the Messages that user has which are read/unread
      draftDeckCode: '', // The user's current drafted deck
      draftRecord: [0, 0], // The win/loss record with current deck
      loggedIn: false, // Whether or not the user is logged in to an account
      decks: [
      {name: 'Anubis', value: "21:20:20:14:14:14:14:3:3:3:3:3:0:0:0"},
      {name: 'Robots', value: "22:22:15:10:11:11:8:8:8:4:4:2:2:2:2"},
      {name: 'Stalker', value: "23:20:19:19:19:19:13:11:12:1:1:1:1:1:1"},
      {name: 'Crypt', value: "20:19:19:19:15:12:12:36:36:36:35:1:1:1:0"},
      {name: 'Bastet', value: "11:11:11:11:34:34:34:33:33:33:3:3:28:28:0"},
      {name: 'Horus', value: "45:45:13:13:11:39:39:32:31:31:28:27:27:27:27"},
      ],
      inventory: Array(baseCards.length).fill(15).concat(Array(100).fill(0))
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
    // TODO Send these changes back to server
    if (key in sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value))
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

  static _loadUserData(data): void {
    // TODO Map from the data to where it should live in local storage
  }
}

