<script setup lang="ts">
import { computed } from 'vue'
import mainStore from '../stores/main'

const store = mainStore()

const diffScore = computed(() => {
  if (!store.transitionalScore) {
    return ''
  }
  let flag = ''
  if (store.transitionalScore > 0) {
    flag = '+'
  }
  return `${flag}${store.transitionalScore}`
})
</script>

<template>
  <div>
    <div class="board" title="当前总分">
      {{ store.totalScore }}
    </div>
    <transition>
      <div v-show="diffScore && store.status === 'play'" id="diffScore">
        {{ diffScore }}
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
$size: 4rem;

.board {
  background-color: orange;
  border-radius: 50%;
  font-size: larger;
  font-weight: bold;
  text-align: center;
  line-height: $size;
  width: $size;
  height: $size;
}

#diffScore {
  position: fixed;
  text-align: center;
  text-shadow: -1px 1px 0 #fff, 1px 1px 0 #fff, 1px -1px 0 #fff,
    -1px -1px 0 #fff;
  top: calc(1.5rem + $size);
  right: calc(1rem + $size / 4);
  width: calc($size / 2);
  height: calc($size / 2);
}

.v-leave-active {
  transition: all 1s ease;
}

.v-leave-to {
  opacity: 0;
  transform: translateY(-5vw);
}
</style>
