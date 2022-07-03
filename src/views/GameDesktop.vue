<script setup lang="ts">
import { watch } from 'vue'
import { shuffle } from 'lodash'
import DeckArea from '../components/DeckArea.vue'
import HandArea from '../components/HandArea.vue'
import PileArea from '../components/PileArea.vue'
import ScoreBoard from '../components/ScoreBoard.vue'
import OCard from '../components/OCard.vue'
import mainStore from '../stores/main'
import { message } from '../components/common/popAlter/popAlter'
import RuleDoc from '../components/RuleDoc.vue'

const store = mainStore()

// 从18张卡牌中随机选择9张作为牌组
const genCardPile = () => {
  const arr = Array.from(new Array(18).keys())
  const shuffledArr = shuffle(arr).slice(0, 9)
  return shuffledArr.map((item) => {
    return
  })
}

store.cardPile = genCardPile()

// 监听状态，当游戏结束时，显示成就
watch(
  () => store.status,
  async (value) => {
    if (value === 4) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
      let achivement = '弱小树苗'
      const score = store.totalScore
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
    }
  }
)
</script>

<template>
  <div id="desktop">
    <deck-area id="deck-area" />
    <hand-area id="hand-area" />
    <pile-area id="pile-area" />
    <score-board />

    <o-card id="transition-card" :card-num="store.dragginCard"></o-card>
    <rule-doc />
  </div>
</template>

<style lang="scss" scoped>
#desktop {
  width: calc(100vw - 16px);
  height: calc(100vh - 16px);
  margin: auto;

  #deck-area {
    display: block;
    height: 75%;
    width: 100%;
  }

  #hand-area {
    display: inline-block;
    height: 25%;
    width: 75%;
  }

  #pile-area {
    display: inline-block;
    height: 25%;
    width: 25%;
  }

  #transition-card {
    position: fixed;
    height: 18vh;
    width: 12vh;
    z-index: 100;
    visibility: hidden;
  }
}
</style>
