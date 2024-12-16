import { Card } from '../../../shared/state/card'
import { Animation } from '../../../shared/state/animation'
import { Status, Quality } from '../Effects'
import { Source } from '../Story'
import { tokens } from './catalog/Tokens'
import {
  stars,
  dagger,
  nascence,
  impulse,
  dove,
  drown,
  dash,
  swift,
  birth,
  cosmos,
  ancestry,
  fruit,
  mercy,
  hurricane,
  aronist,
  mine,
  wing_clipping,
  veteran,
  uprising,
  shadow,
  cling,
  death,
  the_future,
  oak,
  nectar,
  prey,
  clear_view,
  night_vision,
  hungry_ghost,
  fishing_boat,
  hold_tight,
  pet,
  imprison,
  awakening,
  secretary_bird,
  ecology,
  enlightenment,
  excess,
  bounty,
  dawn,
  phoenix,
  generator,
  iceberg,
  rebirth,
  sun,
  boa,
  sickness,
  cradle,
  paramountcy,
  dew,
  parch,
  heron,
  conquer,
  nightmare,
  from_ashes,
  gentle_rain,
  sunflower,
  hollow,
  moon,
} from './catalog'
import random from 'random'

class Paramountcy extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    const space = 99 - (index + 1 + game.story.acts.length)
    for (let i = 0; i < Math.min(space, 5); i++) {
      if (game.pile[player].length > 0) {
        const card = game.pile[player].pop()
        game.story.add_act(card, player, Source.PILE, i)
        game.animations[player].push(
          new Animation('Discard', 'Story', { index2: i })
        )
      }
    }
  }
}
const paramountcy = new Paramountcy('Paramountcy', 9, 0, 62)

class Rat extends Card {
  play(player, game, index, bonus) {
    if (game.mana[player] >= 2) {
      game.mana[player] -= 2
      game.story.acts.forEach((act) => {
        if (act.owner === player) {
          bonus += 1
        }
      })
    }
    super.play(player, game, index, bonus)
    if (game.hand[player].length === 0) {
      this.draw(1, game, player)
    }
  }
}
const rat = new Rat('Rat', 0, 0, 2000)

class Beggar extends Card {
  play(player, game, index, bonus) {
    if (game.story.acts.length > 0) {
      const cost = game.story.acts[0].card.cost
      this.tutor(cost, game, player)
    }
    if (game.mana[player] >= 1) {
      game.mana[player] -= 1
      bonus += 1
    }
    super.play(player, game, index, bonus)
  }
}
const beggar = new Beggar('Beggar', 0, 0, 2001)

class FreshAir extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    game.mana[player] += 3
    if (game.story.acts.every((act) => act.owner !== player)) {
      this.draw(1, game, player)
    }
  }
}
const fresh_air = new FreshAir('FreshAir', 2, 1, 2002)

class Possibilities extends Card {
  play(player, game, index, bonus) {
    let double = false
    if (game.mana[player] >= 4) {
      game.mana[player] -= 4
      double = true
    }
    if (game.mana[player] >= 1) {
      game.mana[player] -= 1
      bonus += 1
    }
    if (game.mana[player] >= 2) {
      game.mana[player] -= 2
      bonus += 2
    }
    if (double) {
      bonus += bonus + this.points + game.score[player]
    }
    super.play(player, game, index, bonus)
  }
}
const possibilities = new Possibilities('Possibilities', 2, 2, 2003)

class Hatchling extends Card {
  constructor(points) {
    super('Hatchling', { dynamic_text: `0:${points}` }, 0, points, 2004)
  }

  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    if (game.mana[player] >= 2) {
      game.mana[player] -= 2
      for (let i = 0; i < 2; i++) {
        const card = dove
        game.story.add_act(card, player)
        const story_index = game.story.acts.length + index - 1
        game.animations[player].push(
          new Animation('Gone', 'Story', { index2: story_index })
        )
      }
    }
  }

  morning(player, game, index) {
    const new_card = new Hatchling(this.points + 1)
    game.pile[player].pop()
    super.create_in_pile(new_card, game, player)
    game.animations = [[], []]
    return true
  }
}
const hatchling = new Hatchling(0)

class Eyes extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.draw(1, game, player)
  }

  in_hand_on_play(player, game) {
    game.vision[player] += 1
    return true
  }
}
const eyes = new Eyes('Eyes', 1, 0, 2005)

class Capybara extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    if (game.mana[player] >= 1) {
      game.mana[player] -= 1
      this.draw(1, game, player)
    }
    if (game.mana[player] >= 4) {
      game.mana[player] -= 4
      this.reset(game)
    }
  }
}
const capybara = new Capybara('Capybara', 0, 0, 2006)

class Rekindle extends Card {
  play(player, game, index, bonus) {
    game.story.acts.forEach((act) => {
      if (act.owner === player) {
        bonus += 1
      }
    })
    super.play(player, game, index, bonus)
    let i = 0
    while (i < game.story.acts.length) {
      const act = game.story.acts[i]
      if (act.owner === player) {
        this.remove_act(i, game)
      } else {
        i += 1
      }
    }
  }

  on_play(player, game) {
    game.status[player].push(Status.UNLOCKED)
  }
}
const rekindle = new Rekindle('Rekindle', 3, 2, 2007)

class Tragedy extends Card {
  play(player, game, index, bonus) {
    if (game.story.acts.length === 0) {
      bonus += 2
    }
    super.play(player, game, index, bonus)
    for (let i = 0; i < game.story.acts.length; i++) {
      const act = game.story.acts[i]
      if (act.card.cost <= 2) {
        this.remove_act(i, game)
        return
      }
    }
  }
}
const tragedy = new Tragedy('Tragedy', 0, 1, 2008)

class Hound extends Card {
  get_cost(player, game) {
    if (game.story.acts.length > 0) {
      const card = game.story.acts[game.story.acts.length - 1].card
      for (const [yesterday_card] of game.recap.story) {
        if (yesterday_card.name === card.name) {
          return 1
        }
      }
    }
    return this.cost
  }
}
const hound = new Hound('Hound', 2, 2, 2009)

class Lullaby extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    game.story.acts.forEach((act) => {
      const card = act.card
      if (card.cost === 0) {
        this.create(card, game, player)
      }
    })
  }
}
const lullaby = new Lullaby('Lullaby', 6, 4, 2010)

class Longing extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    for (let i = game.pile[player].length - 1; i >= 0; i--) {
      const card = game.pile[player][i]
      if (card.cost % 2 === 0) {
        game.pile[player].splice(i, 1)
        game.deck[player].push(card)
        game.animations[player].push(new Animation('Discard', 'Deck', { card }))
      }
    }
    game.shuffle(player, false, false)
    if (game.mana[player] >= 4) {
      game.mana[player] -= 4
      this.nourish(5, game, player)
    }
  }
}
const longing = new Longing('Longing', 1, 0, 2011)

class Dwindle extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.inspire(2, game, player)
    if (game.mana[player] >= 3) {
      game.mana[player] -= 3
      this.reset(game)
    }
    if (game.mana[player] >= 2) {
      game.mana[player] -= 2
      this.draw(1, game, player)
    }
  }
}
const dwindle = new Dwindle('Dwindle', 2, 0, 2012)

class Cloud extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.inspire(game.hand[player].length)
    this.draw(1, game, player)
  }
}
const cloud = new Cloud('Cloud', 3, 0, 2013)

const hidden_card = new Card('Cardback', 0, 0, 1000)
const full_catalog = [
  stars,
  dagger,
  nascence,
  impulse,
  dove,
  drown,
  dash,
  swift,
  birth,
  cosmos,
  ancestry,
  fruit,
  mercy,
  hurricane,
  aronist,
  mine,
  wing_clipping,
  veteran,
  uprising,
  shadow,
  cling,
  death,
  the_future,
  oak,
  nectar,
  prey,
  clear_view,
  night_vision,
  hungry_ghost,
  fishing_boat,
  hold_tight,
  pet,
  imprison,
  awakening,
  secretary_bird,
  ecology,
  enlightenment,
  excess,
  bounty,
  dawn,
  phoenix,
  generator,
  iceberg,
  rebirth,
  sun,
  boa,
  sickness,
  cradle,
  paramountcy,
  dew,
  parch,
  heron,
  conquer,
  nightmare,
  from_ashes,
  gentle_rain,
  sunflower,
  hollow,
  moon,
  rat,
  beggar,
  fresh_air,
  possibilities,
  hatchling,
  eyes,
  capybara,
  rekindle,
  tragedy,
  hound,
  lullaby,
  longing,
  dwindle,
  cloud,
]
const non_collectibles = [hidden_card, ...tokens]
const all_cards = [...full_catalog, ...non_collectibles]

const common_cards = full_catalog.filter((card) => card.rarity === 0)
const uncommon_cards = full_catalog.filter((card) => card.rarity === 1)
const rare_cards = full_catalog.filter((card) => card.rarity === 2)
const legend_cards = full_catalog.filter((card) => card.rarity === 3)

function get_computer_deck(i = null) {
  const possible_decks = [
    [
      impulse,
      impulse,
      impulse,
      drown,
      drown,
      swift,
      swift,
      dash,
      mercy,
      fruit,
      aronist,
      aronist,
      veteran,
      veteran,
      death,
    ],
    [
      stars,
      stars,
      impulse,
      impulse,
      drown,
      drown,
      drown,
      aronist,
      aronist,
      aronist,
      aronist,
      veteran,
      cling,
      death,
      death,
    ],
    [
      stars,
      impulse,
      impulse,
      impulse,
      impulse,
      impulse,
      dash,
      dash,
      swift,
      swift,
      mercy,
      mercy,
      mine,
      mine,
      death,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      dove,
      dove,
      cosmos,
      swift,
      mercy,
      mercy,
      fruit,
      fruit,
      aronist,
      death,
      oak,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      drown,
      drown,
      cosmos,
      birth,
      mercy,
      fruit,
      shadow,
      uprising,
      cling,
      cling,
      oak,
    ],
    [
      nascence,
      nascence,
      dove,
      dove,
      impulse,
      birth,
      birth,
      birth,
      swift,
      dash,
      mercy,
      mercy,
      mercy,
      uprising,
      uprising,
    ],
    [
      nascence,
      nascence,
      nascence,
      dove,
      dove,
      dove,
      impulse,
      cosmos,
      swift,
      dash,
      ancestry,
      mercy,
      mercy,
      uprising,
      shadow,
    ],
    [
      stars,
      dove,
      impulse,
      impulse,
      impulse,
      impulse,
      birth,
      swift,
      swift,
      dash,
      dash,
      mercy,
      mercy,
      mercy,
      mine,
    ],
    [
      stars,
      stars,
      dove,
      dove,
      dove,
      swift,
      swift,
      fruit,
      fruit,
      wing_clipping,
      wing_clipping,
      wing_clipping,
      shadow,
      shadow,
      cling,
    ],
    [
      stars,
      stars,
      stars,
      dove,
      dove,
      dove,
      cosmos,
      fruit,
      fruit,
      wing_clipping,
      wing_clipping,
      wing_clipping,
      shadow,
      shadow,
      cling,
      oak,
    ],
    [
      dove,
      dove,
      dove,
      dove,
      dove,
      dove,
      dash,
      dash,
      mercy,
      mercy,
      mercy,
      aronist,
      aronist,
      oak,
      oak,
    ],
  ]

  if (i !== null) {
    if (i >= 0 && i < possible_decks.length) {
      return possible_decks[i]
    } else {
      console.error('Invalid AI deck index:', i)
    }
  }

  return random.choice(possible_decks)
}
