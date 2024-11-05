export const URL = '127.0.0.1'
export const PORT = 5555

// TODO Separate out

type SocketPayloads = {
  // Client to server
  init: {
    deck: string
    avatar: number
  }
  play_card: { card: number }
  mulligan: {}
  pass_turn: {}
  exit_match: {}
  emote: {}
  // Server to client
  both_players_connected: {
    value: boolean
  }
  transmit_state: {}
  signal_error: {}
  dc: {}
  opponent_emote: {}
}

// All of the types of messages sent
type SocketMessage = keyof SocketPayloads
// Union of all the payloads
type SocketMessagePayload = SocketPayloads[SocketMessage]

// The message that is sent or received through the WebSocket
type WSMessage<T extends SocketMessage> = SocketPayloads[T] & {
  type: T
}

// A WebSocket which can only emit the messages we have defined above
export class TypedWebSocket {
  private listeners: {
    [T in SocketMessage]?: Array<(data: SocketPayloads[T]) => void>
  } = {}

  // NOTE This is necessary instead of extending WebSocket because of how WebSocket is polyfilled
  ws: WebSocket

  constructor(url: string | WebSocket) {
    if (typeof url === 'string') {
      this.ws = new WebSocket(url)
    } else {
      this.ws = url
    }

    // Whenever a message is received, call each callback for that message
    this.ws.onmessage = (event) => {
      // The type of the message TODO Explain better, this is union over all the SocketMessages, and is consistent below
      type T = SocketMessage

      const message: WSMessage<T> = JSON.parse(event.data)
      console.log(message)

      // TODO Handle parse error

      const listeners: Array<(data: SocketPayloads[T]) => void> =
        this.listeners[message.type]
      if (listeners) {
        listeners.forEach((callback) => callback(message))
      }
    }
  }

  sendMessage<T extends SocketMessage>(message: WSMessage<T>): void {
    return this.ws.send(JSON.stringify(message))
  }

  on<T extends SocketMessage>(
    messageType: T,
    callback: (data: SocketPayloads[T]) => void
  ): this {
    if (!this.listeners[messageType]) {
      this.listeners[messageType] = []
    }
    this.listeners[messageType]?.push(callback)

    return this
  }
}

// Create the websocket server
type SocketActionFn<T extends SocketMessagePayload> = (message: T) => void

// TODO Remove the below
export type WrappedServerSocket<T extends SocketMessage> = {
  event: T
  callback: SocketActionFn<SocketPayloads[T]>
}

export function createSocket<T extends SocketMessage>(
  event: T,
  callback: SocketActionFn<SocketPayloads[T]>
): WrappedServerSocket<T> {
  return { event, callback }
}
