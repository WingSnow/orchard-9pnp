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
  <div class="pile-container" :title="`剩余 ${cardAmount} 张卡牌`">
    <div class="pile">
      <template
        v-for="(item, index) in store.cardPile"
        :key="`cardBack_${index}`"
      >
        <o-card class="card" :card-num="item" :show-back="true"></o-card>
      </template>
      <div id="pile-slot"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pile-container {
  position: relative;
  background-color: goldenrod;
  width: 100%;
  height: 100%;
}

.text {
  position: absolute;
  text-align: right;
  color: white;
  font-size: 1.5em;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

.pile {
  $cardHeight: 18vh;
  $cardWidth: 12vh;
  display: flex;
  justify-content: center;

  .card,
  #pile-slot {
    position: absolute;
    height: $cardHeight;
    width: $cardWidth;
    margin-top: 2vh;
  }

  @for $i from 1 to 9 {
    .card:nth-child(#{$i}) {
      transform: translate(#{$i * 1.5}px, #{$i * 1.5}px);
      z-index: 100 - $i;
    }
  }
}
</style>
