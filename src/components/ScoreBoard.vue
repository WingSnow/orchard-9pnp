<script setup lang="ts">
import { computed } from 'vue'
import mainStore from '../stores/main'

const store = mainStore()

const diffScore = computed(() => {
  if (!store.diffScore) {
    return ''
  }
  let flag = ''
  if (store.diffScore > 0) {
    flag = '+'
  }
  return `${flag}${store.diffScore}`
})
</script>

<template>
  <div class="board" title="当前总分">
    {{ store.totalScore }}
  </div>
  <transition>
    <div v-show="diffScore && store.status === 2" id="diffScore">
      {{ diffScore }}
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.board {
  background-color: orange;
  border-radius: 50%;
  position: fixed;
  font-size: 1.5em;
  font-weight: bold;
  right: 1rem;
  top: 1rem;
  text-align: center;
  line-height: 5vw;
  width: 5vw;
  height: 5vw;
}

#diffScore {
  position: fixed;
  text-align: center;
  text-shadow: -1px 1px 0 #fff, 1px 1px 0 #fff, 1px -1px 0 #fff,
    -1px -1px 0 #fff;
  top: calc(1.5rem + 5vw);
  right: calc(1rem + (5vw - 3vw) / 2);
  font-size: 1.2em;
  line-height: 3vw;
  width: 3vw;
  height: 3vw;
}

.v-leave-active {
  transition: all 1s ease;
}

.v-leave-to {
  opacity: 0;
  transform: translateY(-5vw);
}
</style>
