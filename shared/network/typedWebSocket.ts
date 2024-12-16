// All supported messages (type and payload) between server and client
type SupportedMessages = {
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
  transmit_state: {} // TODO
  signal_error: {}
  dc: {}
  opponent_emote: {}
}

// All of the types of messages sent
type MessageTypes = keyof SupportedMessages

// A full message sent through the WS (Both its type and the payload fields for that type)
type WSMessage<T extends MessageTypes> = SupportedMessages[T] & {
  type: T
}

// A WebSocket which can only emit the messages we have defined above
export class TypedWebSocket {
  private listeners: {
    [T in MessageTypes]?: Array<(data: SupportedMessages[T]) => void>
  } = {}

  // NOTE Wrapping is necessary instead of inheritance because traditional inheritance is not possible for WebSocket in all environments
  ws: WebSocket

  constructor(url: string | WebSocket) {
    if (typeof url === 'string') {
      this.ws = new WebSocket(url)
    } else {
      this.ws = url
    }

    // Whenever a message is received, call each callback for that message
    this.ws.onmessage = (ev: MessageEvent): void => {
      // The type of the message TODO Explain better, this is union over all the SocketMessages, and is consistent below
      type T = MessageTypes

      const message: WSMessage<T> = JSON.parse(ev.data)
      console.log(message)

      // TODO Handle parse error

      const listeners: Array<(data: SupportedMessages[T]) => void> =
        this.listeners[message.type]
      // If there are any listeners for this event type, call each of them
      if (listeners) {
        listeners.forEach((callback) => callback(message))
      }
    }
  }

  send<T extends MessageTypes>(message: WSMessage<T>): void {
    return this.ws.send(JSON.stringify(message))
  }

  on<T extends MessageTypes>(
    messageType: T,
    callback: (data: SupportedMessages[T]) => void,
  ): this {
    if (!this.listeners[messageType]) {
      this.listeners[messageType] = []
    }
    this.listeners[messageType]?.push(callback)

    return this
  }
}

// Create a pairing of the event type received / the callback using that event types payload
/*
  This is used so that each of the events can be described
  at the bottom of a file instead of chaining .on calls in a method
*/
export function createEvent<T extends MessageTypes>(
  event: T,
  callback: (data: SupportedMessages[T]) => void,
): { event: T; callback: (data: SupportedMessages[T]) => void } {
  return { event, callback }
}
