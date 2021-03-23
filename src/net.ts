// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "./lib/codec"
import ClientState from "./lib/clientState"


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

	constructor(deck, scene, mmCode) {
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
					scene.displayState(new ClientState(msg.value))
					break

				// Signal to the user that they chose an illegal action
				case 'signal_error':
					scene.signalError()
					break
			}
		})
	}

	playCard(index: number) {
		let msg = {
			"type": "play_card",
			"value": index
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
			"type": "pass_turn"
		}
		this.socket.send(JSON.stringify(msg))
	}

	// Get the appropriate websocket for this environment / matchmaking code
	private getSocket(mmCode): WebSocket {
		// Establish a websocket based on the environment (Dev runs on 4949)
		let socket
		if (location.port === '4949') {
			socket = new WebSocket(`ws://${ip}:${port}/${mmCode}`)
		} else {
			// The WS location on DO
			let loc = window.location
			let fullPath = `wss://${loc.host}${loc.pathname}ws/${mmCode}`
			socket = new WebSocket(fullPath)
		}

		return socket
	}

}