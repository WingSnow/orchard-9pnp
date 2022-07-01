import cardConfig from './cardConfig.json'

/** 果树类型——0: 红（苹果）；1：蓝（梅子）；2：黄（梨）； */
type ClusterType = 0 | 1 | 2

/**
 *  clusters 表示卡面上6个果丛，0表示红色，1表示蓝色，2表示黄色
 * 0 1
 * 2 3
 * 4 5
 */
interface Card {
  id: number
  clusters: ClusterType[]
}

const cards: Card[] = [...(cardConfig as Card[])]

export default cards
