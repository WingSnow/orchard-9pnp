import { defineStore } from 'pinia'

const mainStore = defineStore('main', {
  state: () => {
    return {
      // 0: 抽牌，1：选牌；2：放牌；3.出牌; 4.结束
      status: 0,
      cardDraggable: false,
      draggableCardNum: 0,
      totalScore: 0,
      cardPile: [0],
    }
  },
  actions: {
    draw() {
      const card = this.cardPile.pop()
      console.log(`drawCard: ${card}, ${this.cardPile}`)
      if (card !== undefined) {
        return card
      }
      return null
    },
  },
})

export default mainStore
