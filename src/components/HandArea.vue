<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { isNil } from 'lodash'
import OCard from './OCard.vue'
import mainStore from '../stores/main'
import drawCardAnimate from '../animates/drawCard'

const store = mainStore()

/** 手牌，值为CardIndex  */
const handCardLeft = computed(() => {
  return store.handCardLeft?.index
})
const handCardRight = computed(() => {
  return store.handCardRight?.index
})

/** 被选中的卡牌的序号（左边-0；右边-1） */
const pickedCardSeq = computed(() => {
  if (!store.pickedCard) {
    return null
  }
  if (store.pickedCard.index === store.handCardLeft?.index) {
    return 0
  }
  if (store.pickedCard.index === store.handCardRight?.index) {
    return 1
  }
  return null
})

/**
 * 计算要高亮的牌，即放牌阶段被选中的手牌
 * @return 要高亮的牌的序号
 */
const highlightCardId = computed(() => {
  if (store.status !== 'play' || isNil(pickedCardSeq.value)) {
    return null
  }
  return pickedCardSeq.value
})

/**
 * 计算要弱化显示的牌，即放牌阶段未被选中的手牌
 * @return 要弱化显示的牌的序号
 */
const unhighlightCardId = computed(() => {
  if (store.status !== 'play' || isNil(pickedCardSeq.value)) {
    return null
  }
  return Math.abs(1 - pickedCardSeq.value)
})

/**
 * 选一张牌，进入放牌阶段
 * @param hand 选择的牌在左边还是右边
 */
const pickCard = (hand: Hand) => {
  store.pick(hand)
}

// 监听状态
// 进入抽牌阶段（0）时，抽牌
// 进入出牌阶段（3）时，出牌（从手牌数组中移除该牌），然后如果牌组和手牌均为空，则游戏结束
watch(
  () => store.status,
  async (value) => {
    if (value === 3) {
      const cardToPlay = picked.value === 0 ? handCardLeft : handCardRight
      cardToPlay.value = null
      if (
        isNil(handCardLeft.value) &&
        isNil(handCardRight.value) &&
        store.cardPile.length === 0
      ) {
        store.switchStatus(4, 'gameFinish')
        return
      }
      store.switchStatus(0, 'placeCard Finish')
    } else if (value === 0) {
      await drawCard()
    }
  }
)

onMounted(() => {
  // 游戏开始时，抽取初始手牌
  drawCard(true)
})
</script>

<template>
  <div class="hand-container">
    <div class="hand">
      <o-card
        v-show="!isNil(handCardLeft)"
        class="card"
        :class="{
          highlight: highlightCardId === 0,
          unhighlight: unhighlightCardId === 0,
          pickable: store.status === 1,
        }"
        :card-num="handCardLeft"
        @click="pickCard(0)"
      ></o-card>
      <o-card
        v-show="!isNil(handCardRight)"
        class="card"
        :class="{
          highlight: highlightCardId === 1,
          unhighlight: unhighlightCardId === 1,
          pickable: store.status === 1,
        }"
        :card-num="handCardRight"
        @click="pickCard(1)"
      ></o-card>

      <o-card
        id="hand-slot-1"
        class="cardslot"
        :card-num="0"
        :show-back="true"
      ></o-card>
      <o-card
        id="hand-slot-2"
        class="cardslot"
        :card-num="0"
        :show-back="true"
      ></o-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hand-container {
  background-color: rgb(170, 207, 33);
  width: 100%;
  height: 100%;

  .hand {
    position: relative;
    width: 80%;
    height: 100%;
    margin: auto;
  }

  .card,
  .cardslot {
    position: absolute;
    display: inline-block;
    height: 3 * 9vh;
    width: 3 * 6vh;
    top: calc(50% - 3 * 4.5vh);
    transform: rotateZ(90deg);

    &:nth-child(odd) {
      left: 20%;
    }

    &:nth-child(even) {
      right: 20%;
    }
  }

  .card {
    z-index: 10;

    &::after {
      position: absolute;
      transition: all 10s;
      top: 0;
      left: 0;
      content: '';
      background-color: rgb(255 255 255);
      border-radius: 10%;
      opacity: 0.4;
      z-index: 20;
      width: 100%;
      height: 100%;
      transition: all 0.5s;
    }

    &.pickable {
      $shadowSize: 5px;
      $shadowBlur: 3px;
      $shadowColor: #7fff00;
      box-shadow: $shadowSize $shadowSize $shadowBlur $shadowColor,
        $shadowSize (-$shadowSize) $shadowBlur $shadowColor,
        (-$shadowSize) $shadowSize $shadowBlur $shadowColor,
        (-$shadowSize) (-$shadowSize) $shadowBlur $shadowColor;
      cursor: pointer;

      &::after {
        opacity: 0;
      }
    }
  }

  .cardslot {
    z-index: 5;
  }

  .card:hover:not(.unhighlight) {
    top: calc(50% - 3.5 * 4.5vh);

    &::after {
      opacity: 0;
    }
  }
  .card.highlight {
    top: calc(50% - 3.5 * 4.5vh);

    &::after {
      opacity: 0;
    }
  }
}
</style>
