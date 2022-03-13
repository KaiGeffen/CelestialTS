import 'phaser'

import Card from "./lib/card"
import { decodeDeck } from "./lib/codec"


const ip = '127.0.0.1' //'10.244.30.242'
//'10.244.10.228'//'216.193.175.49'
//'127.0.0.1'//'192.168.1.154' //'server-6d66b4ccc9-xc989'
const port = 5555
// const internalPort = 4321

// The websocket which is open with the main server (Authentication/pack opening)
var wsServer: WebSocket = undefined
var packOpenCallback: (cards: Card[]) => void = undefined


export default class Server {
	// Log in with the server for user with given OAuth token
	static login(token, scene: Phaser.Scene) {
		let that = this

		// The first message sent to server once the match starts
		let tokenMessage = JSON.stringify({
			type: 'send_token',
			value: token
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
					if (scene.scene.isActive('HomeScene')) {
						scene.scene.start('HomeScene')
					}

					break

				case 'send_pack':
					let ids: number[] = msg.value
					// TODO Bad smell
					let cards: Card[] = decodeDeck(ids.join('™'))
					packOpenCallback(cards)
					break
			}
		})
	}

	// Get the open websocket, for use in playing a match
	static getWS() {
		return wsServer
	}

	// Returns if the user is logged in
	static loggedIn(): boolean {
		return wsServer !== undefined
	}

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
				let tuple = [deck['name'], deck['value']]
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

	// Load user data that was sent from server into session storage
	private static loadUserData(data): void {
		// Put this data into the session storage so that UserSettings sees it before local storage
		sessionStorage.setItem('igc', JSON.stringify(data[1]))
		sessionStorage.setItem('userProgress', JSON.stringify(data[5]))
		sessionStorage.setItem('inventory', JSON.stringify(data[7]))

		// Decks must be translated from string, string to dictionary
		let decks = []
		data[8].forEach(pair => {
			let name = pair[0]
			let deckCode = pair[1]

			decks.push({name: name, value: deckCode})
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
