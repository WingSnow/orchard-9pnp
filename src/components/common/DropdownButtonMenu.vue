<script setup lang="ts">
import { ref } from 'vue'
import contrastTextColor from '../../utils/contrastTextColor'

const defaultColors = ['#69c0ff', '#40a9ff', '#1890ff', '#096dd9']

interface Item {
  key?: string | number
  icon: string
  color?: string
  text: string
  onClick?: () => void
}

const props = defineProps<{
  menu: Item[]
}>()

const menuItems = ref<Item[]>([])

const menuDisplay = ref(false)

let menuTransitioning = false

const onSwitch = async () => {
  if (menuTransitioning) {
    return
  }
  if (menuDisplay.value) {
    menuDisplay.value = false
    menuTransitioning = true
    while (menuItems.value.length > 0) {
      menuItems.value.pop()
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 180)
      })
    }
    menuTransitioning = false
  } else {
    menuDisplay.value = true
    menuItems.value.length = 0
    menuTransitioning = true
    for (const item of props.menu) {
      menuItems.value.push(item)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 250)
      })
    }
    menuTransitioning = false
  }
}
</script>

<template>
  <div class="dropdown-menu">
    <div class="dropdown-trigger" :class="{ open: menuDisplay }">
      <button type="button" @click="onSwitch">
        <ion-icon name="add-outline"></ion-icon>
      </button>
    </div>
    <div class="dropdown-item">
      <transition-group name="menu">
        <template
          v-for="(item, index) in menuItems"
          :key="item.key ?? `menu_${index}`"
        >
          <div
            class="item-container"
            :style="{
              top: `${3 * index + 1.5}rem`,
              'z-index': -1 * index,
              'background-color': item.color ?? defaultColors[index % 11],
            }"
          >
            <button
              type="button"
              :data-attr="item.text"
              :style="{
                color: contrastTextColor(
                  item.color ?? defaultColors[index % 5]
                ),
              }"
              @click="item.onClick"
            >
              <ion-icon :name="item.icon"></ion-icon>
            </button>
          </div>
        </template>
      </transition-group>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$size: 3rem;

@keyframes scale {
  0% {
    transform: scale(1);
  }
  50%,
  75% {
    transform: scale(3);
  }
  100% {
    opacity: 0;
  }
}

.dropdown-trigger {
  display: block;
  position: relative;
  z-index: 1;
  transition: all 1s;

  &.open {
    transform: rotateZ(405deg);
  }

  button {
    cursor: pointer;
    box-sizing: border-box;
    border: none;
    background-color: #003a8c;
    color: #fff;
    border-radius: 50%;
    font-size: larger;
    width: $size;
    height: $size;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.open::before {
    content: '';
    z-index: -1;
    pointer-events: none;
    display: block;
    position: absolute;
    width: $size;
    height: $size;
    border-radius: 50%;
    opacity: 0.7;
    background-color: #bae7ff;
    animation: scale 2s ease-out;
  }
}

.dropdown-item {
  .item-container {
    display: block;
    height: $size;
    width: $size;
    position: absolute;
    button {
      background-color: inherit;
      cursor: pointer;
      border: none;
      border-radius: 50%;
      font-size: larger;
      width: $size;
      height: $size;
      position: absolute;
      bottom: calc(-1 * $size / 2);
      left: 0;
    }

    button::before {
      content: attr(data-attr);
      background-color: inherit;
      font-size: initial;
      cursor: pointer;
      border: none;
      border-radius: calc($size / 2);
      line-height: $size;
      width: $size;
      height: $size;
      position: absolute;
      bottom: calc(-1 * $size / 2);
      top: 0;
      left: 0;
      z-index: -1;
      transition: all 0.5s ease-in-out;
      visibility: hidden;
      white-space: nowrap;
      overflow: hidden;
    }

    button:hover::before {
      visibility: visible;
      padding-left: calc($size / 2);
      width: calc($size * 3);
    }
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease-out;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
