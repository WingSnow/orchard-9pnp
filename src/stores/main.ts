import { defineStore } from 'pinia'
import drawCardAnimate from '../animates/drawCard'

const mainStore = defineStore('main', {
  state: () => {
    return {
      /** 游戏阶段——0：抽牌；1：选牌；2：放牌；3.出牌；4.结束 */
      status: '' as GameStatus,
      /** 总分数 */
      totalScore: 0,
      /** 估计变化分数 */
      transitionalScore: 0,
      /** 牌组，值为牌面序号 */
      cardPile: [] as Card[],
      /** 当前选中的牌 */
      pickedCard: null as Card | null,
      /** 正在抽的牌，用于显示抽牌动画 */
      drawingCard: null as Card | null,
      /** 手牌*/
      handCardLeft: null as Card | null,
      handCardRight: null as Card | null,
    }
  },
  actions: {
    /** 抽牌 */
    async draw(immediate = false) {
      let hand: Hand
      if (!this.handCardLeft) {
        hand = 'left'
      } else if (!this.handCardRight) {
        hand = 'right'
      } else {
        return null
      }
      const card = this.cardPile.pop()
      if (!card) {
        return null
      }
      console.log(
        `draw card ${card.index} to ${hand}, ${this.cardPile
          .map((card) => card.index)
          .toString()}`
      )
      if (!immediate) {
        this.drawingCard = card
        await drawCardAnimate(hand)
        this.drawingCard = null
      }
      if (hand === 'left') {
        this.handCardLeft = card
      } else {
        this.handCardRight = card
      }
      this.switchStatus('pick', 'drawCardFinish')
      return card
    },

    pick(hand: Hand) {
      if (this.status !== 'pick') {
        throw new Error(`uncorrect gameStatus. expect pick, get ${this.status}`)
      }
      this.pickedCard = hand === 'left' ? this.handCardLeft : this.handCardRight
      this.switchStatus('play', 'pickCard')
    },

    unpick() {
      if (this.status !== 'play') {
        throw new Error(`uncorrect gameStatus. expect play, get ${this.status}`)
      }
      this.pickedCard = null
      this.switchStatus('pick', 'unpick')
    },

    switchStatus(status: GameStatus, action?: string) {
      const oldStatus = this.status
      this.status = status
      console.log(`[${action ?? 'action'}]status ${oldStatus} -> ${status}`)
    },
  },
})

export default mainStore
