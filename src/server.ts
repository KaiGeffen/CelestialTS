import 'phaser'

import Card from "./lib/card"
import { decodeDeck } from "./lib/codec"
import { UserSettings } from "./settings/settings"


const ip = '127.0.0.1'
const port = 5555
// Custom code for closing websocket connection due to invalid token
const code = 1000

// The websocket which is open with the main server (Authentication/pack opening)
var wsServer: WebSocket = undefined
var packOpenCallback: (cards: Card[]) => void = undefined

export default class Server {
	// Log in with the server for user with given OAuth token
	static login(payload: any, scene?: Phaser.Scene) {
		let that = this

		console.log('Log in to server with payload:')
		console.log(payload)

		// Set / reset that server ws does not have an in-game listener yet
		Server.hasInGameListener = false

		// The first message sent to server once the match starts
		let tokenMessage = JSON.stringify({
			type: 'send_token',
			email: payload.email,
			uuid: payload.sub,
			jti: payload.jti,
		})

		wsServer = this.getWebSocket()

		// Connection opened
		wsServer.addEventListener('open', function (event) {
			console.log('Auth socket open')
		})

		// Listen for messages
		wsServer.addEventListener('message', function (event) {
			let msg
			try {
				msg = JSON.parse(event.data)
			} catch (e) {
				console.log('Not valid json: ' + event.data)
				return
			}

			switch (msg.type) {
				case 'request_token':
					wsServer.send(tokenMessage)
					break

				case 'send_user_data':
					that.loadUserData(msg.value)

					// Reload the home scene if we just loaded
					// TODO Call onExit for the current scene?
					if (scene !== undefined && scene.scene.isActive('HomeScene')) {
						scene.scene.start('HomeScene')
					}

					break

				// Prompt the user to send initial values to set up their account
				case 'prompt_user_init':
					that.sendDecks(UserSettings._get('decks'))
					that.sendUserProgress(UserSettings._get('userProgress'))
					that.sendInventory(UserSettings._get('inventory'))
					break

				case 'invalid_token':
					console.log('Server has indicated that sent token is invalid. Logging out.')
					// TODO Signal error, can't do it this way because preload scene
					// isnt of type baseScene
					// if (scene) {
					// 	scene['signalError']('Signed out from server.')
					// }
					
					wsServer.close(code)
					wsServer = undefined
					return
			}
		})

		// If the connection closes, login again with same args
		wsServer.addEventListener('close', (event) => {
			// Don't attempt to login again if the server explicitly logged us out
			if (event.code !== code) {
				console.log('Logged in websocket is closing, signing in again with token:')
				console.log(payload)

				Server.login(payload)
			}
		})
	}

	static logout(): void {
		console.log('Logging out')
		if (Server.loggedIn()) {
			console.log('server was logged in and now its logging out...')
			wsServer.close(code)
			wsServer = undefined
		}
	}

	// Get the open websocket, for use in playing a match
	static getWS() {
		return wsServer
	}

	// Returns if the user is logged in
	static loggedIn(): boolean {
		return wsServer !== undefined
	}

	// If this ws already has an event listener for messages related to the match scene
	static hasInGameListener = false

	// Request a pack from the server, sets the callback for when the pack is sent
	static requestPack(callback: (cards: Card[]) => void): void {
		if (wsServer === undefined) {
			throw 'Opening a pack when server ws doesnt exist.'
		}
		else {
			wsServer.send(JSON.stringify({type: 'request_pack'}))
			packOpenCallback = callback
		}
	}

	// Send the server the id of the card user wants to choose from the pack
	static sendChoiceCard(index: number): void {
		if (wsServer === undefined) {
			throw 'Picking a choice card when server ws doesnt exist.'
		}
		else {
			wsServer.send(JSON.stringify({type: 'make_choice', value: index}))
		}
	}

	// Send server an updated list of userProgress
	static sendUserProgress(value): void {
		if (wsServer === undefined) {
			throw 'Sending user progress when server ws doesnt exist.'
		}
		else {
			let message = JSON.stringify({
				type: 'send_user_progress',
				value: value
			})

			console.log(message)

			wsServer.send(message)
		}
	}

	// Send server an updated list of decks
	static sendDecks(decks): void {
		if (wsServer === undefined) {
			throw 'Sending decks when server ws doesnt exist.'
		}
		else {
			// On database, decks are stored as a pair of strings, convert before sending
			let decksAsList = []

			decks.forEach(deck => {
				let tuple = [deck['name'], deck['value'], deck['avatar']]
				decksAsList.push(tuple)
			})

			let message = JSON.stringify({
				type: 'send_decks',
				value: decksAsList
			})

			console.log(message)

			wsServer.send(message)
		}
	}

	// Send server user's inventory of unlocked cards
	static sendInventory(ary): void {
		if (wsServer === undefined) {
			throw 'Sending inventory when server ws doesnt exist.'
		}
		else {
			let result = ''
			for (let i = 0; i < ary.length; i++) {
				result += ary[i] ? '1' : '0'
			}

			let message = JSON.stringify({
				type: 'send_inventory',
				value: result
			})

			console.log(message)

			wsServer.send(message)
		}
	}

	// Send server user's list of completed missions
	static sendCompletedMissions(ary): void {
		if (wsServer === undefined) {
			throw 'Sending completed missions when server ws doesnt exist.'
		}
		else {
			let result = ''
			for (let i = 0; i < ary.length; i++) {
				result += ary[i] ? '1' : '0'
			}

			let message = JSON.stringify({
				type: 'send_completed_missions',
				value: result
			})

			console.log(message)

			wsServer.send(message)
		}
	}
	
	// Load user data that was sent from server into session storage
	private static loadUserData(data): void {
		// Put this data into the session storage so that UserSettings sees it before local storage
		sessionStorage.setItem('userProgress', JSON.stringify(data[6]))

		// Map from binary string to bool array
		const inventory = JSON.stringify([...data[7]].map(c => c === '1'))
		sessionStorage.setItem('inventory', inventory)
		const completedMissions = JSON.stringify([...data[8]].map(c => c === '1'))
		sessionStorage.setItem('completedMissions', completedMissions)

		// Decks must be translated from string, string to dictionary
		let decks = []
		data[5].forEach(pair => {
			let name = pair[0]
			let deckCode = pair[1]
			// TODO Decks must have an avatar
			let avatar = pair[2] | 0

			decks.push({name: name, value: deckCode, avatar: avatar})
		})
		sessionStorage.setItem('decks', JSON.stringify(decks))
	}

	// Get a websocket connection
	private static getWebSocket(): WebSocket {
		// Establish a websocket based on the environment
		// The WS location on DO
		let loc = window.location
		let fullPath = `wss://${loc.host}${loc.pathname}ws/tokensignin`
		let socket = new WebSocket(fullPath)

		return socket
	}
}
