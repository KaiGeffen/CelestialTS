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
	static login(token) {
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
					console.log(msg.value)
					// TODO Use user data
					break

				case 'send_pack':
					console.log(msg.value)
					let cards: Card[] = decodeDeck(msg.value)
					packOpenCallback(cards)
					break
			}
		})
	}

	// Returns if the user is logged in
	static loggedIn(): boolean {
		return wsServer !== undefined
	}

	// Request a pack from the server, sets the callback for when the pack is sent
	static requestPack(callback: (cards: Card[]) => void): void {
		console.log('you want a pack lol')

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
		console.log('you picking a card lol')

		if (wsServer === undefined) {
			throw 'Picking a choice card when server ws doesnt exist.'
		}
		else {
			wsServer.send(JSON.stringify({type: 'send_choice_card', value: index}))
		}
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
