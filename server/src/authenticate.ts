import os from 'os'
import { WebSocketServer } from 'ws'
import { Client } from 'pg'
import { google } from 'google-auth-library'
import { run, post, request, response, get, route } from 'bottlejs'
import { getMatch, matchCleanup, handleGameMessages } from './gameServer'
import { Settings } from './Settings'

const CLIENT_ID =
  '574352055172-n1nqdc2nvu3172levk2kl5jf7pbkp4ig.apps.googleusercontent.com'
const COST_PACK = 100
const IGC_INDEX = 1
const WIN_AMT = 15

const HOST =
  os.platform() === 'darwin'
    ? 'Local build does not use authenticate'
    : process.env.DATABASE_URL.split('@')[1].split(':')[0]

const signedInUUIDs: { [key: string]: WebSocket } = {}

async function authenticate(ws: WebSocket) {
  const message = JSON.stringify({ type: 'request_token' })
  ws.send(message)

  let userData: any = null
  let choiceCards = [0, 0, 0]
  let path: string | null = null
  let uuid: string | null = null

  ws.on('message', async (message: string) => {
    const data = JSON.parse(message)

    if (data.type === 'send_token') {
      uuid = data.uuid.padEnd(32, '0')
      const email = data.email

      if (!uuid) {
        ws.send(JSON.stringify({ type: 'invalid_token' }))
        ws.close()
        return
      }

      if (signedInUUIDs[uuid]) {
        try {
          signedInUUIDs[uuid].ping()
          uuid = null
          ws.send(JSON.stringify({ type: 'already_signed_in' }))
          ws.close()
          return
        } catch (e) {
          // Existing connection is closed, sign in this user as normal below
        }
      }

      signedInUUIDs[uuid] = ws
      userData = await getUserData(uuid, email)

      if (!userData) {
        ws.send(JSON.stringify({ type: 'prompt_user_init' }))
      } else {
        ws.send(JSON.stringify({ type: 'send_user_data', value: userData }))
      }
    } else if (data.type === 'send_user_progress') {
      adjustUserProgress(uuid, data.value)
    } else if (data.type === 'send_decks') {
      adjustDecks(uuid, data.value)
    } else if (data.type === 'send_inventory') {
      adjustInventory(uuid, data.value)
    } else if (data.type === 'send_completed_missions') {
      adjustCompletedMissions(uuid, data.value)
    } else if (data.type === 'find_match') {
      path = data.value
      const { match, player } = await getMatch(ws, path, uuid)
    } else if (data.type === 'exitMatch') {
      await matchCleanup(path, match, ws)
      path = null
    } else {
      await handleGameMessages(data, match, player)
    }
  })

  ws.on('close', async () => {
    if (path) {
      await matchCleanup(path, match)
    }
    if (uuid) {
      delete signedInUUIDs[uuid]
    }
  })
}

const jtis: { [key: string]: boolean } = {}

post('/gapi', async (req, res) => {
  const token = req.body
  try {
    const ticket = await google.auth.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const userid = payload['sub']
    const email = payload['email']
    const jti = payload['jti']
    jtis[jti] = true
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(400)
  }
})

async function getUserData(id: string, email: string) {
  const client = new Client({
    user: 'postgres',
    password: process.env.DB_PWD,
    host: HOST,
    port: 5432,
    database: 'celestial',
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  try {
    const res = await client.query('SELECT * FROM players WHERE id = $1', [id])
    if (res.rowCount > 0) {
      return res.rows[0]
    } else {
      await client.query('INSERT INTO players (ID, EMAIL) VALUES ($1, $2)', [
        id,
        email,
      ])
      return null
    }
  } finally {
    await client.end()
  }
}

function adjustUserProgress(uuid: string, userProgress: any) {
  const progressNoQuotes = JSON.stringify(userProgress)
    .replace(/'/g, '')
    .replace(/\[/g, '{')
    .replace(/\]/g, '}')
  updateDb('UPDATE players SET userprogress = $1 WHERE id = $2', [
    progressNoQuotes,
    uuid,
  ])
}

function adjustDecks(uuid: string, decks: any) {
  const decksNoQuotes = JSON.stringify(decks)
    .replace(/'/g, '')
    .replace(/\[/g, '{')
    .replace(/\]/g, '}')
  updateDb('UPDATE players SET decks = $1 WHERE id = $2', [decksNoQuotes, uuid])
}

function adjustInventory(uuid: string, binaryString: string) {
  updateDb('UPDATE players SET inventory = $1 WHERE id = $2', [
    binaryString,
    uuid,
  ])
}

function adjustCompletedMissions(uuid: string, binaryString: string) {
  updateDb('UPDATE players SET completedmissions = $1 WHERE id = $2', [
    binaryString,
    uuid,
  ])
}

function updateDb(query: string, values: any[]) {
  const client = new Client({
    user: 'postgres',
    password: process.env.DB_PWD,
    host: HOST,
    port: 5432,
    database: 'celestial',
    ssl: { rejectUnauthorized: false },
  })

  client.connect()

  client
    .query(query, values)
    .then(() => client.end())
    .catch((err) => {
      console.error('Error executing query', err.stack)
      client.end()
    })
}
