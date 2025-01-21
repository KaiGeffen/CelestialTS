import createMatchServer from './network/matchServer'
import createUserDataServer from './network/userDataServer'

console.log('Starting server')

// Create the websocket for individual matchs
createMatchServer()
createUserDataServer()
