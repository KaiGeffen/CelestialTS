import { TypedWebSocket } from './typedWebSocket'
import { UserDataClientMessages, UserDataServerMessages } from './userDataMessages'

export class UserDataClientWS extends TypedWebSocket<UserDataServerMessages, UserDataClientMessages> {}
export class UserDataServerWS extends TypedWebSocket<UserDataClientMessages, UserDataServerMessages> {}