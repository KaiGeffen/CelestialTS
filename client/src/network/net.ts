import {URL, PORT} from '../../../shared/settings'

// import { io } from "socket.io-client"
// import * as dgram from "dgram"
import { encodeDeck } from "../lib/codec"
import ClientState from "../lib/clientState"
import Server from "./server"

import { Flags } from "../settings/settings"




// import { SocketMessage, User } from "../contracts/events";

// import socketIOClient from "socket.io-client";

// const socketClient = socketIOClient();

// interface EmitterCallback<T> {
//   (data: T): void;
// }

// interface WrappedClientSocket<T> {
//   emit: (data: T) => SocketIOClient.Socket;
//   on: (callback: EmitterCallback<T>) => SocketIOClient.Emitter;
//   off: (callback: EmitterCallback<T>) => SocketIOClient.Emitter;
// }

// function createSocket<T>(event: SocketMessage): WrappedClientSocket<T> {
//   return {
//     emit: (data) => socketClient.emit(event, data),
//     on: (callback) => socketClient.on(event, callback),
//     off: (callback) => socketClient.off(event, callback),
//   };
// }

// const chatMessageEvent: WrappedClientSocket<string> =
//   createSocket("chat_message");
// const userConnectedSocket: WrappedClientSocket<User> =
//   createSocket("user_connected");















// The version-number of that state that the client is displaying, for use with verifying with server
export var versionNumber: number
// NOTE Need this because could be normal game scene or tutorial scene (They are different)
var scene
// NOTE This can change, but the listener is only created once, so it needs to reference this var
var initMessage

export class MatchWS {
	socket: WebSocket
	
	constructor(deck: string, newScene, mmCode, avatarID: number) {
		// TODO Use newScene
		console.log('Making a new websocket for this match')

		let socket = this.socket = this.getSocket(mmCode)
		socket.onmessage = (event) => {
			console.log('got some sort of message')
			if (typeof event.data === 'string') {
				this.handleMessage(JSON.parse(event.data))
			}
			else {
				throw new Error(`MatchWebsocket expected string response data but received: ${typeof event.data}`);
			}
		}
		
		socket.onclose = () => {
			console.log('Disconnected from the server');
		};
		
		socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		}
	}
	
	// Handle a message response from server
	private handleMessage(msg) {
		switch (msg.type) {
			// TODO Types for these
			case 'both_players_connected':
			console.log('Both players are connected!');
			if (msg.value) {
				// Send the initial message, including things like the deck we are using
				this.socket.send(initMessage)
				
				// Signal that a match has been found
				scene.signalMatchFound()
			}
			break
			
			case 'transmit_state':
			console.log('Received game state:', msg.state);
			let state = new ClientState(msg.value)
			
			if (state.versionNumber > versionNumber) {
				scene.queueState(state)
			}
			break;
			
			case 'signal_error':
			console.log('Server says that an action was in error.')
			// TODO Handle signalling or logging that error on the client
			break;
			
			case 'dc':
			console.log('Opponent has disconnected.');
			scene.signalDC()
			break;
			
			case 'opponent_emote':
			console.log('Opponent emote received:', msg.emote);
			scene.emote(msg.value)
			break;
			
			default:
			console.warn('Unknown message type:', msg.type);
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
		// TODO Remove if UserSessionWS is separate from this
		// If user is anon, close socket
		else {
			this.socket.close(1000)
		}
	}
	
	// Set the version number of the state that the client is seeing
	// Set the 
	setVersionNumber(vn: number): void {
		versionNumber = vn
	}
	
	// Signal to the server that we have emoted
	signalEmote(emoteNumber=0): void {
		const msg = JSON.stringify({
			type: 'emote',
			value: emoteNumber,
		})
		
		this.socket.send(msg)
	}
	
	// TODO Clarify if we reuse a UserSessionWS or create a new ws even for signed in users
	// Get the appropriate websocket for this environment / matchmaking code
	// If user is logged in, use the existing ws instead of opening a new one
	private getSocket(mmCode): WebSocket {
		// Establish a websocket based on the environment
		let socket
		if (Server.loggedIn()) {
			socket = Server.getWS()
		}
		else if (Flags.local) {
			// TODO
			socket = new WebSocket(`ws://${URL}:${PORT}`);
		}
		else {
			// The WS location on DO
			let loc = window.location
			const fullPath = `wss://celestialtcg.com/ws/${mmCode}`
			socket = new WebSocket(fullPath)
		}
		
		return socket
	}
}