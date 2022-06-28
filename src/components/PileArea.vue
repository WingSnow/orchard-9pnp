<script setup lang="ts">
import { computed } from 'vue'
import OCard from './OCard.vue'
import mainStore from '../stores/main'

const store = mainStore()

const cardAmount = computed(() => {
  return store.cardPile.length
})
</script>

<template>
  <div class="pile-container">
    <div class="text">{{ cardAmount }}</div>
    <o-card class="card" :card-num="3" :show-back="true"></o-card>
  </div>
</template>

<style lang="scss" scoped>
.pile-container {
  position: relative;
  background-color: rgb(0 0 255 / 0.6);
  width: 100%;
  height: 100%;
}

.text {
  position: absolute;
  color: white;
  right: 10%;
  line-height: 21vh;
}

.card {
  height: 21vh;
  width: 14vh;
  top: calc(50% - 10.5vh);
  margin: auto;
}
</style>
