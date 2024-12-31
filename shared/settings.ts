// Settings for functional aspects of the game
export class MechanicsSettings {
  static readonly DECK_SIZE = 15
  static readonly NUM_MULLIGANS = 3

  static readonly DRAW_PER_TURN = 2
  static readonly START_HAND_REAL = 3
  static readonly START_HAND =
    MechanicsSettings.START_HAND_REAL - MechanicsSettings.DRAW_PER_TURN
  static readonly HAND_CAP = 6

  static readonly BREATH_GAIN_PER_TURN = 1
  static readonly START_BREATH = 1 - MechanicsSettings.BREATH_GAIN_PER_TURN
  static readonly BREATH_CAP = 10
}

// Information about the decklists
export class DecklistSettings {
  static readonly MAX_DECK_NAME_LENGTH = 20
  static readonly MAX_DECKS = 30
}

export type Mulligan = [boolean, boolean, boolean]
