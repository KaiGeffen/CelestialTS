import 'phaser'

import Card from '../../../shared/state/card'
import { Flags, UserSettings } from '../settings/settings'
import BaseScene from '../scene/baseScene'
import { TypedWebSocket } from '../../../shared/network/typedWebSocket'
import {
  URL,
  MATCH_PORT,
  USER_DATA_PORT,
} from '../../../shared/network/settings'
import type { GoogleJwtPayload } from '../types/google'
import { UserDataClientWS } from '../../../shared/network/userDataWS'

const ip = '127.0.0.1'
const port = 5555
// Custom code for closing websocket connection due to invalid token
const code = 1000

// The websocket which is open with the main server (Authentication/pack opening)
var wsServer: UserDataClientWS = undefined

export default class UserDataServer {
  // Log in with the server for user with given OAuth token
  static login(
    payload: GoogleJwtPayload,
    game: Phaser.Game,
    callback = () => {},
  ) {
    /*
    Destructure the payload
    Immediately send the payload information to server
    Register a listener for the response of the user-data
    Listen for a prompt for user to send initial values (Local storage information)
    Listen for invalid_token and show an error message
    Listen for close ? and resend the login information

    This websocket stays open, and when the user updates anything that info
    gets sent to the server. The wsServer above does get set by this, and user
    in the static methods below. 
    */

    const email = payload.email
    const uuid = payload.sub
    const jti = payload.jti

    wsServer = UserDataServer.getSocket()

    // Immediately send the payload information to server
    wsServer.onOpen(() => {
      wsServer.send({
        type: 'sendToken',
        email: email,
        uuid: uuid,
        jti: jti,
      })
    })

    // Register a listener for the response of the user-data
    const that = this
    wsServer
      .on('promptUserInit', () => {
        console.log('User was prompted to send initial values')

        // TODO Include username

        that.sendDecks(UserSettings._get('decks'))
        that.sendInventory(UserSettings._get('inventory'))
        that.sendCompletedMissions(UserSettings._get('completedMissions'))

        // Call callback since we already have the data in userSettings
        callback()
      })
      .on('invalidToken', () => {
        console.log(
          'Server has indicated that sent token is invalid. Logging out.',
        )

        game.scene.getScenes(true).forEach((scene) => {
          if (scene instanceof BaseScene) {
            scene.signalError('Invalid login token.')
          }
        })

        wsServer.close(code)
        wsServer = undefined
      })
      .on('alreadySignedIn', () => {
        console.log(
          'Server indicated that the given uuid is already signed in. Logging out.',
        )
        wsServer.close(code)
        wsServer = undefined

        UserDataServer.logout()

        // TODO Make this a part of the static logout method
        game.scene
          .getScenes(true)[0]
          .scene.start('SigninScene', { autoSelect: false })
          .launch('MenuScene', {
            menu: 'message',
            title: 'ERROR',
            s: 'The selected account is already logged in on another device or tab. Please select another account option.',
          })
      })
      .on('sendUserData', (data) => {
        that.loadUserData(data)
        callback()
      })

    // If the connection closes, login again with same args
    wsServer.ws.onclose = (event) => {
      // Don't attempt to login again if the server explicitly logged us out
      if (event.code !== code) {
        console.log(
          'Logged in websocket is closing, signing in again with token:',
        )
        console.log(payload)

        UserDataServer.login(payload, game)
      }
    }
  }

  static logout(): void {
    console.log('Logging out')
    if (UserDataServer.isLoggedIn()) {
      console.log('server was logged in and now its logging out...')

      wsServer.close(code)
      wsServer = undefined

      UserSettings.clearSessionStorage()
    }
  }

  // Returns if the user is logged in
  static isLoggedIn(): boolean {
    return wsServer !== undefined
  }

  // Send server an updated list of decks
  static sendDecks(decks): void {
    if (wsServer === undefined) {
      throw 'Sending decks when server ws doesnt exist.'
    } else {
      // On database, decks are stored as a pair of strings, convert before sending
      let decksAsList = []

      decks.forEach((deck) => {
        let tuple = [deck['name'], deck['value'], deck['avatar']]
        decksAsList.push(tuple)
      })

      wsServer.send({
        type: 'sendDecks',
        decks: decksAsList,
      })
    }
  }

  // Send server user's inventory of unlocked cards
  static sendInventory(ary): void {
    if (wsServer === undefined) {
      throw 'Sending inventory when server ws doesnt exist.'
    } else {
      let result = ''
      for (let i = 0; i < ary.length; i++) {
        result += ary[i] ? '1' : '0'
      }

      wsServer.send({
        type: 'sendInventory',
        inventory: result,
      })
    }
  }

  // Send server user's list of completed missions
  static sendCompletedMissions(ary): void {
    if (wsServer === undefined) {
      throw 'Sending completed missions when server ws doesnt exist.'
    } else {
      let result = ''
      for (let i = 0; i < ary.length; i++) {
        result += ary[i] ? '1' : '0'
      }

      wsServer.send({
        type: 'sendCompletedMissions',
        missions: result,
      })
    }
  }

  // Load user data that was sent from server into session storage
  private static loadUserData(data): void {
    // Map from binary string to bool array
    sessionStorage.setItem(
      'inventory',
      JSON.stringify(
        data.inventory
          .toString()
          .split('')
          .map((char) => char === '1'),
      ),
    )
    sessionStorage.setItem(
      'completedMissions',
      JSON.stringify(
        data.completedMissions
          .toString()
          .split('')
          .map((char) => char === '1'),
      ),
    )

    // Decks must be translated from string, string to dictionary
    let decks = []
    data.decks.forEach((pair) => {
      let name = pair[0]
      let deckCode = pair[1]
      // TODO Decks must have an avatar
      let avatar = pair[2] | 0

      decks.push({ name: name, value: deckCode, avatar: avatar })
    })
    sessionStorage.setItem('decks', JSON.stringify(decks))
  }

  // TODO Clarify if we reuse a UserSessionWS or create a new ws even for signed in users
  // Get the appropriate websocket for this environment
  // If user is logged in, use the existing ws instead of opening a new one
  private static getSocket(): UserDataClientWS {
    // Establish a websocket based on the environment
    if (Flags.local) {
      return new TypedWebSocket(`ws://${URL}:${USER_DATA_PORT}`)
    } else {
      // The WS location on DO
      // let loc = window.location
      const fullPath = `wss://celestialtcg.com/user_data_ws`
      return new TypedWebSocket(fullPath)
    }
  }
}
