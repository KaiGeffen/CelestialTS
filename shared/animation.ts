import Card from './state/card'
import { Status } from '../client/src/lib/status'
import { Zone } from './state/zone'

export class Animation {
  public from?: Zone
  public to?: Zone
  public card?: Card
  public index?: number
  public index2?: number
  public status?: Status

  constructor(init?: Partial<Animation>) {
    Object.assign(this, init)
  }
}
