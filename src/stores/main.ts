import { defineStore } from 'pinia'
import drawCardAnimate from '../animates/drawCard'
import { message } from '../components/common/popAlter/popAlter'
import Card, { genCardPile } from './card'
import Deck from './deck'

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
      /** 手牌 */
      handCardLeft: null as Card | null,
      handCardRight: null as Card | null,
      /** 牌桌 */
      deck: Deck.getInstance(),
    }
  },
  actions: {
    /** 抽牌 */
    async _drawToHand(immediate = false) {
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
        `draw card ${card.data.index} to ${hand}, ${this.cardPile
          .map((card) => card.data.index)
          .toString()}`
      )
      if (!immediate) {
        this.drawingCard = card
        this._switchStatus('transition', 'drawStart')
        await drawCardAnimate(hand)
        this._switchStatus('transition', 'drawEnd')
        this.drawingCard = null
      }
      if (hand === 'left') {
        this.handCardLeft = card
      } else {
        this.handCardRight = card
      }
      return card
    },

    async draw(immediate?: boolean) {
      for (;;) {
        if (!(await this._drawToHand(immediate))) {
          break
        }
      }
      this._switchStatus('pick', 'drawFinish')
    },

    initPile() {
      this.cardPile.length = 0
      this.cardPile = genCardPile()
    },

    pick(hand: Hand) {
      if (this.status !== 'pick') {
        throw new Error(`uncorrect gameStatus. expect pick, get ${this.status}`)
      }
      this.pickedCard = hand === 'left' ? this.handCardLeft : this.handCardRight
      // 旋转可移动卡牌使其与手牌中的放置状态相同
      this.pickedCard?.rotate('right')
      this._switchStatus('play', 'pickCard')
    },

    unpick() {
      if (this.status !== 'play') {
        throw new Error(`uncorrect gameStatus. expect play, get ${this.status}`)
      }
      this.pickedCard = null
      this._switchStatus('pick', 'unpick')
    },

    placeCard() {
      const cardToPlace = this.pickedCard
      if (!cardToPlace) {
        return false
      }
      if (this.deck.placeCard(cardToPlace)) {
        // 放置成功后执行
        if (this.pickedCard === this.handCardLeft) {
          this.handCardLeft = null
        } else {
          this.handCardRight = null
        }
        this.pickedCard = null
        this.totalScore += this.transitionalScore
        if (this._endGameCheck()) {
          this._switchStatus('end', 'endGame')
        } else {
          this._switchStatus('draw', 'playCard')
        }
        return true
      }
      return false
    },

    startGame() {
      if (this.status === 'transition') {
        return
      }
      console.log('-- Game Start --')
      this.totalScore = 0
      this.initPile()
      this.pickedCard = null
      this.drawingCard = null
      this.handCardLeft = null
      this.handCardRight = null
      this.deck.init()
      // 放置初始卡牌
      const cardToPlace = this.cardPile.pop()!
      cardToPlace.position = 5358
      cardToPlace.rotate()
      this.deck.placeCard(cardToPlace, true)

      this._switchStatus('draw', 'init')
    },

    endGame() {
      let achivement = '弱小树苗'
      const score = this.totalScore
      if (score >= 25) {
        achivement = '遗忘之树'
      }
      if (score >= 30) {
        achivement = '满意之树'
      }
      if (score >= 35) {
        achivement = '卓越之树'
      }
      if (score >= 40) {
        achivement = '枝繁叶茂'
      }
      if (score >= 45) {
        achivement = '难以置信'
      }
      if (score >= 50) {
        achivement = '究极完美'
      }
      message({
        content: `游戏结束。你获得成就 '${achivement}'`,
        duration: 0,
        type: 'success',
      })
    },

    _switchStatus(status: GameStatus, action?: string) {
      const oldStatus = this.status
      this.status = status
      console.log(`[${action ?? 'action'}]status ${oldStatus} -> ${status}`)
      if (status === 'draw') {
        // 初始化游戏时，跳过动画立即抽牌
        void this.draw(action === 'init')
      }
      if (status === 'end') {
        this.endGame()
      }
    },

    _endGameCheck() {
      // 结束条件一：打完所有牌
      if (
        this.cardPile.length <= 0 &&
        !this.handCardLeft &&
        !this.handCardRight
      ) {
        return true
      }
      // TODO：结束条件二：无牌可出
      return false
    },
  },
})

export default mainStore
