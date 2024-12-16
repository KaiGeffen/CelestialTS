import os from 'os'

// Resources shared by both the Network and Server files

const BUFSIZE = 4096 * 2
const PORT = process.argv.length >= 3 ? parseInt(process.argv[2]) : 5555
const INTERNAL_PORT = 4321
// The ipv4 address of the host machine. Run ipconfig from cmd to get this
const HOST = '127.0.0.1'
const LOCAL = os.platform() === 'darwin' ? '127.0.0.1' : os.hostname()

const SINGLE_PLAYER = true

// Time client waits between sending requests for changed state
const CLIENT_WAIT = 0.1

// Messages
const GET_STATE = 'Get'
const DO_ACTION = 'Do'
const INIT_MSG = 'Init'
const MULLIGAN_MSG = 'Mull'

// Responses
const NO_UPDATE = 'No update'
const UPDATE = 'Update'
const VALID_CHOICE = 'Valid choice'
const INVALID_CHOICE = 'Invalid choice'

// Log into router, port forwarding, port 5555 to my local machine
// Tell my router goes to the ip I had been using

export {
  BUFSIZE,
  PORT,
  INTERNAL_PORT,
  HOST,
  LOCAL,
  SINGLE_PLAYER,
  CLIENT_WAIT,
  GET_STATE,
  DO_ACTION,
  INIT_MSG,
  MULLIGAN_MSG,
  NO_UPDATE,
  UPDATE,
  VALID_CHOICE,
  INVALID_CHOICE,
}
