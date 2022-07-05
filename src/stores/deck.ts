import Card from './card'
import { message } from '../components/common/popAlter/popAlter'
import { reactive, ref, type Ref } from 'vue'

/** 计算结果地块类型 —— never表示在坏果上重叠，为不合法放置 */
type CalcResultUnitType = UnitType | 'never'

export interface Unit {
  position: number
  type: UnitType
  /** 分数 */
  score: number
}

export type CalcResultUnit = Omit<Unit, 'type'> & {
  type: CalcResultUnitType
  diffScore: number
}

/** 牌桌的大小，牌组有多少个单元格 */
export const deckSize = 100

export default class Deck {
  units: Map<number, Unit>
  cardsInDeck: Ref<Card[]>
  deckSize: number

  private static instance: Deck | null

  private constructor(deckSize: number) {
    this.units = reactive<Map<number, Unit>>(new Map())
    this.cardsInDeck = ref([])
    this.deckSize = deckSize
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Deck(deckSize)
    }
    return this.instance
  }

  init = () => {
    this.units.clear()
    this.cardsInDeck.value.length = 0
  }

  /**
   * 计算放一张牌产生的结果
   * @param placedCard 要放的牌
   * @returns 一个代表影响结果的CalcResultUnit数组
   */
  calcDeckByPlaceCard = (placedCard: Card) => {
    const result: CalcResultUnit[] = []
    const { position, direction, trees } = placedCard
    const positionOnDeck: number[] = []
    if (direction === 'top' || direction === 'down') {
      for (let i = 0; i < 6; ++i) {
        const row = Math.floor(i / 2)
        const column = i % 2
        positionOnDeck.push(position + this.deckSize * row + column)
      }
    } else {
      for (let i = 0; i < 6; ++i) {
        const row = Math.floor(i / 3)
        const column = i % 3
        positionOnDeck.push(position + this.deckSize * row + column)
      }
    }
    trees.forEach((value, index) => {
      let type: CalcResultUnitType = 'never'
      let score = 0
      let diffScore = 0
      const deckItem = this.units.get(positionOnDeck[index])
      if (!deckItem) {
        // 如果没有和已有的果树重叠
        type = value
        score = 0
        diffScore = 0
      } else {
        score = 0
        if (deckItem.type === value) {
          // 与相同类型的果树重叠
          type = value
          if (deckItem.score === 1) {
            // 如果下面的树上已有1点，则变成3点
            score = 3
            diffScore = 2
          } else if (deckItem.score === 3) {
            // 如果下面的树上已有3点，则变成6点
            score = 6
            diffScore = 3
          } else if (deckItem.score === 6) {
            // 如果下面的树上已有6点，则不变
            score = 6
            diffScore = 0
          } else {
            // 如果下面的树上没有点数，则设置1点
            score = 1
            diffScore = 1
          }
        } else if (deckItem.type === 'rot') {
          // 一棵水果腐烂的树不能被另一棵树重叠
          type = 'never'
          score = 0
        } else {
          // 与不同类型的果树重叠，产生腐烂水果
          type = 'rot'
          score = -3
          diffScore = -3 - deckItem.score
        }
      }
      result.push({
        position: positionOnDeck[index],
        type,
        score,
        diffScore,
      })
    })
    return result
  }

  /** 检查是否可以放置 */
  placableCheck = (calcResult: CalcResultUnit[]) => {
    // 一棵水果腐烂的树不能被另一棵树重叠
    const placeOnRot = calcResult.find((item) => {
      return item.type === 'never'
    })
    if (placeOnRot) {
      message({
        content: '一棵水果腐烂的树不能被另一棵树重叠',
        type: 'error',
        duration: 3,
      })
      return false
    }
    const currentRot = Array.from(this.units.values()).filter(
      (item) => item.type === 'rot'
    ).length
    // 每局两次，你可以打出一张牌，让重叠的树的果实不与下面树的果实相匹配。
    const rotCount = calcResult.reduce((total, item) => {
      return total + (item.type === 'rot' ? 1 : 0)
    }, 0)
    if (rotCount + currentRot > 2) {
      message({
        content:
          '每局你最多只能产生两个坏果（让重叠的树的果实不与下面树的果实相匹配）',
        type: 'error',
        duration: 3,
      })
      return false
    }
    // 卡片上必须至少有一棵树与果园中已有的一棵树重叠。
    const placeOnTree = calcResult.find((item) => {
      return item.score >= 1
    })
    if (!placeOnTree) {
      message({
        content: '卡片上必须至少有一棵树与果园中已有的一棵树重叠',
        type: 'error',
        duration: 3,
      })
      return false
    }
    return true
  }

  /**
   * （尝试）放置卡牌
   * @param placedCard 要放置的卡
   * @param force 是否强制放置（跳过检查），用于放置初始卡牌
   * @returns 是否成功放置
   */
  placeCard = (placedCard: Card, force = false) => {
    const calcResult = this.calcDeckByPlaceCard(placedCard)
    if (force || this.placableCheck(calcResult)) {
      this.cardsInDeck.value.push(placedCard)
      calcResult.forEach(({ position, type, score }) => {
        this.units.set(position, {
          position,
          type: type as UnitType,
          score,
        })
      })
      console.log(
        `play card ${placedCard.data.index} with direction ${placedCard.direction} at postion ${placedCard.position}`
      )
      return true
    }
    return false
  }
}
