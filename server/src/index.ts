import createMatchServer from './network/matchServer'
import createUserDataServer from './network/userDataServer'

console.log('Starting server')

/*
 This prevents async promises in the indivual websockets from causing the server to crash
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Create the websocket for individual matchs
createMatchServer()
createUserDataServer()
