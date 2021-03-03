import data from "./catalog.json";
import tokenData from "./tokens.json"

export const collectibleCards: Card[] = data
export const tokenCards: Card[] = tokenData
export const allCards: Card[] = collectibleCards.concat(tokenCards)
export const cardback: Card = tokenCards[0]

export interface Card {
  name: string;
  id: number;
  cost: number;
  // text: string;
}
