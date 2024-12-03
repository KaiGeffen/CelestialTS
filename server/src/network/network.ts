import * as net from 'net'
import * as CardCodec from './CardCodec'
import {
  HOST,
  PORT,
  INIT_MSG,
  MULLIGAN_MSG,
  GET_STATE,
  DO_ACTION,
  BUFSIZE,
  NO_UPDATE,
  VALID_CHOICE,
  INVALID_CHOICE,
} from './Settings'
import { ClientModel } from './ClientModel'

export class Network {
  private conn: net.Socket

  constructor(deck: any) {
    this.conn = new net.Socket()
    this.conn.connect(PORT, HOST, () => {
      const deckCodes = CardCodec.encodeDeck(deck)
      const msg = `${INIT_MSG}:${deckCodes}\n`

      try {
        this.conn.write(msg)
        this.conn.on('data', (data) => {
          console.log(data.toString())
        })
      } catch (error) {
        console.error('Problem sending the starting deck', error)
      }
    })
  }

  sendMulligans(mulligans: any) {
    const msg = `${MULLIGAN_MSG}:${CardCodec.encodeMulligans(mulligans)}\n`
    this.conn.write(msg)
  }

  getState(model: ClientModel | null): Promise<ClientModel | null> {
    return new Promise((resolve, reject) => {
      const versionNum = model ? model.versionNum : -1
      const msg = `${GET_STATE}:${versionNum}\n`

      this.conn.write(msg)
      this.conn.once('data', (data) => {
        const response = data.toString()

        if (response.startsWith(NO_UPDATE)) {
          resolve(null)
        } else {
          const encodedState = response.split(':', 2)[1]
          resolve(new ClientModel(JSON.parse(encodedState)))
        }
      })
    })
  }

  sendAction(action: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (action) {
        const msg = `${DO_ACTION}:${action}\n`

        this.conn.write(msg)
        this.conn.once('data', (data) => {
          const response = data.toString()

          if (response === VALID_CHOICE) {
            resolve(true)
          } else if (response === INVALID_CHOICE) {
            resolve(false)
          } else {
            reject(
              new Error(
                `Server's response to an action wasn't valid or invalid but instead ${response}`
              )
            )
          }
        })
      } else {
        resolve(false)
      }
    })
  }
}
