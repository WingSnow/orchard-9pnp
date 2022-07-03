import cardConfigData from './cardConfig.json'

/** 果树类型——0: 红（苹果）；1：蓝（梅子）；2：黄（梨）； */
type ClusterType = 0 | 1 | 2

/**
 *  clusters 表示卡面上6个果丛，0表示红色，1表示蓝色，2表示黄色
 * 0 1
 * 2 3
 * 4 5
 */
interface CardConfigData {
  id: number
  clusters: ClusterType[]
}

const transCardConfigToCard = (config: CardConfigData): Card => {
  const trees = config.clusters.map((cluster): TreeType => {
    switch (cluster) {
      case 0:
        return 'apple'
      case 1:
        return 'plum'
      case 2:
        return 'pear'
    }
  })
  return {
    index: config.id,
    trees,
  }
}

const cardConfigs: Card[] = []

cardConfigData.forEach(({ id, clusters }) => {
  cardConfigs.push(
    transCardConfigToCard({
      id,
      clusters: clusters as ClusterType[],
    })
  )
})

export default cardConfigs
