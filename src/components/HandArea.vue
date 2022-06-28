<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import OCard from './OCard.vue'
import mainStore from '../stores/main'

const store = mainStore()

const picked = ref<number | null>(null)

const handCardNumber = ref<number[]>([])

const drawCard = () => {
  while (handCardNumber.value.length < 2) {
    const card = store.draw()
    if (card === null) {
      break
    }
    handCardNumber.value.push(card)
  }
  store.status = 1
}

const pickCard = (pickCardId: number) => {
  picked.value = pickCardId
  if (pickCardId !== null) {
    store.cardDraggable = true
    store.draggableCardNum = handCardNumber.value[pickCardId]
    store.status = 2
  }
}

const highlightCardId = computed(() => {
  if (!store.cardDraggable || picked.value === null) {
    return null
  }
  return picked.value
})

const unhighlightCardId = computed(() => {
  if (!store.cardDraggable || picked.value === null) {
    return null
  }
  return Math.abs(1 - picked.value)
})

watch(
  () => store.status,
  (value) => {
    if (value === 3) {
      const cardToPlay = handCardNumber.value.indexOf(store.draggableCardNum)
      if (cardToPlay < 0) {
        throw new Error(
          `play card ${store.draggableCardNum} not in hand ${handCardNumber.value}`
        )
      }
      handCardNumber.value.splice(cardToPlay, 1)
      if (handCardNumber.value.length === 0 && store.cardPile.length === 0) {
        store.status = 4
        return
      }
      store.status = 0
    } else if (value === 0) {
      drawCard()
    }
  }
)

onMounted(() => {
  drawCard()
})
</script>

<template>
  <div class="hand-container">
    <div class="hand">
      <template
        v-for="(item, index) in handCardNumber"
        :key="`handcard_${index}`"
      >
        <o-card
          class="card"
          :class="{
            highlight: highlightCardId === index,
            unhighlight: unhighlightCardId === index,
          }"
          :card-num="handCardNumber[index]"
          @click="pickCard(index)"
        ></o-card>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hand-container {
  background-color: rgb(0 255 0 / 0.6);
  width: 100%;
  height: 100%;

  .hand {
    position: relative;
    width: 80%;
    height: 100%;
    margin: auto;

    .card:nth-child(1) {
      left: 20%;
    }

    .card:nth-child(2) {
      right: 20%;
    }
  }

  .card {
    position: absolute;
    display: inline-block;
    height: 3 * 9vh;
    width: 3 * 6vh;
    top: calc(50% - 3 * 4.5vh);
    transform: rotateZ(90deg);
    opacity: 0.6;
  }

  .card:hover:not(.unhighlight) {
    opacity: 1;
  }
  .card.highlight {
    opacity: 1;
    top: calc(50% - 3.5 * 4.5vh);
    height: 3.5 * 9vh;
    width: 3.5 * 6vh;
  }
}
</style>
