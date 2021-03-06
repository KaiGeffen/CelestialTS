// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "./catalog/codec"
import ClientState from "./clientState"

const messageHeaders = {
	init: 'Init'
}

const bufSize = 4096 * 2

const ip = '192.168.1.152'//'216.193.175.49'
const port = 5555


export class Network {
	socket: WebSocket

	constructor(deck, scene) {

		let encodedDeck = encodeDeck(deck)
		let initMessage = JSON.stringify({
			type: 'init',
			value: encodedDeck
		})

		// Create WebSocket connection.
		let socket = new WebSocket(`ws://${ip}:${port}`, 'echo-protocol')
		this.socket = socket

		// Connection opened
		socket.addEventListener('open', function (event) {
			console.log('Socket open')
		})

		// Listen for messages
		socket.addEventListener('message', function (event) {
			let msg = JSON.parse(event.data)
			switch (msg.type) {
				case 'both_players_connected':
					if (msg.value) {
						socket.send(initMessage)
					}
					break

				case 'transmit_state':
					scene.displayState(new ClientState(msg.value))
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
}