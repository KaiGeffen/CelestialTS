import GameModel from './gameModel'

class ClientGameModel extends GameModel {}

export default function getClientGameModel(
  orig: GameModel,
  player: number,
): ClientGameModel {
  // Get the costs before copying this as json
  const cardCosts = orig.hand[player].map((card) => card.getCost(player, orig))

  // Create a new copy of the model
  const model = JSON.parse(JSON.stringify(orig))

  // Reverse the attributes
  if (player === 1) {
    reverseAttributes(model)
  }

  // Set cost information
  model.cardCosts = cardCosts

  // Hide information player shouldn't have
  // TODO

  return model
}

// Reverse the attributes of the given game model

function reverseAttributes(model): void {
  // Reverse the order of these lists
  const listAttributes = [
    'hand',
    'deck',
    'pile',
    'expended',
    'breath',
    'maxBreath',
    'status',
    'vision',
    'score',
    'roundResults',
    'mulligansComplete',
    'animations',
    'last_shuffle',
    'wins',
    'amtPasses',
    'amtDrawn',
    'avatars',
  ]

  for (const attr of listAttributes) {
    model[attr].reverse()
  }

  // Flip these attributes
  const flipAttributes = ['winner', 'priority', 'lastPlayerWhoPlayed']

  for (const attr of flipAttributes) {
    model[attr] = model[attr] === 1 ? 0 : 1
  }

  // NOT CHANGED 'versionNo', 'sound', passes,

  // TODO
  // 'story', ,'recap'
}

function setClientSideInformation(model: GameModel): void {
  // Set costs of cards
  for (let i = 0; i < model.hand[0].length; i++) {
    model.cardCosts[i] = model.hand[0][i].getCost(0, model)
  }
}
