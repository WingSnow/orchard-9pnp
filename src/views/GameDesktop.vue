<script setup lang="ts">
import { watch } from 'vue'
import { shuffle } from 'lodash'
import DeckArea from '../components/DeckArea.vue'
import HandArea from '../components/HandArea.vue'
import PileArea from '../components/PileArea.vue'
import ScoreBoard from '../components/ScoreBoard.vue'
import mainStore from '../stores/main'

const store = mainStore()

const genCardPile = () => {
  const arr = Array.from(new Array(18).keys())
  return shuffle(arr).slice(0, 9)
}

store.cardPile = genCardPile()

watch(
  () => store.status,
  (value) => {
    if (value === 4) {
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
      alert(`游戏结束。你获得成就 '${achivement}'`)
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
}
</style>
