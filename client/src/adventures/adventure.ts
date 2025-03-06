import birds from './birds.json'
import ashes from './ashes.json'
import shadow from './shadow.json'
import pet from './pet.json'
import birth from './birth.json'
import vision from './vision.json'
import water from './water.json'

import intro from './intro.json'

export const adventureData: Adventure[] = [
  ...intro,
  ...birds,
  ...ashes,
  ...shadow,
  ...pet,
  ...birth,
  ...vision,
  ...water,
]

// TODO Clean this up by breaking it into the node types and having adventure be the union of all those
export interface Adventure {
  name: string
  x: number
  y: number
  id: number
  prereq: number[][]
  type: string

  card?: number

  deck?: number[]
  opponentDeck?: string

  // Tips have just text
  text?: string

  // This mission's story, if any
  storyTitle?: string
  storyText?: string
}
