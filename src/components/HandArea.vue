<script setup lang="ts">
import { computed } from 'vue'
import { isNil } from 'lodash'
import OCard from './OCard.vue'
import mainStore from '../stores/main'

const store = mainStore()

/** 手牌，值为CardIndex  */
const handCardLeft = computed(() => {
  return store.handCardLeft?.data.index
})
const handCardRight = computed(() => {
  return store.handCardRight?.data.index
})

/** 被选中的卡牌的序号（左边-0；右边-1） */
const pickedCardSeq = computed(() => {
  if (!store.pickedCard) {
    return null
  }
  if (store.pickedCard.id === store.handCardLeft?.id) {
    return 0
  }
  if (store.pickedCard.id === store.handCardRight?.id) {
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
 * 选一张牌
 * @param hand 选择的牌在左边还是右边
 */
const pickCard = (hand: Hand) => {
  store.pick(hand)
}
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
          pickable: store.status === 'pick',
        }"
        :card-index="handCardLeft"
        @click.stop="pickCard('left')"
      ></o-card>
      <o-card
        v-show="!isNil(handCardRight)"
        class="card"
        :class="{
          highlight: highlightCardId === 1,
          unhighlight: unhighlightCardId === 1,
          pickable: store.status === 'pick',
        }"
        :card-index="handCardRight"
        @click.stop="pickCard('right')"
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
