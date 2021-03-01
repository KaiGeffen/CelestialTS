import data from "./catalog.json";

export const collectibleCards: Card[] = data;

export interface Card {
  name: string;
  cost: number;
  // text: string;
}
