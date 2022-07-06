import { defineStore } from 'pinia'
import drawCardAnimate from '../animates/drawCard'
import { message } from '../components/common/popAlter/popAlter'
import Card, { genCardPile } from './card'
import Deck, { deckSize } from './deck'

const mainStore = defineStore('main', {
  state: () => {
    return {
      /** 游戏阶段 */
      status: '' as GameStatus,
      /** 总分数 */
      totalScore: 0,
      /** 估计变化分数，在计分板显示 */
      transitionalScore: 0,
      /** 牌堆 */
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
    /** 抽牌直到有两张牌或牌堆为空 */
    async draw(immediate?: boolean) {
      this._statusCheck('draw')
      for (;;) {
        if (!(await this._drawToHand(immediate))) {
          break
        }
      }
      this._switchStatus('pick', 'drawFinish')
    },

    /** 选择一张手牌，设置可移动卡牌 */
    pick(hand: Hand) {
      this._statusCheck('pick')
      this.pickedCard = hand === 'left' ? this.handCardLeft : this.handCardRight
      // 旋转可移动卡牌使其与手牌中的放置状态相同
      this.pickedCard?.rotate('right')
      this._switchStatus('play', 'pickCard')
    },

    /** 取消选择手牌 */
    unpick() {
      this._statusCheck('play')
      this.pickedCard = null
      this._switchStatus('pick', 'unpick')
    },

    /**
     * 将可移动卡牌放入果园
     * @return 是否成功放置
     */
    placeCard() {
      this._statusCheck('play')
      const cardToPlace = this.pickedCard
      if (!cardToPlace) {
        return false
      }
      if (this.deck.placeCard(cardToPlace)) {
        // 放置成功后执行
        // 将选中的牌从手牌移除
        if (this.pickedCard === this.handCardLeft) {
          this.handCardLeft = null
        } else {
          this.handCardRight = null
        }
        this.pickedCard = null
        // 设置总分数
        this.totalScore += this.transitionalScore
        // 检查是结束游戏还是开始新的回合
        if (this._endGameCheck()) {
          this._switchStatus('end', 'endGame')
        } else {
          this._switchStatus('draw', 'playCard')
        }
        return true
      }
      return false
    },

    /** 开始或重新开始游戏 */
    startGame() {
      if (this.status === 'transition') {
        return
      }

      console.log('-- Game Start --')
      this.totalScore = 0
      this._initPile()
      this.pickedCard = null
      this.drawingCard = null
      this.handCardLeft = null
      this.handCardRight = null
      this.deck.init()

      // 放置初始卡牌，5358
      const cardToPlace = this.cardPile.pop()!
      cardToPlace.position = (deckSize / 2) * deckSize + deckSize / 2
      cardToPlace.rotate()
      this.deck.placeCard(cardToPlace, true)

      this._switchStatus('draw', 'init')
    },

    /** 结束游戏，显示成就 */
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

    /** 切换阶段 */
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

    /**
     * 检查当前阶段是否符合预期
     * @param expect 预期的阶段
     * @return 如果不符合预期，会抛出异常
     */
    _statusCheck(expect: GameStatus) {
      if (this.status !== expect) {
        throw new Error(
          `uncorrect gameStatus. expect ${expect} get ${this.status}`
        )
      }
      return true
    },

    /**
     * 检查是否应该结束游戏
     *
     * 有两种应该结束游戏的情况：
     * 1. 打完所有牌（包括牌堆里的牌以及手牌）
     * 2. 无法合法地放置卡牌（未实现）
     * @returns 是否应该结束游戏
     */
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

    /**
     * 抽一张牌
     * @param immediate 是否跳过抽牌动画
     * @return 抽的牌，如果因为牌组为空或手牌已满没有抽牌，则不返回
     */
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
        `draw card ${card.data.index} to ${hand}, pile: [${this.cardPile
          .map((card) => card.data.index)
          .toString()}]`
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

    /** 生成牌堆 */
    _initPile() {
      this.cardPile.length = 0
      this.cardPile = genCardPile()
    },
  },
})

export default mainStore
