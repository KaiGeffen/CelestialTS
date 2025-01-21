import { Avatar } from './avatar'
import Card from './card'

export interface Deck {
  name: string
  cards: Card[]
  avatar: Avatar
}
