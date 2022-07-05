<script setup lang="ts">
import _ from 'lodash'
import { computed } from 'vue'
import DiceBox from './common/DiceBox.vue'

type TokenType = UnitType

interface Props {
  type: TokenType
  point?: number
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  point: 0,
  size: '16px',
})

const diceColor = computed(() => {
  if (props.type === 'apple') {
    return 'rgb(236 68 31)'
  }
  if (props.type === 'plum') {
    return 'rgb(64 40 138)'
  }
  if (props.type === 'pear') {
    return 'rgb(232 204 35)'
  }
  return 'rgb(0 0 0)'
})

const itemColor = computed(() => {
  if (props.type === 'pear') {
    return 'rgb(0 0 0)'
  }
  return 'rgb(255 255 255)'
})

type DicePoint = 1 | 2 | 3 | 4 | 5 | 6

const isDicePoint = (point: number): point is DicePoint => {
  return _.isInteger(point) && point > 0 && point <= 6
}

const dicePoint = computed<DicePoint>(() => {
  if (isDicePoint(props.point)) {
    return props.point
  }
  return 1
})
</script>

<template>
  <dice-box
    v-if="point > 0"
    :dice-color="diceColor"
    :dice-size="size"
    :item-color="itemColor"
    :point="dicePoint"
  />
  <div v-else>
    <div
      class="badFruit"
      :style="{
        '--token-size': props.size,
      }"
    >
      <div></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.badFruit {
  font-size: var(--token-size);
  width: 6em;
  height: 6em;
  display: flex;
  justify-content: center;
  align-items: center;

  div {
    width: 4em;
    height: 4em;
    border-radius: 50%;
    background-color: rgb(0 0 0);
    border: 1px solid rgba(0 0 0 / 50%);
  }
}
</style>
