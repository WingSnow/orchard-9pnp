<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isNil } from 'lodash'

defineProps<{
  cardIndex?: number | null
  showBack?: boolean
}>()

const importImgs = import.meta.globEager('../assets/cardFace/*.jpg')

const images = ref<Map<number, string>>(new Map())

onMounted(() => {
  Object.entries(importImgs).forEach((item) => {
    const match = item[0].match(/[^/]+(?=.jpg)/)
    images.value.set(Number(match![0]), item[1].default as string)
  })
})
</script>

<template>
  <div class="card-container">
    <div class="card" :class="{ showBack: showBack }">
      <div class="front">
        <img v-if="!isNil(cardIndex)" :src="images.get(cardIndex)" />
      </div>
      <div class="back">
        <img src="/resource/cardBack.jpg" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  height: 150px;
  width: 100px;
  border-radius: 10%;
  transform-style: preserve-3d;
}

.card {
  height: 100%;
  width: 100%;
  position: relative;
  transform-style: preserve-3d;

  .front,
  .back {
    height: 100%;
    width: 100%;
    position: absolute;
    border: 1px solid rgb(0 0 0);
    border-radius: 10%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .front {
    background-color: white;

    backface-visibility: hidden;
  }

  .back {
    transform: rotateY(180deg);
    backface-visibility: hidden;
  }

  &.showBack {
    .front {
      background-color: white;
      transform: rotateY(180deg);
    }

    .back {
      transform: rotateY(0deg);
    }
  }
}
</style>
