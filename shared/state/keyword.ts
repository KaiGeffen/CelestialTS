export class Keyword {
  constructor(
    public key: string,
    public text: string,
    public hasX: Boolean,
  ) {}

  static visible = new Keyword(
    'Visible',
    "[img=kw-Visible] - Both players can see this card while it's in the story.",
    false,
  )
  static fleeting = new Keyword(
    'Fleeting',
    '[img=kw-Fleeting] - After resolving, this card is removed from the game.',
    false,
  )
  static morning = new Keyword(
    'Morning',
    '[img=kw-Morning] - At the start of each round, if this is the top card of your discard pile, trigger the following effect.',
    false,
  )
  static sight = new Keyword(
    'Sight',
    '[img=kw-Sight X] - The first X cards in the story are visible to you this round.',
    true,
  )
  static inspire = new Keyword(
    'Inspire',
    '[img=kw-Inspire X] - Next round you have X extra breath.',
    true,
  )
  static inspired = new Keyword(
    'Inspired',
    '[img=kw-Inspire X] - This round you have X extra breath.',
    true,
  )
  static nourish = new Keyword(
    'Nourish',
    '[img=kw-Nourish X] - The next card you resolve is worth +X points.',
    true,
  )
  static birth = new Keyword(
    'Birth',
    '[img=kw-Birth X] - If you have a Child in hand, increase its points by X. Otherwise create a 0:X [img=kw-Fleeting] Child in hand.',
    true,
  )
}

export function getKeyword(value): Keyword {
  return [
    Keyword.visible,
    Keyword.fleeting,
    Keyword.morning,
    Keyword.sight,
    Keyword.inspire,
    Keyword.inspired,
    Keyword.nourish,
    Keyword.birth,
  ].find((keyword) => keyword.key === value)
}
