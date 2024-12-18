export const DRAW_PER_TURN = 2
export const START_HAND_REAL = 3
export const START_HAND = START_HAND_REAL - DRAW_PER_TURN
export const HAND_CAP = 6

export type Mulligan = [boolean, boolean, boolean]

export const BREATH_GAIN_PER_TURN = 1
export const START_BREATH = 1 - BREATH_GAIN_PER_TURN
export const BREATH_CAP = 10

export const PASS = 10
