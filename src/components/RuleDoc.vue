<script setup lang="ts">
import { ref } from 'vue'

const display = ref(false)
</script>

<template>
  <div
    id="rule-doc"
    :style="{
      'pointer-events': display ? 'all' : 'none',
    }"
  >
    <button type="button" @click="display = !display">
      {{ display ? 'x' : '?' }}
    </button>
    <div v-show="display">
      <img src="/resource/rulebook.jpg" />
      <div class="mask" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#rule-doc {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 1000;
  overflow: auto;

  img {
    margin: 24px auto;
    max-width: 100vw;
  }

  .mask {
    background-color: rgba(0, 0, 0, 0.6);
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }

  button {
    pointer-events: all;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1;
    cursor: pointer;
    border: 1px solid rgba(0 0 0 / 60%);
    border-radius: 50%;
    font-size: larger;
    width: 3vw;
    height: 3vw;
  }
}
</style>
