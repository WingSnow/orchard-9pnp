<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Props {
  content: string
  duration: number
  type: 'info' | 'warning' | 'error' | 'success'
  remove: () => void
}

const props = defineProps<Props>()

const display = ref(false)

const fade = () => {
  display.value = false
  setTimeout(() => {
    props.remove()
  }, 1000)
}

onMounted(() => {
  display.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      fade()
    }, props.duration * 1000)
  }
})
</script>

<template>
  <div @click="fade">
    <Transition name="fade-up">
      <div v-show="display" class="pop-alter" :class="type">
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
#o-message-container {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: #000000d9;
  position: fixed;
  font-size: 1rem;
  top: 0.5rem;
  left: 0;
  z-index: 1010;
  width: 100%;
  text-align: center;

  .pop-alter {
    border: 1px solid black;
    display: inline-block;
    padding: 0.5rem 1rem;
    margin: 0.25rem auto;
    box-shadow: 1px 1px 2px rgba(0 0 0 / 20%);
    background-color: white;

    &.info {
      background-color: #e6f7ff;
      border-color: #91d5ff;
    }

    &.warning {
      background-color: #fffbe6;
      border-color: #ffe58f;
    }

    &.error {
      background-color: #fff2f0;
      border-color: #ffccc7;
    }

    &.success {
      background-color: #f6ffed;
      border-color: #b7eb8f;
    }
  }
}

.fade-up-enter-active {
  transition: all 0.4s ease;
}

.fade-up-leave-active {
  transition: all 0.6s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-0.75rem);
}
</style>
