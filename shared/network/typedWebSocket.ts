import GameModel from '../state/gameModel'
import { Mulligan } from '../settings'
import { Deck } from '../state/deck'

// All supported messages (type and payload) between server and client
type SupportedMessages = {
  // Client to server
  initPvp: {
    password: string
    // TODO Is this a string? Too long for a number?
    uuid: string
    deck: string
    avatar: number
  }
  initPve: {
    aiDeck: string
    // TODO Is this a string? Too long for a number? Is this necessary for pve
    uuid: string
    deck: string
    avatar: number
  }
  initTutorial: {
    num: number
  }
  playCard: {
    cardNum: number
  }
  mulligan: { mulligan: Mulligan }
  passTurn: {}
  exitMatch: {}
  emote: {}

  // Server to client
  gameStart: {}
  transmitState: { state: GameModel }
  signalError: {}
  dc: {}
  opponentEmote: {}

  // TODO Separate each of the above to/from server/client and this into 4 different subtypes of supported messages
  // Client to server
  sendToken: {
    email: string
    uuid: string
    jti: string
  }
  // TODO Type these and don't encode strings
  sendDecks: {
    decks: string[]
  }
  sendInventory: {
    inventory: string
  }
  sendCompletedMissions: {
    missions: string
  }

  // Server to client
  promptUserInit: {}
  invalidToken: {}
  alreadySignedIn: {}
  sendUserData: {
    inventory: string
    completedMissions: string
    decks: string[]
  }
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
      // The type of the message
      type T = MessageTypes

      let message: WSMessage<T>
      try {
        message = JSON.parse(ev.data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
        return
      }

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

  // Callback for when the socket is opened
  onOpen(callback: () => void): void {
    this.ws.onopen = callback
  }

  close(code?: number, reason?: string): void {
    this.ws.close(code, reason)
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
