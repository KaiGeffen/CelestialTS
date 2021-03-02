// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "./catalog/codec"
import ClientState from "./clientState"

const messageHeaders = {
	init: 'Init'
}

const bufSize = 4096 * 2

const port = 6789

export class Network {
	socket: WebSocket

	constructor(deck, scene) {

		let encodedDeck = encodeDeck(deck)
		let initMessage = JSON.stringify({
			type: 'init',
			value: encodedDeck
		})

		// Create WebSocket connection.
		let socket = new WebSocket(`ws://localhost:${port}`)
		this.socket = socket

		// Connection opened
		socket.addEventListener('open', function (event) {
			
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
					
					// TODO Allow for mulliganing
					socket.send(JSON.stringify({
						"type": "mulligan",
						"value": "000"
					}))

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
}