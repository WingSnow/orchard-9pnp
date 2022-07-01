import { defineStore } from 'pinia'

const mainStore = defineStore('main', {
  state: () => {
    return {
      /** 游戏阶段——0：抽牌；1：选牌；2：放牌；3.出牌；4.结束 */
      status: 0,
      /**
       * 卡牌是否可拖动
       * @tofix 可以根据游戏阶段是否为放牌阶段判断
       */
      cardDraggable: false,
      /** 当前选中的牌的牌面序号 */
      draggableCardNum: 0,
      /** 总分数 */
      totalScore: 0,
      diffScore: 0,
      /** 牌组，值为牌面序号 */
      cardPile: [0],
      dragginCard: 0,
    }
  },
  actions: {
    /** 抽牌 */
    draw() {
      const card = this.cardPile.pop()
      console.log(`drawCard: ${card}, ${this.cardPile}`)
      if (card !== undefined) {
        this.dragginCard = card
        return card
      }
      return null
    },

    switchStatus(status: number, action?: string) {
      const oldStatus = this.status
      this.status = status
      console.log(`[${action || 'action'}]status ${oldStatus} -> ${status}`)
    },
  },
})

export default mainStore
