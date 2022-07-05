<script setup lang="ts">
import { onMounted, ref, computed, reactive, watch } from 'vue'
import OCard from './OCard.vue'
import OToken from './OToken.vue'
import mainStore from '../stores/main'
import { type Unit, type CalcResultUnit, deckSize } from '../stores/deck'
import { type Direction } from '../stores/card'

const store = mainStore()

/** 牌桌的一个单位长度等于多少px */
let deckUnit = 0

const tokenSize = ref(0)

let deckElement: HTMLElement

let draggableCardElement: HTMLElement

/** 放置在牌桌上的牌 */
const placedCards = computed(() => {
  const cardsInDeck = store.deck.cardsInDeck
  return cardsInDeck.map((item) => {
    const { id, data, direction, position } = item
    const { left, top } = positionToOffset(position, direction)
    return {
      id,
      data,
      direction,
      position,
      top: `${top}px`,
      left: `${left}px`,
    }
  })
})

interface DraggableCard {
  cardIndex: number
  direction: Direction
  position: number
  display: boolean
}

const draggableCard = reactive<DraggableCard>({
  cardIndex: 0,
  direction: 'top',
  position: 0,
  display: false,
})

/** 初始化可移动卡牌 */
const initDraggableCard = () => {
  const { pickedCard } = store
  if (!pickedCard) {
    return
  }
  store.transitionalScore = 0
  draggableCard.cardIndex = pickedCard.data.index
  draggableCard.direction = pickedCard.direction
  draggableCardElement.style.transform = transformDirectionToDeg(
    draggableCard.direction
  )

  // 初始化显示
  draggableCardElement.style.left = '0'
  draggableCardElement.style.top = '0'
  draggableCard.display = true
}

/**
 * 将卡牌相对于牌桌的偏移量转换为卡牌的位置(Card.position)
 * @param offset 卡牌相对于牌桌的偏移量（单位px）
 * @param direction 卡牌的方向(Card.direction)
 * @return 卡牌的位置
 */
const offsetToPosition = (
  offset: { left: number; top: number },
  direction: Direction
) => {
  let { left, top } = offset
  if (direction === 'left' || direction === 'right') {
    left -= deckUnit / 2
    top += deckUnit / 2
  }
  const normalize = {
    left: Math.round(left / deckUnit),
    top: Math.round(top / deckUnit),
  }
  return normalize.top * deckSize + normalize.left
}

/**
 * 将卡牌的位置(Card.position)转换为卡牌相对于牌桌的偏移量
 * @param position 卡牌的位置
 * @param direction 卡牌的方向(Card.direction)
 * @return 卡牌相对于牌桌的偏移量（单位px）
 */
const positionToOffset = (position: number, direction: Direction) => {
  const base = {
    left: (position % deckSize) * deckUnit,
    top: Math.floor(position / deckSize) * deckUnit,
  }
  if (direction === 'left' || direction === 'right') {
    base.left += deckUnit / 2
    base.top -= deckUnit / 2
  }
  return base
}

type Token = Unit & {
  top: string
  left: string
}
/** 牌桌上的标记物 */
const tokens = computed(() => {
  const arr: Token[] = []
  store.deck.units.forEach((item) => {
    const { position, type, score } = item
    arr.push({
      position,
      left: `${(position % deckSize) * deckUnit}px`,
      top: `${Math.floor(position / deckSize) * deckUnit}px`,
      type: type,
      score,
    })
  })
  return arr
})

/** 结果移动后设置，隐藏可移动卡牌并关闭监听事件 */
const EndDrag = () => {
  hoverTokens.value.length = 0
  deckElement.onmousemove = null
  draggableCardElement.onmousedown = null
  document.onkeydown = null
  draggableCard.display = false
}

const hoverTokens = ref<Token[]>([])

const setHoverTokens = (calcResults: CalcResultUnit[]) => {
  hoverTokens.value.length = 0
  let totalDiffScore = 0
  calcResults.forEach((value) => {
    totalDiffScore += value.diffScore
    hoverTokens.value.push({
      position: value.position,
      left: `${(value.position % deckSize) * deckUnit}px`,
      top: `${Math.floor(value.position / deckSize) * deckUnit}px`,
      type: value.type !== 'never' ? value.type : 'rot',
      score: value.score,
    })
  })

  store.transitionalScore = totalDiffScore
}

const transformDirectionToDeg = (direction?: Direction) => {
  switch (direction) {
    case 'top':
      return 'rotateZ(0deg)'
    case 'right':
      return 'rotateZ(90deg)'
    case 'down':
      return 'rotateZ(180deg)'
    case 'left':
      return 'rotateZ(270deg)'
    default:
      return ''
  }
}

watch(
  () => store.status,
  (newValue: GameStatus) => {
    if (newValue === 'play') {
      // 设置可移动卡牌
      initDraggableCard()
      // 挂载监听器
      // 可移动卡牌跟随鼠标移动
      let hoverTimer: number | undefined
      deckElement.onmousemove = (e) => {
        if (!hoverTimer) {
          clearTimeout(hoverTimer)
        }
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
        // 显示预估放置结果
        hoverTimer = setTimeout(() => {
          const pickedCard = store.pickedCard
          if (pickedCard) {
            pickedCard.position = draggableCard.position
            const calcResult = store.deck.calcDeckByPlaceCard(pickedCard)
            setHoverTokens(calcResult)
          }
        }, 200)
      }
      // 按空格旋转卡牌，按Esc回到选牌阶段
      document.onkeydown = (e) => {
        if (e.code === 'Space') {
          draggableCard.direction = store.pickedCard!.rotate()
          hoverTimer = setTimeout(() => {
            const pickedCard = store.pickedCard
            if (pickedCard) {
              pickedCard.position = draggableCard.position
              const calcResult = store.deck.calcDeckByPlaceCard(pickedCard)
              setHoverTokens(calcResult)
            }
          }, 200)
        }
        if (e.code === 'Escape') {
          store.unpick()
          EndDrag()
        }
      }
      // 点击鼠标左键放置卡牌，如果放置成功，则进入出牌阶段
      draggableCardElement.onmousedown = (e) => {
        if (e.button === 0) {
          store.pickedCard!.position = draggableCard.position
          if (store.placeCard()) {
            EndDrag()
          }
        }
      }
    }
  }
)

onMounted(() => {
  // 设置DOM元素
  const draggableEle = document.getElementById('draggable-card')
  const deckEle = document.getElementById('deck')
  if (!draggableEle) {
    throw new Error('OCard with id "draagable-card" not found')
  }
  if (!deckEle) {
    throw new Error('Element with id "deck" not found')
  }
  draggableCardElement = draggableEle
  deckElement = deckEle

  deckUnit = deckElement.clientWidth / 100
  tokenSize.value = deckUnit / 6
  // 移动牌桌到中心位置
  deckElement.style.top = `${-deckElement.clientWidth / 2 - 30}px`
  deckElement.style.left = `${-deckElement.clientHeight / 2}px`
  deckElement.onmousedown = (e) => {
    // 按住右键移动牌桌
    if (e.button === 2) {
      const curMousemoveHandler = deckElement.onmousemove
      deckElement.style.cursor = 'move'
      const distX = e.pageX - deckElement.offsetLeft
      const distY = e.pageY - deckElement.offsetTop
      deckElement.onmousemove = (e2) => {
        deckElement.style.left = `${e2.pageX - distX}px`
        deckElement.style.top = `${e2.pageY - distY}px`
      }
      deckElement.onmouseup = () => {
        deckElement.onmousemove = curMousemoveHandler
        deckElement.onmouseup = null
        deckElement.style.cursor = 'auto'
      }
    }
  }
  // 屏蔽牌桌默认右键
  deckElement.oncontextmenu = () => {
    return false
  }
})
</script>

<template>
  <div class="deck-container">
    <div id="deck">
      <div id="tokens">
        <template v-for="(token, index) in tokens" :key="`token_${index}`">
          <o-token
            v-show="token.type === 'rot' || token.score > 0"
            :size="`${tokenSize}px`"
            :type="token.type"
            :point="token.score"
            :style="{
              left: token.left,
              top: token.top,
            }"
          />
        </template>
      </div>
      <div v-show="store.status === 'play'" id="hoverTokens">
        <template
          v-for="(token, index) in hoverTokens"
          :key="`hoverToken_${index}`"
        >
          <o-token
            v-show="token.type === 'rot' || token.score > 0"
            :size="`${tokenSize}px`"
            :type="token.type"
            :point="token.score"
            :style="{
              left: token.left,
              top: token.top,
            }"
          />
        </template>
      </div>
      <o-card
        v-show="draggableCard.display"
        id="draggable-card"
        class="card"
        :card-index="draggableCard?.cardIndex"
        :style="{
          transform: transformDirectionToDeg(draggableCard?.direction),
        }"
      />
      <div v-for="(item, index) in placedCards" :key="index">
        <o-card
          class="card"
          :card-index="item.data.index"
          :style="{
            left: item.left,
            top: item.top,
            transform: transformDirectionToDeg(item.direction),
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$boxSize: 72px;

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
        rgba(0 0 0 / 0) 3%,
        rgba(0 0 0 / 0) 49%,
        rgba(0 0 0 / 30%) 50%,
        rgba(0 0 0 / 0) 51%
      ),
      linear-gradient(
        rgba(0 0 0 / 60%) 0,
        rgba(0 0 0 / 0) 3%,
        rgba(0 0 0 / 0) 49%,
        rgba(0 0 0 / 30%) 50%,
        rgba(0 0 0 / 0) 51%
      );
    background-size: $boxSize $boxSize;
  }
}

#draggable-card {
  z-index: 100;
  opacity: 0.8;
}

.card {
  position: absolute;
  height: calc($boxSize * 3);
  width: calc($boxSize * 2);
  box-shadow: 2px 2px 4px rgb(0 0 0), -2px -2px 4px rgb(0 0 0);
}

#tokens,
#hoverTokens {
  position: relative;
  z-index: 90;

  > div {
    position: absolute;
  }
}

#hoverTokens {
  z-index: 110;
  opacity: 0.6;
  pointer-events: none;
}
</style>
