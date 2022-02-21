import intro from "./intro.json"


export const adventureData: Adventure[] = [
  ...intro
]

export interface Adventure {
  name: string,
  x: number,
  y: number,
  id: number,
  prereq: number[][],
  type: string,
}
