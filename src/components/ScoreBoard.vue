<script setup lang="ts">
import mainStore from '../stores/main'

const store = mainStore()
</script>

<template>
  <div class="scroe-board">
    {{ store.totalScore }}
  </div>
</template>

<style lang="scss" scoped>
.scroe-board {
  position: fixed;
  right: 0;
  top: 0;
  text-align: center;
  line-height: 5vw;
  width: 5vw;
  height: 5vw;
}

.card {
  height: 21vh;
  width: 14vh;
  top: calc(50% - 10.5vh);
  margin: auto;
}
</style>
