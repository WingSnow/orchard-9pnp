import cardConfig from './cardConfig.json'

/**
 *  clusters 表示卡面上6个果丛，0表示红色，1表示蓝色，2表示黄色
 * 0 1
 * 2 3
 * 4 5
 */

interface Card {
  id: number
  clusters: number[]
}

const cards: Card[] = [...cardConfig]

export default cards
