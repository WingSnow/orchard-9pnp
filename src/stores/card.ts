import cardsConfigs from '../config/configLoader'
import { shuffle } from 'lodash'

/**
 * 根据卡面序号生成卡牌对象
 * @param cardIndex 卡面序号，范围为[0 - 17]
 * @returns 卡牌对象
 */
const cardConstructor = (cardIndex: number) => {
  const card = cardsConfigs.find((item) => item.index === cardIndex)
  if (!card) {
    throw new RangeError(`invalid cardIndex. expect [0-17], get ${cardIndex}`)
  }
  return new Card(card)
}

/** 从18张卡牌中随机选择9张作为牌组  */
export const genCardPile = () => {
  const arr = Array.from(new Array(18).keys())
  const shuffledArr = shuffle(arr).slice(0, 9)
  return shuffledArr.map((item) => {
    return cardConstructor(item)
  })
}

const _transfromDirectionToNumber = (direction: Direction) => {
  switch (direction) {
    case 'top':
      return 0
    case 'right':
      return 1
    case 'down':
      return 2
    case 'left':
      return 3
  }
}

const _transformNumberToDirection = (cardNumber: number): Direction => {
  switch (cardNumber) {
    case 0:
      return 'top'
    case 1:
      return 'right'
    case 2:
      return 'down'
    case 3:
      return 'left'
    default: {
      throw new Error(
        `uncorrect cardNumber, expect 0 | 1 | 2 | 3, get ${cardNumber}`
      )
    }
  }
}

/**
 * 根据卡牌的方向，将卡面的果树顺序转换成卡牌的果树顺序
 *
 * 卡牌向上（旋转0°）时，卡牌矩阵为
 * [0 1]
 * [2 3]
 * [4 5]
 *
 * 卡牌向右（旋转90°）时，卡牌矩阵为
 * [4 2 0]
 * [5 3 1]
 *
 * 卡牌向下（旋转180°）时，卡牌矩阵为
 * [5 4]
 * [3 2]
 * [1 0]
 *
 * 卡牌向左（旋转270°）时，卡牌矩阵为
 * [1 3 5]
 * [0 2 4]
 * @param ori 卡面果树数组
 * @param direction 卡的方向
 * @returns 根据方向旋转后新的果树数组
 */
const _rotateTrees = (ori: TreeType[], direction: Direction) => {
  const rotated: TreeType[] = []
  if (direction === 'top') {
    rotated.push(...ori)
  } else if (direction === 'right') {
    rotated.push(ori[4])
    rotated.push(ori[2])
    rotated.push(ori[0])
    rotated.push(ori[5])
    rotated.push(ori[3])
    rotated.push(ori[1])
  } else if (direction === 'down') {
    rotated.push(ori[5])
    rotated.push(ori[4])
    rotated.push(ori[3])
    rotated.push(ori[2])
    rotated.push(ori[1])
    rotated.push(ori[0])
  } else {
    rotated.push(ori[1])
    rotated.push(ori[3])
    rotated.push(ori[5])
    rotated.push(ori[0])
    rotated.push(ori[2])
    rotated.push(ori[4])
  }
  return rotated
}

export default class Card {
  id: number
  /** 卡面 */
  data: CardData
  /** 牌的朝向——top：未旋转；right：顺时针旋转90°；down：旋转180°；left：顺时针旋转270° */
  direction: Direction
  /**
   * 位置的id，牌的左上角所在的单元格的id
   *
   * 牌桌单元格的id从左上角开始逐行计数，第一格为0
   */
  position: number

  /**
   * 卡上果树的类型，和data.trees的区别是前者为旋转后的值
   *
   * 序号为从左向右逐行递增
   */
  trees: TreeType[]

  private static cardHolder: Map<number, Card> = new Map()

  private static uniqueID = 0

  constructor(data: CardData, direction?: Direction, position?: number) {
    this.id = Card.uniqueID
    this.data = data
    this.direction = direction ?? 'top'
    this.position = position ?? 0
    this.trees = [...data.trees]
    Card.cardHolder.set(Card.uniqueID, this)
    Card.uniqueID += 1
  }

  static getCardById = (id: number) => {
    const card = Card.cardHolder.get(id)
    if (!card) {
      throw new RangeError(`card with id ${id} not found`)
    }
    return card
  }

  rotate(TargetDirection?: Direction) {
    if (TargetDirection) {
      this.direction = TargetDirection
    } else {
      let directionNum = _transfromDirectionToNumber(this.direction)
      directionNum += 1
      directionNum %= 4
      this.direction = _transformNumberToDirection(directionNum)
    }

    this.trees = _rotateTrees(this.data.trees, this.direction)
    return this.direction
  }
}
