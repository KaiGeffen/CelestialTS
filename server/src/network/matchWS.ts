import { WebSocketServer } from 'ws'

import {URL, PORT, createSocket, TypedWebSocket, WrappedServerSocket} from '../../../shared/network/settings.js'

// Create the websocket server
export default function createMatchServer() {
    const wss = new WebSocketServer({ port: PORT })
    
    wss.on('connection', (socket: WebSocket) => {
        console.log('Client connected')

        // Communicate to client how many players have connected
        socket.send(JSON.stringify({
            type: 'both_players_connected', 
            value: true
        }))

        // Register each of the events
        registeredEvents.forEach(({event, callback}) => {
            wss.on(event, callback)
        })
    })

    console.log('Individual match server is running on port: ', PORT)
}



// Each of the events and its callback
const initEvent = createSocket<'init'>('init', (data) => {
    console.log('Initializing a match with data:', data)
})
const playCardEvent = createSocket<'play_card'>('play_card', (data) => {
    console.log('Playing a card:', data.card)
})

// TODO There's some clever way to ensure that all SocketMessages are covered
const registeredEvents = [initEvent, playCardEvent]
