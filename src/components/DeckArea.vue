<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed, nextTick } from 'vue'
import OCard from './OCard.vue'
import OToken from './OToken.vue'
import mainStore from '../stores/main'
import cardsConfig from '../config/configLoader'
import { message } from './common/popAlter/popAlter'

const store = mainStore()

/** 牌桌的大小，牌组有多少个单位长度 */
const deckSize = 100

/** 牌桌的一个单位长度等于多少px */
let deckUnit = 0

const tokenSize = ref(0)

let deckElement: HTMLElement

let draggableCardElement: HTMLElement

/** 果树类型——0: 红（苹果）；1：蓝（梅子）；2：黄（梨）；3：黑（坏果） */
type UnitType = 0 | 1 | 2 | 3

interface Unit {
  position: number
  type: UnitType
  /** 点数 */
  point: number
}
/** 牌桌上各已使用单元格的状态 */
const deckMap = reactive(new Map<number, Unit>())

// const draggableCardShow = ref(false)

interface Card {
  /** 牌面序号 */
  cardNum: number
  /** 牌的方向——0：未旋转；1：顺时针旋转90°；2：旋转180°；3：顺时针旋转270° */
  direction: number
  /**
   * 位置的id，牌的左上角所在的单元格的id
   *
   * 牌桌单元格的id从左上角开始逐行计数，第一格为0
   */
  position: number
}

type DraggableCard = Card & {
  show: boolean
}
/** 牌桌上的可移动卡牌的状态 */
const draggableCard = reactive<DraggableCard>({
  cardNum: 0,
  direction: 0,
  position: 0,
  show: false,
})

type PlacedCard = Card & {
  top: string
  left: string
}
/** 放置在牌桌上的牌 */
const placedCards = ref<PlacedCard[]>([])

/** 初始化可移动卡牌 */
const initDraggableCard = () => {
  // 初始化逻辑
  draggableCard.cardNum = 0
  draggableCard.direction = 0
  draggableCard.position = 0
  // 初始化显示
  draggableCardElement.style.left = '0'
  draggableCardElement.style.top = '0'
  draggableCardElement.style.transform = `rotateZ(0)`
}

/** 旋转可移动卡牌，顺时针旋转90° */
const switchDraggableCard = () => {
  draggableCard.direction += 1
  draggableCard.direction %= 4
  draggableCardElement.style.transform = `rotateZ(${
    draggableCard.direction * 90
  }deg)`
}

/**
 * 将卡牌相对于牌桌的偏移量转换为卡牌的位置(Card.position)
 * @param offset 卡牌相对于牌桌的偏移量（单位px）
 * @param direction 卡牌的方向(Card.direction)
 * @return 卡牌的位置
 */
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

/**
 * 将卡牌的位置(Card.position)转换为卡牌相对于牌桌的偏移量
 * @param position 卡牌的位置
 * @param direction 卡牌的方向(Card.direction)
 * @return 卡牌相对于牌桌的偏移量（单位px）
 */
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
/** 牌桌上的标记物 */
const tokens = computed(() => {
  const arr: Token[] = []
  deckMap.forEach((value, key) => {
    arr.push({
      position: key,
      left: `${(key % deckSize) * deckUnit}px`,
      top: `${Math.floor(key / deckSize) * deckUnit}px`,
      type: value.type,
      point: value.point,
    })
  })
  return arr
})

/** 结果移动后设置，隐藏可移动卡牌并关闭监听事件 */
const EndDrag = () => {
  draggableCard.show = false
  store.cardDraggable = false
  deckElement.onmousemove = null
  draggableCardElement.onmousedown = null
  document.onkeydown = null
}

/** 结果类型——0: 红（苹果）；1：蓝（梅子）；2：黄（梨）；3：黑（坏果）；-1：非法放置 */
type PlacedResultType = UnitType | -1
interface UnitCalcResult {
  position: number
  type: PlacedResultType
  point: number
  diff: number
}
/**
 * 计算放一张牌产生的结果
 * @returns 一个代表影响结果的单元格数组（position：受影响的单元格的id，type：影响后单元格的类型，point：影响后单元格的分数）
 */
const calcDeckByPlaceCard = (
  cardNum: number,
  direction: number,
  position: number
) => {
  const cardMap = new Map<number, Exclude<UnitType, 3>>()
  const cardConfig = cardsConfig.find((item) => item.id === cardNum)
  if (!cardConfig) {
    throw new Error(`cardConfig of id ${cardNum} not found`)
  }
  /**
   * 根据卡牌的方向，将原始牌面(牌面位置，果树类型)转换成(牌桌位置，果树类型）
   * 旋转角度为0时，卡牌矩阵为
   * [0 1]
   * [2 3]
   * [4 5]
   *
   * 旋转角度为90时，卡牌矩阵为
   * [4 2 0]
   * [5 3 1]
   *
   * 旋转角度为180时，卡牌矩阵为
   * [5 4]
   * [3 2]
   * [1 0]
   *
   * 旋转角度为270时，卡牌矩阵为
   * [1 3 5]
   * [0 2 4]
   */
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
    let type: PlacedResultType = 0
    let point = 0
    let diff = 0
    const deckItem = deckMap.get(key)
    if (!deckItem) {
      // 如果没有和已有的果树重叠
      type = value
      point = 0
      diff = 0
    } else {
      point = 0
      if (deckItem.type === value) {
        // 与相同类型的果树重叠
        type = value
        if (deckItem.point === 1) {
          // 如果下面的树上已有1点，则变成3点
          point = 3
          diff = 2
        } else if (deckItem.point === 3) {
          // 如果下面的树上已有3点，则变成6点
          point = 6
          diff = 3
        } else {
          // 如果下面的树上没有点数，则设置1点
          point = 1
          diff = 1
        }
      } else if (deckItem.type === 3) {
        // 一棵水果腐烂的树不能被另一棵树重叠
        type = -1
        point = 0
      } else {
        // 与不同类型的果树重叠，产生腐烂水果
        type = 3
        point = -3
        diff = -3 - deckItem.point
      }
    }
    result.push({
      position: key,
      type,
      point,
      diff,
    })
  })
  return result
}

const hoverTokens = ref<Token[]>([])

const setHoverTokens = (calcResults: UnitCalcResult[]) => {
  hoverTokens.value.length = 0
  let totalDiffScore = 0
  calcResults.forEach((value) => {
    totalDiffScore += value.diff
    hoverTokens.value.push({
      position: value.position,
      left: `${(value.position % deckSize) * deckUnit}px`,
      top: `${Math.floor(value.position / deckSize) * deckUnit}px`,
      type: value.type !== -1 ? value.type : 3,
      point: value.point,
    })
  })
  store.diffScore = totalDiffScore
}

/** 本局游戏中已产生坏果的个数，每局只能产生最多2个坏果 */
const placeBadCounter = ref(0)

/** 检查是否可以放置 */
const placableCheck = (calcResult: UnitCalcResult[]) => {
  // 一棵水果腐烂的树不能被另一棵树重叠
  const placeOnBadFruit = calcResult.find((item) => {
    return item.type === -1
  })
  if (placeOnBadFruit) {
    message({
      content: '一棵水果腐烂的树不能被另一棵树重叠',
      type: 'error',
      duration: 3,
    })
    return false
  }
  // 每局两次，你可以打出一张牌，让重叠的树的果实不与下面树的果实相匹配。
  const placeBad = calcResult.reduce((total, item) => {
    return total + (item.type === 3 ? 1 : 0)
  }, 0)
  if (placeBad + placeBadCounter.value > 2) {
    message({
      content:
        '每局你最多只能产生两个坏果（让重叠的树的果实不与下面树的果实相匹配）',
      type: 'error',
      duration: 3,
    })
    return false
  }
  // 卡片上必须至少有一棵树与果园中已有的一棵树重叠。
  const placeOnTree = calcResult.find((item) => {
    return item.point >= 1
  })
  if (!placeOnTree) {
    message({
      content: '卡片上必须至少有一棵树与果园中已有的一棵树重叠',
      type: 'error',
      duration: 3,
    })
    return false
  }
  return true
}

/**
 * （尝试）放置卡牌
 * @param cardNum 牌面序号
 * @param direction 卡牌方向
 * @param position 卡牌位置
 * @param force 是否强制放置（跳过检查），用于放置初始卡牌
 */
const placeCard = async (
  cardNum: number,
  direction: number,
  position: number,
  force?: boolean
) => {
  // 计算放置后的计算并检查能否放置
  const calcResult = calcDeckByPlaceCard(cardNum, direction, position)
  if (force || placableCheck(calcResult)) {
    let placeBad = 0
    // 遍历放置结果，更新牌桌
    calcResult.forEach((item) => {
      deckMap.set(item.position, {
        position: item.position,
        type: item.type as UnitType,
        point: item.point,
      })
      if (item.type === 3) {
        placeBad += 1
      }
    })
    // 增加产生坏果计数
    if (placeBad) {
      placeBadCounter.value += placeBad
    }

    // 更新渲染
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
    store.totalScore = totalScore
    // 等待牌桌渲染更新
    await nextTick()
    console.log(
      `play card ${cardNum} with direction ${direction} at postion ${position}`
    )
    return true
  }
  return false
}

// 监听进入出牌阶段
watch(
  () => store.status,
  (value) => {
    if (value === 2) {
      console.log('listen 2')
      // 设置可移动卡牌
      initDraggableCard()
      draggableCard.cardNum = store.draggableCardNum
      // 旋转可移动卡牌使其与手牌中的放置状态相同
      switchDraggableCard()
      draggableCard.show = true
      // 挂载监听器
      // 可移动卡牌跟随鼠标移动
      deckElement.onmousemove = (e) => {
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
        const calcResult = calcDeckByPlaceCard(
          draggableCard.cardNum,
          draggableCard.direction,
          draggableCard.position
        )
        setHoverTokens(calcResult)
      }
      // 按空格旋转卡牌，按Esc回到选牌阶段
      document.onkeydown = (e) => {
        if (e.code === 'Space') {
          switchDraggableCard()
        }
        if (e.code === 'Escape') {
          EndDrag()
          store.switchStatus(1, 'chance dragging')
        }
      }
      // 点击鼠标左键放置卡牌，如果放置成功，则进入出牌阶段
      draggableCardElement.onmousedown = async (e) => {
        if (e.button === 0) {
          const { cardNum, direction, position } = draggableCard
          if (await placeCard(cardNum, direction, position)) {
            EndDrag()
            store.switchStatus(3, 'placeCard')
          }
        }
      }
    }
  }
)

onMounted(async () => {
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

  // 放置初始卡牌
  await placeCard(store.draw() as number, 1, 5358, true)
})
</script>

<template>
  <div class="deck-container">
    <div id="deck">
      <div id="tokens">
        <template v-for="(token, index) in tokens" :key="`token_${index}`">
          <o-token
            v-show="token.type === 3 || token.point > 0"
            :size="`${tokenSize}px`"
            :type="token.type"
            :point="token.point"
            :style="{
              left: token.left,
              top: token.top,
            }"
          />
        </template>
      </div>
      <div v-show="store.status === 2" id="hoverTokens">
        <template
          v-for="(token, index) in hoverTokens"
          :key="`hoverToken_${index}`"
        >
          <o-token
            v-show="token.type === 3 || token.point > 0"
            :size="`${tokenSize}px`"
            :type="token.type"
            :point="token.point"
            :style="{
              left: token.left,
              top: token.top,
            }"
          />
        </template>
      </div>
      <o-card
        v-show="draggableCard.show"
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
