<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed } from 'vue'
import OCard from './OCard.vue'
import mainStore from '../stores/main'
import cardsConfig from '../config/configLoader'

const deckSize = 100

const store = mainStore()

let deckContainerElement: HTMLElement

let deckElement: HTMLElement

let deckUnit = 0

interface Unit {
  // 0: 红 1：蓝 2：黄 3：黑（坏果）
  type: number
  point: number
}
const deckMap = reactive(new Map<number, Unit>())

const draggableCardShow = ref(false)

interface Card {
  cardNum: number
  direction: number
  position: number
}

let draggableCardElement: HTMLElement

const draggableCard = reactive<Card>({
  cardNum: 0,
  direction: 0,
  position: 0,
})

type PlacedCard = Card & {
  top: string
  left: string
}

const placedCards = ref<PlacedCard[]>([])

const switchDraggableCard = () => {
  draggableCard.direction += 1
  draggableCard.direction %= 4
  draggableCardElement.style.transform = `rotateZ(${
    draggableCard.direction * 90
  }deg)`
}

const offsetToPosition = (
  offset: { left: number; top: number },
  direction: number
) => {
  let { left, top } = offset
  if (direction % 2 !== 0) {
    left -= deckUnit / 2
    top += deckUnit / 2
  }
  const normalize = {
    left: Math.round(left / deckUnit),
    top: Math.round(top / deckUnit),
  }
  return normalize.top * deckSize + normalize.left
}

const positionToOffset = (position: number, direction: number) => {
  const base = {
    left: (position % deckSize) * deckUnit,
    top: Math.floor(position / deckSize) * deckUnit,
  }
  if (direction % 2 !== 0) {
    base.left += deckUnit / 2
    base.top -= deckUnit / 2
  }
  return base
}

type Token = Unit & {
  top: string
  left: string
}
const tokens = computed(() => {
  const arr: Token[] = []
  deckMap.forEach((value, key) => {
    arr.push({
      left: `${(key % deckSize) * deckUnit}px`,
      top: `${Math.floor(key / deckSize) * deckUnit}px`,
      type: value.type,
      point: value.point,
    })
  })
  return arr
})

const initDraggableCard = () => {
  draggableCard.cardNum = 0
  draggableCard.direction = 0
  draggableCard.position = 0
  draggableCardElement.style.left = '0'
  draggableCardElement.style.top = '0'
  draggableCardElement.style.transform = `rotateZ(0)`
}

const EndDrag = () => {
  draggableCardShow.value = false
  store.cardDraggable = false
  deckContainerElement.onmousemove = null
  draggableCardElement.onmousedown = null
  document.onkeydown = null
}

interface UnitCalcResult {
  position: number
  type: number
  point: number
}
/**
 * 旋转角度为0时，卡牌矩阵为
 * [0 1]
 * [2 3]
 * [4 5]
 * 旋转角度为90时，卡牌矩阵为
 * [4 2 0]
 * [5 3 1]
 * 旋转角度为180时，卡牌矩阵为
 * [5 4]
 * [3 2]
 * [1 0]
 * 旋转角度为270时，卡牌矩阵为
 * [1 3 5]
 * [0 2 4]
 */
const calcDeckByPlaceCard = (
  cardNum: number,
  direction: number,
  position: number
) => {
  // position, type
  const cardMap = new Map<number, number>()
  const cardConfig = cardsConfig.find((item) => item.id === cardNum)
  if (!cardConfig) {
    throw new Error(`cardConfig of id ${cardNum} not found`)
  }
  if (direction === 0) {
    cardMap.set(position + deckSize * 0 + 0, cardConfig.clusters[0])
    cardMap.set(position + deckSize * 0 + 1, cardConfig.clusters[1])
    cardMap.set(position + deckSize * 1 + 0, cardConfig.clusters[2])
    cardMap.set(position + deckSize * 1 + 1, cardConfig.clusters[3])
    cardMap.set(position + deckSize * 2 + 0, cardConfig.clusters[4])
    cardMap.set(position + deckSize * 2 + 1, cardConfig.clusters[5])
  } else if (direction === 1) {
    cardMap.set(position + deckSize * 0 + 0, cardConfig.clusters[4])
    cardMap.set(position + deckSize * 0 + 1, cardConfig.clusters[2])
    cardMap.set(position + deckSize * 0 + 2, cardConfig.clusters[0])
    cardMap.set(position + deckSize * 1 + 0, cardConfig.clusters[5])
    cardMap.set(position + deckSize * 1 + 1, cardConfig.clusters[3])
    cardMap.set(position + deckSize * 1 + 2, cardConfig.clusters[1])
  } else if (direction === 2) {
    cardMap.set(position + deckSize * 0 + 0, cardConfig.clusters[5])
    cardMap.set(position + deckSize * 0 + 1, cardConfig.clusters[4])
    cardMap.set(position + deckSize * 1 + 0, cardConfig.clusters[3])
    cardMap.set(position + deckSize * 1 + 1, cardConfig.clusters[2])
    cardMap.set(position + deckSize * 2 + 0, cardConfig.clusters[1])
    cardMap.set(position + deckSize * 2 + 1, cardConfig.clusters[0])
  } else if (direction === 3) {
    cardMap.set(position + deckSize * 0 + 0, cardConfig.clusters[1])
    cardMap.set(position + deckSize * 0 + 1, cardConfig.clusters[3])
    cardMap.set(position + deckSize * 0 + 2, cardConfig.clusters[5])
    cardMap.set(position + deckSize * 1 + 0, cardConfig.clusters[0])
    cardMap.set(position + deckSize * 1 + 1, cardConfig.clusters[2])
    cardMap.set(position + deckSize * 1 + 2, cardConfig.clusters[4])
  }
  const result: UnitCalcResult[] = []
  cardMap.forEach((value, key) => {
    let type = 0
    let point = 0
    const deckItem = deckMap.get(key)
    if (deckItem) {
      point = 0
      if (deckItem.type === value) {
        type = value
        if (deckItem.point === 1) {
          point = 3
        } else if (deckItem.point === 3) {
          point = 6
        } else {
          point = 1
        }
      } else if (deckItem.type === 3) {
        // 一棵水果腐烂的树不能被另一棵树重叠
        type = 3
        point = -1
      } else {
        type = 3
        point = -3
      }
    } else {
      type = value
      point = 0
    }
    result.push({
      position: key,
      type,
      point,
    })
  })
  return result
}

const placeBadCounter = ref(0)

const placableCheck = (calcResult: UnitCalcResult[]) => {
  // 一棵水果腐烂的树不能被另一棵树重叠
  const placeOnBadFruit = calcResult.find((item) => {
    return item.point === -1
  })
  if (placeOnBadFruit) {
    console.error('一棵水果腐烂的树不能被另一棵树重叠')
    alert('一棵水果腐烂的树不能被另一棵树重叠')
    return false
  }
  // 每局两次，你可以打出一张牌，让重叠的树的果实不与下面树的果实相匹配。
  const placeBad = calcResult.find((item) => {
    return item.type === 3
  })
  if (placeBad && placeBadCounter.value >= 2) {
    console.error(
      '每局两次，你可以打出一张牌，让重叠的树的果实不与下面树的果实相匹配。'
    )
    alert(
      '每局两次，你可以打出一张牌，让重叠的树的果实不与下面树的果实相匹配。'
    )
    return false
  }
  // 卡片上必须至少有一棵树与果园中已有的一棵树重叠。
  const placeOnTree = calcResult.find((item) => {
    return item.point >= 1
  })
  if (!placeOnTree) {
    console.error('卡片上必须至少有一棵树与果园中已有的一棵树重叠。')
    alert('卡片上必须至少有一棵树与果园中已有的一棵树重叠。')
    return false
  }
  return true
}

const placeCard = (
  cardNum: number,
  direction: number,
  position: number,
  force?: boolean
) => {
  const calcResult = calcDeckByPlaceCard(cardNum, direction, position)
  if (force || placableCheck(calcResult)) {
    let placeBad = false
    calcResult.forEach((item) => {
      deckMap.set(item.position, {
        type: item.type,
        point: item.point,
      })
      if (item.type === 3) {
        placeBad = true
      }
    })

    if (placeBad) {
      placeBadCounter.value += 1
    }

    // console.log(deckMap)

    const { left, top } = positionToOffset(position, direction)

    placedCards.value.push({
      cardNum,
      direction,
      position,
      left: `${left}px`,
      top: `${top}px`,
    })
    let totalScore = 0
    deckMap.forEach((item) => {
      totalScore += item.point
    })
    console.log(
      `play card ${cardNum} with direction ${direction} at postion ${position}`
    )
    store.totalScore = totalScore
    store.status = 3
  }
}

watch(
  () => store.cardDraggable,
  (value) => {
    if (value) {
      initDraggableCard()
      draggableCard.cardNum = store.draggableCardNum
      switchDraggableCard()
      draggableCardShow.value = true
      deckContainerElement.onmousemove = (e) => {
        const left =
          e.pageX -
          (draggableCardElement.clientWidth / 2 + deckElement.offsetLeft)
        const top =
          e.pageY -
          (draggableCardElement.clientHeight / 2 + deckElement.offsetTop)
        draggableCard.position = offsetToPosition(
          { left, top },
          draggableCard.direction
        )
        draggableCardElement.style.left = `${left}px`
        draggableCardElement.style.top = `${top}px`
      }
      document.onkeydown = (e) => {
        if (e.code === 'Space') {
          switchDraggableCard()
        }
        if (e.code === 'Escape') {
          EndDrag()
        }
      }
      draggableCardElement.onmousedown = (e) => {
        if (e.button === 0) {
          const { cardNum, direction, position } = draggableCard
          placeCard(cardNum, direction, position)

          EndDrag()
        }
      }
    }
  }
)

onMounted(() => {
  const draggableEle = document.getElementById('draggable-card')
  const deckContainerEle = document.getElementById('deck-area')
  if (!draggableEle) {
    throw new Error('OCard with id "draaagable-card" not found')
  }
  if (!deckContainerEle) {
    throw new Error('OCard with id "draaagable-card" not found')
  }
  draggableCardElement = draggableEle
  deckContainerElement = deckContainerEle

  deckElement = document.getElementById('deck') as HTMLElement
  deckUnit = deckElement.clientWidth / 100
  deckElement.style.top = `${-deckElement.clientWidth / 2 - 30}px`
  deckElement.style.left = `${-deckElement.clientHeight / 2}px`
  deckElement.onmousedown = (e) => {
    // 右键
    if (e.button === 2) {
      deckElement.style.cursor = 'move'
      const distX = e.pageX - deckElement.offsetLeft
      const distY = e.pageY - deckElement.offsetTop
      deckElement.onmousemove = (e2) => {
        deckElement.style.left = `${e2.pageX - distX}px`
        deckElement.style.top = `${e2.pageY - distY}px`
      }
      deckElement.onmouseup = () => {
        deckElement.onmousemove = null
        deckElement.onmouseup = null
        deckElement.style.cursor = 'auto'
      }
    }
  }
  deckElement.oncontextmenu = () => {
    return false
  }

  placeCard(store.draw() as number, 1, 5255, true)
})
</script>

<template>
  <div class="deck-container">
    <div id="deck">
      <div v-for="(item, index) in tokens" :key="index">
        <div
          v-show="item.type === 3 || item.point > 0"
          class="token"
          :class="{
            apple: item.type === 0,
            plum: item.type === 1,
            pear: item.type === 2,
            rot: item.type === 3,
          }"
          :style="{
            left: item.left,
            top: item.top,
          }"
        >
          {{ item.point > 0 ? item.point : '' }}
        </div>
      </div>
      <o-card
        v-show="draggableCardShow"
        id="draggable-card"
        class="card"
        :card-num="draggableCard.cardNum"
      ></o-card>
      <div v-for="(item, index) in placedCards" :key="index">
        <o-card
          class="card"
          :card-num="item.cardNum"
          :style="{
            left: item.left,
            top: item.top,
            transform: `rotateZ(${item.direction * 90}deg)`,
          }"
        ></o-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$boxSize: calc((100vw - 16px) / 20);

.deck-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(0 0 0);

  #deck {
    position: relative;
    transform: scale(1);
    width: calc($boxSize * 100);
    height: calc($boxSize * 100);
    background-image: linear-gradient(
        90deg,
        rgba(0 0 0 / 60%) 0,
        rgba(0 0 0 / 0) 2%
      ),
      linear-gradient(rgba(0 0 0 / 60%) 0, rgba(0 0 0 / 0) 2%);
    background-size: $boxSize $boxSize;
  }
}

#draggable-card {
  z-index: 100;
}

.card {
  position: absolute;
  height: calc($boxSize * 3);
  width: calc($boxSize * 2);
}

.token {
  width: calc($boxSize / 2);
  height: calc($boxSize / 2);
  position: absolute;
  transform: translate(calc($boxSize / 4), calc($boxSize / 4));
  text-align: center;
  line-height: calc($boxSize / 2);
  z-index: 99;

  &.apple {
    background-color: red;
    color: white;
  }

  &.pear {
    background-color: yellow;
  }

  &.plum {
    background-color: blue;
    color: white;
  }

  &.rot {
    background-color: black;
  }
}
</style>
