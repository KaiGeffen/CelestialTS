import intro from "./intro.json"
import birds from "./birds.json"
import ashes from "./ashes.json"
import shadow from "./shadow.json"
import pet from "./pet.json"


export const adventureData: Adventure[] = [
  ...intro,
  ...birds,
  ...ashes,
  ...shadow,
  ...pet,
]

export interface Adventure {
  name: string,
  x: number,
  y: number,
  id: number,
  prereq: number[][],
  type: string,

  tutorial?: string,

  card?: number,

  deck?: string,
  opponent?: string,
}
