// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "./lib/codec"
import ClientState from "./lib/clientState"
import Server from "./server"


const messageHeaders = {
	init: 'Init'
}

const bufSize = 4096 * 2

const ip = '127.0.0.1' //'10.244.30.242'
//'10.244.10.228'//'216.193.175.49'
//'127.0.0.1'//'192.168.1.154' //'server-6d66b4ccc9-xc989'
const port = 5555
// const internalPort = 4321

const MATCH_MAKING_PARAM = 'mm'

// The init message that client should send in response to a request for user's deck
var initMessage: string
var listenerAdded = false
// The version-number of that state that the client is displaying, for use with verifying with server
export var versionNumber: number
// NOTE Need this because could be normal game scene or tutorial scene (They are different)
var scene

export class Network {
	socket: WebSocket
	
	constructor(deck: string, newScene, mmCode, avatarID: number) {
		let that = this

		// Must be set each time constructed so that it doesn't persist and cause weird behavior
		// (States from previous match shown at the beginning)
		versionNumber = -1

		// The first message sent to server once the match starts
		initMessage = JSON.stringify({
			type: 'init',
			value: encodeDeck(deck), // .replace(':', '™') // TODO
			avatar: `${avatarID}`
		})

		scene = newScene

		let socket = this.socket = this.getSocket(mmCode)

		// Connection opened
		socket.addEventListener('open', function (event) {
			console.log('Socket open')
		})

		// NOTE Only add this listener if it hasn't been added already
		if (!listenerAdded) {
			// Listen for messages
			socket.addEventListener('message', function (event) {
				let msg

				try {
					msg = JSON.parse(event.data)
				} catch (e) {
					console.log('Not valid json: ' + event.data)
					return
				}

				console.log(msg)

				switch (msg.type) {
					case 'both_players_connected':
					if (msg.value) {
						// Send the initial message, including things like the deck we are using
						socket.send(initMessage)
					}
					break

					case 'transmit_state':
					let state = new ClientState(msg.value)
					
					if (state.versionNumber > versionNumber) {
						scene.queueState(state)
					}
					break

					// Signal to the user that they chose an illegal action
					case 'signal_error':
					console.log('Server says that an action was in error.')
					break

					// Tell user that their opponent disconnected
					case 'dc':
					scene.signalDC()
					break
				}
			})
		}

		// If user is logged in, communicate that we are now searching for a match
		if (Server.loggedIn()) {
			// If logged in, this same ws/listener will get reused
			listenerAdded = true

			let message = JSON.stringify({
				type: 'find_match',
				value: mmCode,
			})
			socket.send(message)
		}
	}

	playCard(index: number) {
		let msg = {
			"type": "play_card",
			"value": index,
			"version": versionNumber
		}
		this.socket.send(JSON.stringify(msg))
	}

	// String in the format '001' to mulligan just 3rd card, etc
	doMulligan(mulligans: string) {
		let msg = {
			"type": "mulligan",
			"value": mulligans
		}
		this.socket.send(JSON.stringify(msg))
	}

	passTurn() {
		let msg = {
			"type": "pass_turn",
			"version": versionNumber
		}
		this.socket.send(JSON.stringify(msg))
	}

	// Signal to server that we are exiting this match
	exitMatch() {
		// If user is logged in, send a message but keep the ws
		if (Server.loggedIn()) {
			let msg = {
				"type": "exit_match"
			}
			this.socket.send(JSON.stringify(msg))
		}
		// If user is anon, close socket
		else {
			this.socket.close(1000)
		}
	}

	// Establish the version number of the state that the client is seeing
	setVersionNumber(vn: number): void {
		versionNumber = vn
	}

	// Get the appropriate websocket for this environment / matchmaking code
	// If user is logged in, use the existing ws instead of opening a new one
	private getSocket(mmCode): WebSocket {
		// Establish a websocket based on the environment (Dev runs on 4949)
		let socket
		if (Server.loggedIn()) {
			socket = Server.getWS()
		}
		else if (location.port === '4949') {
			socket = new WebSocket(`ws://${ip}:${port}/${mmCode}`)
		}
		else {
			// The WS location on DO
			let loc = window.location
			let fullPath = `wss://${loc.host}${loc.pathname}ws/${mmCode}`
			socket = new WebSocket(fullPath)
		}

		return socket
	}

}