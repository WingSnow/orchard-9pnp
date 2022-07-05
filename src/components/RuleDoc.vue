<script setup lang="ts">
import { ref } from 'vue'

const emits = defineEmits<(e: 'close') => void>()

const onClose = () => {
  emits('close')
}
</script>

<template>
  <div id="rule-doc">
    <button type="button" @click="onClose">x</button>
    <img src="/resource/rulebook.jpg" />
    <div class="mask" />
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
