import birds from './birds.json'
import ashes from './ashes.json'
import shadow from './shadow.json'
import pet from './pet.json'
import birth from './birth.json'
import vision from './vision.json'
import water from './water.json'

import intro from './intro.json'

export const adventureData: adventureNode[] = [
  ...intro,
  ...birds,
  ...ashes,
  ...shadow,
  ...pet,
  ...birth,
  ...vision,
  ...water,
]

// Base interface with common properties
interface AdventureBase {
  name: string
  x: number
  y: number
  id: number
  prereq: number[][]
}

interface MissionNode extends AdventureBase {
  deck: number[]
  opponent: number[]
  storyTitle?: string
  storyText?: string
}

interface CardNode extends AdventureBase {
  card: number
}

interface TipNode extends AdventureBase {
  tip: string
}

// Adventure is the union of all node types
export type adventureNode = MissionNode | CardNode | TipNode
