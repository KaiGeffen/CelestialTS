
const bufSize = 4096 * 2

const ip = '127.0.0.1' //'10.244.30.242'
//'10.244.10.228'//'216.193.175.49'
//'127.0.0.1'//'192.168.1.154' //'server-6d66b4ccc9-xc989'
const port = 5555
// const internalPort = 4321


export default class Authentication {
	socket: WebSocket

	constructor(token) {
		let that = this

		// The first message sent to server once the match starts
		let tokenMessage = JSON.stringify({
			type: 'send_token',
			value: token
		})

		let socket = this.socket = this.getSocket()

		// Connection opened
		socket.addEventListener('open', function (event) {
			console.log('Auth socket open')
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
				case 'request_token':
					socket.send(tokenMessage)
					break

				case 'send_user_data':
					let val = msg.value
					console.log(val)
					break
			}
		})
	}

	closeSocket() {
		this.socket.close(1000)
	}

	// Get a websocket connection
	private getSocket(): WebSocket {
		// Establish a websocket based on the environment
		// The WS location on DO
		let loc = window.location
		let fullPath = `wss://${loc.host}${loc.pathname}ws/tokensignin`
		let socket = new WebSocket(fullPath)

		return socket
	}

}