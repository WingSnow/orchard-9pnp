import cardsConfigs from '../../config/configLoader'

export const cardConstructor = (cardIndex: number) => {
  const card = cardsConfigs.find((item) => item.index === cardIndex)
  if (!card) {
    throw new RangeError(`invalid cardIndex : ${cardIndex}`)
  }
  return card
}
