import intro from "./intro.json"


export const adventures: Adventure[] = [
  ...intro
]

export interface Adventure {
  name: string,
  id: number,
  prereq: number[][],
  type: string
}
