<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DeckArea from '../components/DeckArea.vue'
import HandArea from '../components/HandArea.vue'
import PileArea from '../components/PileArea.vue'
import ScoreBoard from '../components/ScoreBoard.vue'
import OCard from '../components/OCard.vue'
import RuleDoc from '../components/RuleDoc.vue'
import DropdownButtonMenu from '../components/common/DropdownButtonMenu.vue'
import mainStore from '../stores/main'

const store = mainStore()

const ruleDocDisplay = ref(false)

const onRuleDocClose = () => {
  ruleDocDisplay.value = false
}

const menu = [
  {
    text: '游戏规则',
    icon: 'help-outline',
    color: '#ffa940',
    onClick: () => {
      ruleDocDisplay.value = true
    },
  },
  {
    text: '重新开始',
    icon: 'reload-outline',
    color: '#d4380d',
    onClick: () => {
      store.startGame()
    },
  },
]

onMounted(() => {
  store.startGame()
})
</script>

<template>
  <div id="desktop">
    <deck-area id="deck-area" />
    <hand-area id="hand-area" />
    <pile-area id="pile-area" />
    <score-board id="score-borad" />

    <o-card
      id="transition-card"
      :card-index="store.drawingCard?.data.index"
    ></o-card>
    <rule-doc v-show="ruleDocDisplay" @close="onRuleDocClose" />
    <dropdown-button-menu id="extra-button" :text="'hover me!'" :menu="menu" />
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

  #score-borad {
    position: fixed;
    top: 1rem;
    right: 1rem;
  }
}

#extra-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 500;
}
</style>
