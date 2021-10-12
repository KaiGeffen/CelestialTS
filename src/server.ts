const ip = '127.0.0.1' //'10.244.30.242'
//'10.244.10.228'//'216.193.175.49'
//'127.0.0.1'//'192.168.1.154' //'server-6d66b4ccc9-xc989'
const port = 5555
// const internalPort = 4321

// The websocket which is open with the main server (Authentication/pack opening)
var wsServer: WebSocket = undefined

class Server {
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
					let val = msg.value
					console.log(val)
					// TODO Use user data
					break
			}
		})
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

	requestPack(): void {
		console.log('you want a pack lol')
	}

	pick3rdCard(): void {
		console.log('you picking a card lol')
	}
}
