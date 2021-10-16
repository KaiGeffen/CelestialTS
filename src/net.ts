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


export class Network {
	socket: WebSocket
	// The version-number of that state that the client is displaying, for use with verifying with server
	versionNumber: number = -1

	constructor(deck, scene, mmCode) {
		let that = this

		// The first message sent to server once the match starts
		let initMessage = JSON.stringify({
			type: 'init',
			value: encodeDeck(deck)
		})

		let socket = this.socket = this.getSocket(mmCode)

		// Connection opened
		socket.addEventListener('open', function (event) {
			console.log('Socket open')
		})

		// Listen for messages
		socket.addEventListener('message', function (event) {
			let msg
			try {
				msg = JSON.parse(event.data)
			} catch (e) {
				console.log('Not valid json: ' + event.data)
				return
			}

			switch (msg.type) {
				case 'both_players_connected':
					if (msg.value) {
						socket.send(initMessage)
						scene.displaySearchingStatus(false)
					}
					else {
						scene.displaySearchingStatus(true)
					}
					break

				case 'transmit_state':
					let state = new ClientState(msg.value)
					if (state.versionNumber > that.versionNumber) {
						scene.queueState(state)
					}
					break

				// Signal to the user that they chose an illegal action
				case 'signal_error':
					scene.signalError()
					break

				// Tell user that their opponent disconnected
				case 'dc':
					scene.signalDC()
					break
			}
		})

		// If user is logged in, communicate that we are now searching for a match
		let message = JSON.stringify({
			type: 'find_match',
			value: mmCode
		})
		socket.send(message)
	}

	playCard(index: number) {
		let msg = {
			"type": "play_card",
			"value": index,
			"version": this.versionNumber
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
			"version": this.versionNumber
		}
		this.socket.send(JSON.stringify(msg))
	}

	// Signal to server that we are exiting this match
	exitMatch() {
		console.log(Server.loggedIn())

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
	setVersionNumber(versionNumber: number): void {
		this.versionNumber = versionNumber
	}

	// Get the appropriate websocket for this environment / matchmaking code
	// If user is logged in, use the existing ws instead of opening a new one
	private getSocket(mmCode): WebSocket {
		console.log(Server.loggedIn())

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