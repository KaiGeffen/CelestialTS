import { Anim } from '../../shared/state/animation'
import { CardCodec } from '../../shared/codec'
import { Story, Source } from './logic/Story'
import { hidden_card } from './logic/Catalog'
import { Quality } from '../../shared/state/effects'
import { Recap } from '../../shared/state/recap'

const DRAW_PER_TURN = 2
const START_HAND_REAL = 3
const START_HAND = START_HAND_REAL - DRAW_PER_TURN
const HAND_CAP = 6

const MANA_GAIN_PER_TURN = 1
const START_MANA = 1 - MANA_GAIN_PER_TURN
const MANA_CAP = 10

const PASS = 10

class ServerModel {
  version_no: number = 0
  sound_effect: any = null
  animations: any[][] = [[], []]
  hand: any[][] = [[], []]
  deck: any[][] = [[], []]
  pile: any[][] = [[], []]
  last_shuffle: any[][] = [[], []]
  expended: any[][] = [[], []]
  score: number[] = [0, 0]
  wins: number[] = [0, 0]
  max_mana: number[] = [0, 0]
  mana: number[] = [0, 0]
  status: any[][] = [[], []]
  story: Story = new Story()
  passes: number = 0
  priority: number = 0
  vision: number[] = [0, 0]
  recap: Recap = new Recap()
  mulligans_complete: boolean[] = [false, false]
  amt_passes: number[] = [0, 0]
  amt_drawn: number[] = [0, 0]
  avatars: any[] = []
  round_results: any[][] = [[], []]
  last_player_who_played: number = 0

  constructor(
    deck1: any[],
    deck2: any[],
    avatar1: any,
    avatar2: any,
    shuffle = true,
  ) {
    this.version_no = 0
    this.sound_effect = null
    this.animations = [[], []]
    this.hand = [[], []]
    this.deck = [deck1, deck2]
    this.pile = [[], []]
    if (shuffle) {
      for (let p = 0; p < 2; p++) {
        this.shuffle(p, false)
      }
    }
    this.last_shuffle = [[], []]
    this.expended = [[], []]
    this.score = [0, 0]
    this.wins = [0, 0]
    this.max_mana = [0, 0]
    this.mana = [0, 0]
    this.status = [[], []]
    this.story = new Story()
    this.passes = 0
    this.priority = 0
    this.vision = [0, 0]
    this.recap = this.story.recap
    this.mulligans_complete = [false, false]
    this.amt_passes = [0, 0]
    this.amt_drawn = [0, 0]
    this.avatars = [avatar1, avatar2]
    this.round_results = [[], []]
    this.last_player_who_played = 0
  }

  version_incr() {
    this.version_no += 1
    this.animations = [[], []]
  }

  draw(player: number, amt = 1) {
    let card = null
    while (amt > 0 && this.hand[player].length < HAND_CAP) {
      if (this.deck[player].length === 0) {
        if (this.pile[player].length === 0) {
          return
        } else {
          this.shuffle(player)
        }
      }
      card = this.deck[player].pop()
      this.hand[player].push(card)
      this.amt_drawn[player] += 1
      amt -= 1
      this.animations[player].push(
        new Anim(
          'Deck',
          'Hand',
          CardCodec.encode_card(card),
          this.hand[player].length - 1,
        ),
      )
    }
    return card
  }

  discard(player: number, amt = 1, index = 0) {
    let card = null
    while (amt > 0 && this.hand[player].length > index) {
      card = this.hand[player].splice(index, 1)[0]
      this.pile[player].push(card)
      amt -= 1
      this.animations[player].push(
        new Anim(
          'Hand',
          'Discard',
          CardCodec.encode_card(card),
          index,
          this.pile[player].length - 1,
        ),
      )
    }
    return card
  }

  bottom(player: number, amt = 1, index = 0) {
    let card = null
    while (amt > 0 && this.hand[player].length > index) {
      card = this.hand[player].splice(index, 1)[0]
      this.deck[player].unshift(card)
      amt -= 1
    }
    return card
  }

  tutor(player: number, cost: number) {
    if (this.hand[player].length < HAND_CAP) {
      for (let i = this.deck[player].length - 1; i >= 0; i--) {
        const card = this.deck[player][i]
        if (card.cost === cost) {
          this.hand[player].push(card)
          this.deck[player].splice(i, 1)
          this.amt_drawn[player] += 1
          this.animations[player].push(
            new Anim(
              'Deck',
              'Hand',
              CardCodec.encode_card(card),
              this.hand[player].length - 1,
            ),
          )
          return card
        }
      }
    }
    return null
  }

  create(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
      this.hand[player].push(card)
      this.animations[player].push(
        new Anim(
          'Gone',
          'Hand',
          CardCodec.encode_card(card),
          this.hand[player].length - 1,
        ),
      )
      return card
    }
    return null
  }

  create_in_pile(player: number, card: any) {
    this.animations[player].push(
      new Anim(
        'Gone',
        'Discard',
        CardCodec.encode_card(card),
        this.pile[player].length,
      ),
    )
    this.pile[player].push(card)
  }

  create_in_story(player: number, card: any) {
    if (this.story.acts.length >= 12) {
      return
    }
    this.animations[player].push(
      new Anim(
        'Gone',
        'Story',
        CardCodec.encode_card(card),
        this.story.acts.length,
      ),
    )
    this.story.add_act(card, player, Source.PILE)
  }

  remove_act(index: number) {
    const act = this.story.remove_act(index)
    this.pile[act.owner].push(act.card)
    return act.card
  }

  oust(player: number) {
    let cost = 0
    while (this.hand[player].length > 0) {
      for (let i = 0; i < this.hand[player].length; i++) {
        if (this.hand[player][i].cost === cost) {
          const card = this.hand[player][i]
          this.animations[player].push(
            new Anim('Hand', 'Gone', CardCodec.encode_card(card), i),
          )
          this.expended[player].push(card)
          this.hand[player].splice(i, 1)
          return card
        }
      }
      cost += 1
    }
    return null
  }

  dig(player: number, amt: number) {
    for (let i = 0; i < amt; i++) {
      if (this.pile[player].length > 0) {
        const card = this.pile[player].pop()
        this.animations[player].push(
          new Anim('Discard', 'Gone', CardCodec.encode_card(card)),
        )
        this.expended[player].push(card)
      }
    }
  }

  mill(player: number) {
    if (this.deck[player].length > 0) {
      const card = this.deck[player].pop()
      this.pile[player].push(card)
      this.animations[player].push(
        new Anim('Deck', 'Discard', CardCodec.encode_card(card)),
      )
      return card
    }
    return null
  }

  shuffle(player: number, remember = true, take_pile = true) {
    if (remember) {
      this.last_shuffle[player] = this.pile[player]
    }
    if (take_pile) {
      this.deck[player] = this.pile[player].concat(this.deck[player])
      this.pile[player] = []
    }
    this.deck[player].sort(() => Math.random() - 0.5)
    if (this.deck[player].length > 0) {
      this.animations[player].push(new Anim('Shuffle'))
    }
  }

  create_card(player: number, card: any) {
    if (this.hand[player].length < HAND_CAP) {
      this.hand[player].push(card)
    }
  }

  get_highest_card_in_hand(player: number) {
    let result = null
    for (const card of this.hand[player]) {
      if (result === null || card.cost > result.cost) {
        result = card
      }
    }
    return result
  }

  switch_priority() {
    this.priority = (this.priority + 1) % 2
  }

  get_client_model(
    player: number,
    cards_playable = Array(6).fill(false),
    costs = Array(6).fill(null),
    is_recap = false,
  ) {
    const deck_sort = (card: any) => {
      const rand_from_name = (parseInt(card.name, 36) % 1000) / 1000
      return card.cost + rand_from_name
    }

    const slice_step = player === 0 ? 1 : -1
    const relative_recap = player === 0 ? this.recap : this.recap.get_flipped()

    return {
      hand: CardCodec.encode_deck(this.hand[player]),
      opp_hand: CardCodec.encode_deck(this.hand[player ^ 1]),
      deck: CardCodec.encode_deck(this.deck[player].sort(deck_sort)),
      opp_deck: this.deck[player ^ 1].length,
      pile: this.pile.slice().reverse().map(CardCodec.encode_deck),
      last_shuffle: CardCodec.encode_deck(
        this.last_shuffle[player ^ 1].sort(deck_sort),
      ),
      expended: this.expended.slice().reverse().map(CardCodec.encode_deck),
      wins: this.wins.slice().reverse(),
      max_mana: this.max_mana.slice().reverse(),
      mana: this.mana[player],
      status: CardCodec.encode_statuses(this.status[player]),
      opp_status: CardCodec.encode_statuses(this.status[player ^ 1]),
      story: this.get_relative_story(player, is_recap),
      priority: this.priority ^ player,
      passes: this.passes,
      recap: CardCodec.encode_recap(relative_recap, is_recap),
      mulligans_complete: this.mulligans_complete.slice().reverse(),
      version_number: this.version_no,
      cards_playable: cards_playable,
      vision: this.vision[player],
      winner: this.get_winner() === null ? null : this.get_winner() ^ player,
      score: this.score.slice().reverse(),
      sound_effect: this.sound_effect,
      animations: this.hide_opp_animations(this.animations.slice().reverse()),
      costs: costs,
      avatars: this.avatars.slice().reverse(),
      round_results: this.round_results.slice().reverse(),
    }
  }

  hide_opp_animations(animations: any[][]) {
    const opp_animations = animations[1]
    if (this.version_no <= 2) {
      return [animations[0], []]
    }
    const obfuscated = opp_animations.map((anim: any) => {
      if (anim.zone_to === 'Hand' && anim.zone_from !== 'Hand') {
        return new Anim(
          anim.zone_to,
          anim.zone_from,
          undefined,
          anim.index,
          anim.index2,
        )
      } else {
        return anim
      }
    })
    return [animations[0], obfuscated]
  }

  get_relative_story(player: number, total_vision: boolean) {
    const hide_opponents_cards = (live_card: [any, number]) => {
      const [card, owner] = live_card
      if (
        !total_vision &&
        owner !== player &&
        !card.qualities.includes(Quality.VISIBLE)
      ) {
        return [hidden_card, owner]
      } else {
        return live_card
      }
    }

    const switch_owners = (live_card: [any, number]) => {
      const [card, owner] = live_card
      return [card, owner ^ 1]
    }

    let result = this.story.acts.map((act: any) => [act.card, act.owner])
    const visible_result = result.slice(0, this.vision[player])
    const invisible_result = result
      .slice(this.vision[player])
      .map(hide_opponents_cards)
    result = visible_result.concat(invisible_result)

    if (player === 1) {
      result = result.map(switch_owners)
    }

    return CardCodec.encode_story(result)
  }

  get_winner() {
    if (this.wins[0] >= 5) {
      return 0
    }
    if (this.wins[1] >= 5) {
      return 1
    }
    return null
  }
}

export { ServerModel }
