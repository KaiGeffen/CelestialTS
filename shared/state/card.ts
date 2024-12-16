import { Status, Quality } from './effects'
import { Anim } from './animation'

export class Card {
  constructor(
    public name: string,
    public cost: number = 0,
    public points: number = 0,
    public qualities: Quality[] = [],
    public text: string = '',
    // TODO
    public dynamicText: string = '',
    public id: number = -1,
  ) {}

  play(player: number, game: any, index: number, bonus: number): string {
    let result = this.points + bonus

    result += game.status[player].filter(
      (status: Status) => status === Status.NOURISH,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.NOURISH,
    )
    result -= game.status[player].filter(
      (status: Status) => status === Status.STARVE,
    ).length
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== Status.STARVE,
    )

    game.score[player] += result

    return result > 0 ? `+${result}` : `${result}`
  }

  ratePlay(world: any): number {
    return Math.max(1, this.cost)
  }

  rateDelay(world: any): number {
    return 0
  }

  getCost(player: number, game: any): number {
    return this.cost
  }

  onUpkeep(player: number, game: any, index: number): boolean {
    return false
  }

  inHandOnPlay(player: number, game: any): boolean {
    return false
  }

  morning(player: number, game: any, index: number): boolean {
    return false
  }

  onPlay(player: number, game: any): void {}

  onRoundEnd(player: number, game: any): void {}

  reset(game: any): string {
    game.score = [0, 0]
    return '\nReset'
  }

  addMana(amt: number, game: any, player: number): string {
    game.mana[player] += amt
    for (let i = 0; i < amt; i++) {
      game.status[player].push(Status.INSPIRED)
    }
    return amt > 0 ? `\n+${amt} mana` : ''
  }

  addStatus(amt: number, game: any, player: number, stat: Status): string {
    let recap = `\n${stat} ${amt}`
    if (amt <= 0) recap = ''

    for (let i = 0; i < amt; i++) {
      if (
        stat === Status.NOURISH &&
        game.status[player].includes(Status.STARVE)
      ) {
        game.status[player] = game.status[player].filter(
          (status: Status) => status !== Status.STARVE,
        )
      } else if (
        stat === Status.STARVE &&
        game.status[player].includes(Status.NOURISH)
      ) {
        game.status[player] = game.status[player].filter(
          (status: Status) => status !== Status.NOURISH,
        )
      } else {
        game.status[player].push(stat)
      }
    }
    return recap
  }

  removeStatus(game: any, player: number, removedStatus: Status): void {
    game.status[player] = game.status[player].filter(
      (status: Status) => status !== removedStatus,
    )
  }

  inspire(amt: number, game: any, player: number): string {
    game.animations[player].push(new Anim('Status', 0))
    return this.addStatus(amt, game, player, Status.INSPIRE)
  }

  nourish(amt: number, game: any, player: number): string {
    game.animations[player].push(new Anim('Status', 2))
    return this.addStatus(amt, game, player, Status.NOURISH)
  }

  starve(amt: number, game: any, player: number): string {
    game.animations[player].push(new Anim('Status', 3))
    return this.addStatus(amt, game, player, Status.STARVE)
  }

  draw(amt: number, game: any, player: number): string {
    let recap = ''
    let numDrawn = 0
    for (let i = 0; i < amt; i++) {
      const card = game.draw(player)
      if (card) numDrawn++
    }
    if (numDrawn > 0) recap = `\nDraw ${numDrawn}`
    return recap
  }

  create(card: Card, game: any, player: number): void {
    game.create(player, card)
  }

  createInPile(card: Card, game: any, player: number): string {
    game.createInPile(player, card)
    return `\n${card.name}`
  }

  createInStory(card: Card, game: any, player: number): void {
    game.createInStory(player, card)
  }

  tutor(cost: number, game: any, player: number): string {
    const card = game.tutor(player, cost)
    return card ? `\nTutor ${cost}` : ''
  }

  discard(amt: number, game: any, player: number, index: number = 0): string {
    let recap = '\nDiscard:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.discard(player, index)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  bottom(amt: number, game: any, player: number): string {
    let recap = '\nBottom'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.bottom(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  oust(amt: number, game: any, player: number): string {
    let recap = '\nOust:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.oust(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  mill(amt: number, game: any, player: number): string {
    let recap = '\nMill:'
    let anySeen = false
    for (let i = 0; i < amt; i++) {
      const card = game.mill(player)
      if (card) {
        anySeen = true
        recap += `\n${card.name}`
      }
    }
    return anySeen ? recap : ''
  }

  dig(amt: number, game: any, player: number): void {
    game.dig(player, amt)
  }

  build(amt: number, game: any, player: number): string {
    for (const card of game.hand[player]) {
      if (card.name === 'Child') {
        card.points += amt
        card.dynamicText = `0:${card.points}, Fleeting`
        return `\nBuild +${amt}`
      }
    }
    const card = new Card(
      'Child',
      0,
      amt,
      [Quality.FLEETING],
      '',
      false,
      false,
      `0:${amt}, fleeting`,
      1003,
    )
    if (game.create(player, card)) {
      return `\nBuild ${amt}`
    } else {
      return ''
    }
  }

  transform(index: number, card: Card, game: any): void {
    if (index + 1 <= game.story.acts.length) {
      const act = game.story.acts[index]
      const oldCard = act.card
      game.story.replaceAct(index, new Act(card, act.owner))
      game.animations[act.owner].push(
        new Anim('Transform', 'Story', CardCodec.encodeCard(oldCard), index),
      )
    }
  }

  removeAct(index: number, game: any): any {
    return game.removeAct(index)
  }

  yourFinal(game: any, player: number): boolean {
    return !game.story.acts.some((act: Act) => act.owner === player)
  }

  rateReset(world: any): number {
    let knownValue = 0
    let theirUnknownCards = 0
    let theirMana =
      world.maxMana[1] +
      world.oppStatus.filter((status: Status) => status === Status.INSPIRED)
        .length

    for (const act of world.story.acts) {
      const card = act.card
      if (act.owner === 0) {
        knownValue -= card.cost
      } else if (card.qualities.includes(Quality.VISIBLE)) {
        knownValue += card.cost
        theirMana -= card.cost
      } else {
        theirUnknownCards++
      }
    }

    let value = knownValue
    for (let i = 0; i < theirUnknownCards; i++) {
      const guessedValue = Math.floor(theirMana / 2)
      value += guessedValue
      theirMana -= guessedValue
    }

    return value
  }

  rateDiscard(world: any): number {
    let extraCards = 0
    for (const act of world.story.acts) {
      if (['Gift', 'Mercy'].includes(act.card.name)) {
        extraCards++
      } else if (['Dagger', 'Bone Knife', 'Chimney'].includes(act.card.name)) {
        extraCards--
      }
    }

    const cardsInHandToValue = [0, 0.6, 0.8, 1, 1, 0.2, 0.1]
    const handCount = Math.max(
      0,
      Math.min(6, world.oppHand.length + extraCards),
    )

    return cardsInHandToValue[handCount]
  }
}

class FireCard extends Card {
  play(player: number, game: any, index: number, bonus: number): string {
    bonus -= index
    return super.play(player, game, index, bonus)
  }

  ratePlay(world: any): number {
    return this.points - world.story.acts.length
  }
}

class SightCard extends Card {
  constructor(
    public amt: number,
    ...args: any[]
  ) {
    super(...args)
  }

  onPlay(player: number, game: any): void {
    game.vision[player] += this.amt
  }
}
