export const URL = '127.0.0.1'
export const PORT = 5555

// TODO Separate out

type SocketPayloads = {
  // Client to server
  'init' : {
    deck: string;
    avatar: number;
  };
  'play_card' : {card: number};
  'mulligan' : {};
  'pass_turn' : {};
  'exit_match' : {};
  'emote' : {};
  // Server to client
  'both_players_connected' : {
    value: boolean;
  };
  'transmit_state' : {};
  'signal_error' : {};
  'dc' : {};
  'opponent_emote': {};
}

// All of the types of messages sent
type SocketMessage = keyof SocketPayloads
// Union of all the payloads
type SocketMessagePayload = SocketPayloads[SocketMessage]

// A WebSocket which can only emit the messages we have defined above
export class TypedWebSocket extends WebSocket {
  private listeners: { [key in SocketMessage]?: Array<(data: SocketMessagePayload) => void> } = {};
  
  constructor(url) {
    super(url)

    // Whenever a message is received, call each callback for that message
    this.onmessage = (event) => {
      const message = JSON.parse(event.data)
      // TODO Handle parse error
      const listeners = this.listeners[message.type]
      if (listeners) {
        listeners.forEach(callback => callback(message.payload))
      }
    }
  }

  sendMessage<T extends SocketMessage>(
    messageType: T,
    payload: SocketPayloads[T]
  ) {
    const message = {
      type: messageType,
      value: payload,
    }
    return super.send(JSON.stringify(message))
  }

  // TODO This could be more strongly typed
  on(eventName: SocketMessage, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName]?.push(callback)
  }
}

// Create the websocket server
type SocketActionFn<T extends SocketMessagePayload> = (message: T) => void

export interface WrappedServerSocket<T extends SocketMessage> {
  event: T;
  callback: SocketActionFn<SocketPayloads[T]>;
}

export function createSocket<T extends SocketMessage>(
  event: T,
  callback: SocketActionFn<SocketPayloads[T]>
): WrappedServerSocket<T> {
  return { event, callback };
}
