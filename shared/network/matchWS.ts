import { TypedWebSocket } from './typedWebSocket'
import { MatchClientMessages, MatchServerMessages } from './matchMessages'

export class MatchClientWS extends TypedWebSocket<MatchServerMessages, MatchClientMessages> {}
export class MatchServerWS extends TypedWebSocket<MatchClientMessages, MatchServerMessages> {}