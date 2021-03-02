// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "./catalog/codec"

const messageHeaders = {
	init: 'Init'
}

const bufSize = 4096 * 2

const port = 6789

export class Network {
	constructor(deck) {

		let encodedDeck = encodeDeck(deck)
		let initMessage = JSON.stringify({
			type: 'init',
			value: encodedDeck
		})

		// Create WebSocket connection.
		const socket = new WebSocket(`ws://localhost:${port}`);

		// Connection opened
		socket.addEventListener('open', function (event) {
			
		});

		// Listen for messages
		socket.addEventListener('message', function (event) {
			let msg = JSON.parse(event.data)
			switch (msg.type) {
				case 'both_players_connected':
					if (msg.value) {
						console.log('READY FOR ACTION')
						
						socket.send(initMessage)
					}
					break

				case 'state':
					console.log(msg.value)
					break
			}
		})
	}
}