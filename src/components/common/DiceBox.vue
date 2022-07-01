<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  point: 1 | 2 | 3 | 4 | 5 | 6
  diceColor?: string
  itemColor?: string
  diceSize?: string
}

const rotateMap = [
  { x: 0, y: 0 },
  { x: 0, y: 90 },
  { x: -90, y: 0 },
  { x: 90, y: 0 },
  { x: 0, y: -90 },
  { x: 0, y: 180 },
]

const props = withDefaults(defineProps<Props>(), {
  diceColor: 'rgb(0 0 255)',
  itemColor: 'rgb(255 0 0)',
  diceSize: '1vh',
})

const rotateX = computed(() => {
  return rotateMap[props.point - 1].x
})
const rotateY = computed(() => {
  return rotateMap[props.point - 1].y
})
</script>

<template>
  <div
    class="container"
    :style="{
      '--dice-color': diceColor,
      '--item-color': itemColor,
      '--dice-size': diceSize,
    }"
  >
    <div
      class="dice"
      :style="{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }"
    >
      <div class="box box1">
        <span class="item"></span>
      </div>
      <div class="box box2">
        <span class="item"></span>
        <span class="item"></span>
      </div>
      <div class="box box3">
        <span class="item"></span>
        <span class="item"></span>
        <span class="item"></span>
      </div>
      <div class="box box4">
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
      </div>
      <div class="box box5">
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
        <div class="row">
          <span class="item"></span>
        </div>
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
      </div>
      <div class="box box6">
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
        <div class="row">
          <span class="item"></span>
          <span class="item"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  font-size: var(--dice-size);
  perspective: 800px;
  perspective-origin: 50% 50%;
  padding: 1em;
}

.dice {
  box-sizing: border-box;
  width: 4em;
  height: 4em;
  margin: 0 auto;
  transform-style: preserve-3d;
  transition: all 1s ease-in-out;
  position: relative;
}

.box {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0.5em;
  border-radius: 10%;
  background: var(--dice-color);
  display: flex;
  border: 1px solid rgba(0 0 0 / 50%);
}

.item {
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  border-radius: 50%;
  background: var(--item-color);
}

.box1 {
  justify-content: center;
  align-items: center;
}

.box2 {
  justify-content: space-between;
  .item:nth-child(2) {
    align-self: flex-end;
  }
}

.box3 {
  justify-content: space-between;

  .item:nth-child(2) {
    align-self: center;
  }

  .item:nth-child(3) {
    align-self: flex-end;
  }
}

.box4,
.box5,
.box6 {
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
}

.row {
  display: flex;
  flex-basis: 100%;
  justify-content: space-between;
}

.box5 .row:nth-child(2) {
  justify-content: center;
}

.dice .box1 {
  transform: rotateY(0) translateZ(2em);
}

.dice .box2 {
  transform: rotateY(-90deg) translateZ(2em);
}

.dice .box3 {
  transform: rotateX(90deg) translateZ(2em);
}

.dice .box4 {
  transform: rotateX(-90deg) translateZ(2em);
}

.dice .box5 {
  transform: rotateY(90deg) translateZ(2em);
}

.dice .box6 {
  transform: rotateY(180deg) translateZ(2em);
}
</style>
