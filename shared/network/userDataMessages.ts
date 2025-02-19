export interface UserDataClientMessages {
  sendToken: {
    email: string
    uuid: string
    jti: string
  }
  sendDecks: {
    decks: string[]
  }
  sendInventory: {
    inventory: string
  }
  sendCompletedMissions: {
    missions: string
  }
  // TODO change from sendUsername
  sendInitialUserData: {
    username: string
    decks: string[]
    inventory: string
    missions: string
  }
}

export interface UserDataServerMessages {
  promptUserInit: {}
  invalidToken: {}
  alreadySignedIn: {}
  sendUserData: {
    inventory: string
    completedMissions: string
    decks: string[]
  }
}
